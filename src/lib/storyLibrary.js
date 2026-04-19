import collections from 'virtual:webreader-collections';

const storyModules2 = import.meta.glob('/stories/*/*/content.md', { query: '?raw', import: 'default' });
const storyModules3 = import.meta.glob('/stories/*/*/*/content.md', { query: '?raw', import: 'default' });
const adaptionModules = import.meta.glob('/stories/*/*/adaptions/*/content.md', { query: '?raw', import: 'default' });
const storyAudioModules = import.meta.glob('/stories/*/*/audio.mp3', { query: '?url', import: 'default' });
// Eager so cover URLs are available synchronously alongside the story metadata.
// Keyed by file path; we map to story id in buildCoverMap() below.
const storyCoverModules2 = import.meta.glob(
  '/stories/*/*/cover.{svg,png,jpg,jpeg,webp}',
  { query: '?url', import: 'default', eager: true },
);
const storyCoverModules3 = import.meta.glob(
  '/stories/*/*/*/cover.{svg,png,jpg,jpeg,webp}',
  { query: '?url', import: 'default', eager: true },
);

const storyModuleMap = { ...storyModules2, ...storyModules3 };
const storyCoverMap = buildCoverMap({ ...storyCoverModules2, ...storyCoverModules3 });
const storyCache = new Map();
const storyMetadataCache = new Map();
const adaptionCache = new Map();
const audioCache = new Map();

export function buildCoverMap(modules) {
  const map = {};
  for (const [path, url] of Object.entries(modules)) {
    // /stories/{source}/{slug}/cover.ext            → 4 parts after filter
    // /stories/{source}/{directory}/{slug}/cover.ext → 5 parts after filter
    const partsNoEmpty = path.split('/').filter(Boolean);
    if (partsNoEmpty.length === 4) {
      map[`${partsNoEmpty[1]}/${partsNoEmpty[2]}`] = url;
    } else if (partsNoEmpty.length === 5) {
      map[`${partsNoEmpty[1]}/${partsNoEmpty[2]}/${partsNoEmpty[3]}`] = url;
    }
  }
  return map;
}

const collectionStoryMap = new Map();
const collectionAdaptionMap = new Map();
const collectionCoverMap = new Map();
const collectionIllustrationsMap = new Map();
for (const pkg of collections) {
  if (!pkg || !pkg.manifest || !pkg.stories) continue;
  const { manifest, stories, covers = {}, illustrations, adaptions: pkgAdaptions = {} } = pkg;
  const source = manifest.id;
  if (illustrations && typeof illustrations === 'object') {
    collectionIllustrationsMap.set(source, {
      opening: typeof illustrations.opening === 'string' ? illustrations.opening : null,
      ending: typeof illustrations.ending === 'string' ? illustrations.ending : null,
      ornament: typeof illustrations.ornament === 'string' ? illustrations.ornament : null,
    });
  }
  for (const entry of manifest.stories || []) {
    const slug = entry.slug;
    const raw = stories[slug];
    if (typeof raw !== 'string') continue;
    const id = `${source}/${slug}`;
    collectionStoryMap.set(id, {
      id,
      source,
      slug,
      raw,
      sourceLabel: manifest.label || source,
      titleOverride: entry.title || null,
    });
    if (typeof covers[slug] === 'string') {
      collectionCoverMap.set(id, covers[slug]);
    }
    const slugAdaptions = pkgAdaptions[slug];
    if (slugAdaptions && typeof slugAdaptions === 'object') {
      const declared = Array.isArray(entry.adaptions) ? entry.adaptions : [];
      const labelByName = new Map(declared.map((a) => [a.name, a.label]));
      const parsed = Object.entries(slugAdaptions)
        .filter(([, adaptionRaw]) => typeof adaptionRaw === 'string')
        .map(([name, adaptionRaw]) => {
          const fmMatch = adaptionRaw.match(/^---\n([\s\S]*?)\n---\n/);
          const fmBlock = fmMatch ? fmMatch[1] : '';
          const adaptionNameMatch = fmBlock.match(/^adaption:\s*"(.+)"$/m);
          const titleMatch = fmBlock.match(/^title:\s*"(.+)"$/m);
          const afterFm = fmMatch ? adaptionRaw.slice(fmMatch[0].length) : adaptionRaw;
          const content = afterFm.replace(/^\*\*[^\n]*\*\*\n\n/, '').trimEnd();
          return {
            adaptionName: labelByName.get(name) || (adaptionNameMatch ? adaptionNameMatch[1] : name),
            title: titleMatch ? titleMatch[1] : null,
            content,
          };
        });
      if (parsed.length > 0) collectionAdaptionMap.set(id, parsed);
    }
  }
}

