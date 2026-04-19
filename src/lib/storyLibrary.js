import collections from 'virtual:webreader-collections';

const storyModules2 = import.meta.glob('/stories/*/*/content.md', { query: '?raw', import: 'default' });
const storyModules3 = import.meta.glob('/stories/*/*/*/content.md', { query: '?raw', import: 'default' });
const adaptionModules = import.meta.glob('/stories/*/*/adaptions/*/content.md', { query: '?raw', import: 'default' });
const storyAudioModules = import.meta.glob('/stories/*/*/audio.mp3', { query: '?url', import: 'default' });

const storyModuleMap = { ...storyModules2, ...storyModules3 };
const storyCache = new Map();
const storyMetadataCache = new Map();
const adaptionCache = new Map();
const audioCache = new Map();

const collectionStoryMap = new Map();
const collectionAdaptionMap = new Map();
const collectionCoverMap = new Map();
for (const pkg of collections) {
  if (!pkg || !pkg.manifest || !pkg.stories) continue;
  const { manifest, stories, covers = {}, adaptions: pkgAdaptions = {} } = pkg;
  const source = manifest.id;
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
  const afterFm = fmMatch ? raw.slice(fmMatch[0].length) : raw;
  const content = afterFm.replace(/^#[^\n]*\n\n/, '').trimEnd();
  return { title, sourceLabel, wordCount, content };
}

function parseStoryRaw(path, raw) {
  const { source, directory, slug } = parseStoryPath(path);
  const { title, sourceLabel, wordCount, content } = parseFrontmatter(raw, {
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
  };
}

function parseCollectionStory(entry) {
  const { id, source, slug, raw, sourceLabel, titleOverride } = entry;
  const { title, wordCount, content } = parseFrontmatter(raw, {
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
    };
  });

  const collectionStories = Array.from(collectionStoryMap.values()).map((entry) => ({
    id: entry.id,
    title: entry.titleOverride || fallbackTitleFromSlug(entry.slug),
    source: entry.source,
    directory: null,
    sourceLabel: entry.sourceLabel,
    wordCount: null,
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
