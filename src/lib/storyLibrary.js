const storyModules2 = import.meta.glob('/stories/*/*/content.md', { query: '?raw', import: 'default' });
const storyModules3 = import.meta.glob('/stories/*/*/*/content.md', { query: '?raw', import: 'default' });
const adaptionModules = import.meta.glob('/stories/*/*/adaptions/*/content.md', { query: '?raw', import: 'default' });
const storyAudioModules = import.meta.glob('/stories/*/*/audio.mp3', { query: '?url', import: 'default' });

const storyModuleMap = { ...storyModules2, ...storyModules3 };
const storyCache = new Map();
const storyMetadataCache = new Map();
const adaptionCache = new Map();
const audioCache = new Map();

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
  const afterFm = fmMatch ? raw.slice(fmMatch[0].length) : raw;
  const content = afterFm.replace(/^#[^\n]*\n\n/, '').trimEnd();
  const id = directory ? `${source}/${directory}/${slug}` : `${source}/${slug}`;

  return { id, title, content, source, directory, sourceLabel, wordCount };
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
