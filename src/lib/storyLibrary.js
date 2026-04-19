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

function buildCoverMap(modules) {
  const map = {};
  for (const [path, url] of Object.entries(modules)) {
    const parts = path.split('/');
    // /stories/{source}/{slug}/cover.ext           → 5 parts (6 after split incl. empty)
    // /stories/{source}/{directory}/{slug}/cover.ext → 6 parts
    const partsNoEmpty = parts.filter(Boolean); // ['stories', source, ...slug, 'cover.ext']
    if (partsNoEmpty.length === 4) {
      const id = `${partsNoEmpty[1]}/${partsNoEmpty[2]}`;
      map[id] = url;
    } else if (partsNoEmpty.length === 5) {
      const id = `${partsNoEmpty[1]}/${partsNoEmpty[2]}/${partsNoEmpty[3]}`;
      map[id] = url;
    }
  }
  return map;
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

function parseStoryRaw(path, raw) {
  const { source, directory, slug } = parseStoryPath(path);
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const fmBlock = fmMatch ? fmMatch[1] : '';
  const titleMatch = fmBlock.match(/^title:\s*"(.+)"$/m);
  const title = titleMatch ? titleMatch[1] : fallbackTitleFromSlug(slug);
  const sourceLabelMatch = fmBlock.match(/^source:\s*"(.+)"$/m);
  const sourceLabel = sourceLabelMatch ? sourceLabelMatch[1] : source;
  const wordCountMatch = fmBlock.match(/^wordCount:\s*(\d+)$/m);
  const wordCount = wordCountMatch ? parseInt(wordCountMatch[1], 10) : null;
  const ageMinMatch = fmBlock.match(/^ageMin:\s*(\d+)$/m);
  const ageMin = ageMinMatch ? parseInt(ageMinMatch[1], 10) : null;
  const ageMaxMatch = fmBlock.match(/^ageMax:\s*(\d+)$/m);
  const ageMax = ageMaxMatch ? parseInt(ageMaxMatch[1], 10) : null;
  const afterFm = fmMatch ? raw.slice(fmMatch[0].length) : raw;
  const content = afterFm.replace(/^#[^\n]*\n\n/, '').trimEnd();
  const id = directory ? `${source}/${directory}/${slug}` : `${source}/${slug}`;
  const coverUrl = storyCoverMap[id] ?? null;

  return { id, title, content, source, directory, sourceLabel, wordCount, ageMin, ageMax, coverUrl };
}

export function getStoryIndex() {
  const stories = Object.keys(storyModuleMap)
    .map((path) => {
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
    })
    .sort((a, b) => a.title.localeCompare(b.title, 'de'));

  return stories;
}

export async function loadStoryById(storyId) {
  if (storyCache.has(storyId)) return storyCache.get(storyId);

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

  const storyAdaptions = await Promise.all(
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

  adaptionCache.set(storyId, storyAdaptions);
  return storyAdaptions;
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