function parseStoryPath(path) {
  const parts = path.split('/');
  if (parts.length === 6) {
    const source = parts[2];
    const directory = parts[3];
    const slug = parts[4];
    return { source, directory, slug };
  }

  const source = parts[2];
  const directory = null;
  const slug = parts[3];
  return { source, directory, slug };
}

function fallbackTitleFromSlug(slug) {
  return slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\p{L}/gu, (c) => c.toUpperCase());
}

function parseFrontmatter(raw, { slug, defaultSourceLabel, titleOverride }) {
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const fmBlock = fmMatch ? fmMatch[1] : '';
  const titleMatch = fmBlock.match(/^title:\s*"(.+)"$/m);
  const title = titleOverride || (titleMatch ? titleMatch[1] : fallbackTitleFromSlug(slug));
  const sourceLabelMatch = fmBlock.match(/^source:\s*"(.+)"$/m);
  const sourceLabel = defaultSourceLabel || (sourceLabelMatch ? sourceLabelMatch[1] : null);
  const wordCountMatch = fmBlock.match(/^wordCount:\s*(\d+)$/m);
  const wordCount = wordCountMatch ? parseInt(wordCountMatch[1], 10) : null;
  const ageMinMatch = fmBlock.match(/^ageMin:\s*(\d+)$/m);
  const ageMin = ageMinMatch ? parseInt(ageMinMatch[1], 10) : null;
  const ageMaxMatch = fmBlock.match(/^ageMax:\s*(\d+)$/m);
  const ageMax = ageMaxMatch ? parseInt(ageMaxMatch[1], 10) : null;
  const afterFm = fmMatch ? raw.slice(fmMatch[0].length) : raw;
  const content = afterFm.replace(/^#[^\n]*\n\n/, '').trimEnd();
  return { title, sourceLabel, wordCount, ageMin, ageMax, content };
}

export function parseStoryRaw(path, raw, coverMap = storyCoverMap) {
  const { source, directory, slug } = parseStoryPath(path);
  const { title, sourceLabel, wordCount, ageMin, ageMax, content } = parseFrontmatter(raw, {
    slug,
    defaultSourceLabel: null,
    titleOverride: null,
  });
  const id = directory ? `${source}/${directory}/${slug}` : `${source}/${slug}`;
  return {
    id,
    title,
    content,
    source,
    directory,
    sourceLabel: sourceLabel || source,
    wordCount,
    ageMin,
    ageMax,
    coverUrl: coverMap[id] ?? null,
  };
}

function parseCollectionStory(entry) {
  const { id, source, slug, raw, sourceLabel, titleOverride } = entry;
  const { title, wordCount, ageMin, ageMax, content } = parseFrontmatter(raw, {
    slug,
    defaultSourceLabel: sourceLabel,
    titleOverride,
  });
  return {
    id,
    title,
    content,
    source,
    directory: null,
    sourceLabel,
    wordCount,
    ageMin,
    ageMax,
    coverUrl: collectionCoverMap.get(id) ?? null,
  };
}

export function getStoryIndex() {
  const fileStories = Object.keys(storyModuleMap).map((path) => {
    const { source, directory, slug } = parseStoryPath(path);
    const id = directory ? `${source}/${directory}/${slug}` : `${source}/${slug}`;
    return {
      id,
      title: fallbackTitleFromSlug(slug),
      source,
      directory,
      sourceLabel: source,
      wordCount: null,
      ageMin: null,
      ageMax: null,
      coverUrl: storyCoverMap[id] ?? null,
    };
  });

  const collectionStories = Array.from(collectionStoryMap.values()).map((entry) => ({
    id: entry.id,
    title: entry.titleOverride || fallbackTitleFromSlug(entry.slug),
    source: entry.source,
    directory: null,
    sourceLabel: entry.sourceLabel,
    wordCount: null,
    ageMin: null,
    ageMax: null,
    coverUrl: collectionCoverMap.get(entry.id) ?? null,
  }));

  return [...fileStories, ...collectionStories].sort((a, b) => a.title.localeCompare(b.title, 'de'));
}

export function getCollectionIndex() {
  return collections
    .filter((pkg) => pkg && pkg.manifest)
    .map((pkg) => ({
      id: pkg.manifest.id,
      label: pkg.manifest.label || pkg.manifest.id,
      description: pkg.manifest.description || '',
      locale: pkg.manifest.locale || null,
      storyCount: Array.isArray(pkg.manifest.stories) ? pkg.manifest.stories.length : 0,
    }));
}

export async function loadStoryById(storyId) {
  if (storyCache.has(storyId)) return storyCache.get(storyId);

  if (collectionStoryMap.has(storyId)) {
    const story = parseCollectionStory(collectionStoryMap.get(storyId));
    storyCache.set(storyId, story);
    storyMetadataCache.set(storyId, {
      id: story.id,
      title: story.title,
      source: story.source,
      directory: story.directory,
      sourceLabel: story.sourceLabel,
      wordCount: story.wordCount,
      ageMin: story.ageMin,
      ageMax: story.ageMax,
      coverUrl: story.coverUrl,
    });
    return story;
  }

  const match = Object.entries(storyModuleMap).find(([path]) => {
    const { source, directory, slug } = parseStoryPath(path);
    const id = directory ? `${source}/${directory}/${slug}` : `${source}/${slug}`;
    return id === storyId;
  });

  if (!match) return null;

  const [path, loader] = match;
  const raw = await loader();
  const story = parseStoryRaw(path, raw);

  storyCache.set(storyId, story);
  storyMetadataCache.set(storyId, {
    id: story.id,
    title: story.title,
    source: story.source,
    directory: story.directory,
    sourceLabel: story.sourceLabel,
    wordCount: story.wordCount,
    ageMin: story.ageMin,
    ageMax: story.ageMax,
    coverUrl: story.coverUrl,
  });

  return story;
}

export async function loadStoryMetadataById(storyId) {
  if (storyMetadataCache.has(storyId)) return storyMetadataCache.get(storyId);
  const story = await loadStoryById(storyId);
  if (!story) return null;

  return {
    id: story.id,
    title: story.title,
    source: story.source,
    directory: story.directory,
    sourceLabel: story.sourceLabel,
    wordCount: story.wordCount,
    ageMin: story.ageMin,
    ageMax: story.ageMax,
    coverUrl: story.coverUrl,
  };
}

export async function loadAdaptionsByStoryId(storyId) {
  if (adaptionCache.has(storyId)) return adaptionCache.get(storyId);

  const fileAdaptions = await Promise.all(
    Object.entries(adaptionModules)
      .filter(([path]) => {
        const parts = path.split('/');
        const source = parts[parts.length - 5];
        const parentSlug = parts[parts.length - 4];
        return `${source}/${parentSlug}` === storyId;
      })
      .map(async ([path, loader]) => {
        const raw = await loader();
        const parts = path.split('/');
        const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
        const fmBlock = fmMatch ? fmMatch[1] : '';
        const adaptionNameMatch = fmBlock.match(/^adaption:\s*"(.+)"$/m);
        const adaptionName = adaptionNameMatch ? adaptionNameMatch[1] : parts[parts.length - 2];
        const titleMatch = fmBlock.match(/^title:\s*"(.+)"$/m);
        const title = titleMatch ? titleMatch[1] : null;
        const afterFm = fmMatch ? raw.slice(fmMatch[0].length) : raw;
        const content = afterFm.replace(/^\*\*[^\n]*\*\*\n\n/, '').trimEnd();
        return { adaptionName, title, content };
      }),
  );

  const collectionAdaptions = collectionAdaptionMap.get(storyId) || [];
  const storyAdaptions = [...fileAdaptions, ...collectionAdaptions];

  adaptionCache.set(storyId, storyAdaptions);
  return storyAdaptions;
}

export function getStoryCoverUrl(storyId) {
  return collectionCoverMap.get(storyId) || null;
}

export function getStoryIllustrations(storyId) {
  if (!storyId) return null;
  const sourceId = storyId.split('/')[0];
  return collectionIllustrationsMap.get(sourceId) || null;
}

export async function loadStoryAudioMap() {
  if (audioCache.size > 0) {
    return Object.fromEntries(audioCache.entries());
  }

  const entries = await Promise.all(
    Object.entries(storyAudioModules).map(async ([path, loader]) => [path, await loader()]),
  );

  for (const [path, url] of entries) {
    audioCache.set(path, url);
  }

  return Object.fromEntries(audioCache.entries());
}
