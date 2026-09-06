import {
  ILLUSTRATION_PACK_SKIP,
  computeStoryVersion,
  createIllustrationPackRegistry,
  emptyIllustrationPackResult,
  hashParagraphStart,
  hashStoryContent,
  resolveIllustrationPack,
  resolvePackSrc,
  splitStoryParagraphs,
} from '../../src/lib/illustrationPackLoader';

const STORY_ID = 'grimm-klassiker/die_sterntaler';
const PARAGRAPHS = [
  'Es war einmal ein kleines Mädchen.',
  'Da begegnete ihm ein armer Mann.',
  'Und wie es so stand, fielen die Sterne vom Himmel.',
];

function manifest(overrides = {}, imageOverrides = {}) {
  return {
    storyId: STORY_ID,
    storyVersion: '1',
    packId: 'die-sterntaler-v1',
    images: [
      {
        id: 'stars-fall',
        src: 'stars-fall.webp',
        anchor: { paragraph: 2 },
        ...imageOverrides,
      },
    ],
    ...overrides,
  };
}

describe('computeStoryVersion / hashes', () => {
  it('prefers an explicit frontmatter version', () => {
    expect(computeStoryVersion({ version: '1', content: 'body' })).toBe('1');
    expect(computeStoryVersion({ version: 2, content: 'body' })).toBe('2');
  });

  it('falls back to a stable content hash', () => {
    const a = hashStoryContent('Es war einmal.');
    const b = hashStoryContent('Es war einmal.');
    const c = hashStoryContent('Es war einmal!\n');
    expect(a).toBe(b);
    expect(a).toMatch(/^fnv1a:[0-9a-f]{8}$/);
    expect(c).not.toBe(a);
    expect(computeStoryVersion({ content: 'Es war einmal.' })).toBe(a);
  });

  it('hashes a collapsed paragraph start', () => {
    const hash = hashParagraphStart('  Und   wie es so stand  ');
    expect(hash).toBe(hashParagraphStart('Und wie es so stand'));
    expect(hash).toMatch(/^fnv1a:[0-9a-f]{8}$/);
  });

  it('splits paragraphs the same way as the pager', () => {
    expect(splitStoryParagraphs(PARAGRAPHS.join('\n\n'))).toEqual(PARAGRAPHS);
  });
});

describe('resolveIllustrationPack — soft fail', () => {
  it('maps a matching pack to a paragraph slot', () => {
    const result = resolveIllustrationPack({
      storyId: STORY_ID,
      storyVersion: '1',
      paragraphs: PARAGRAPHS,
      manifest: manifest(),
      assets: { 'stars-fall.webp': '/packs/stars-fall.webp' },
    });
    expect(result.status).toBe('matched');
    expect(result.slots).toEqual([
      {
        id: 'stars-fall',
        src: '/packs/stars-fall.webp',
        paragraphIndex: 2,
        packId: 'die-sterntaler-v1',
      },
    ]);
    expect(result.skipped).toEqual([]);
  });

  it('returns empty slots for an invalid manifest (pager unchanged)', () => {
    const result = resolveIllustrationPack({
      storyId: STORY_ID,
      storyVersion: '1',
      paragraphs: PARAGRAPHS,
      manifest: { packId: 'x' },
    });
    expect(result).toMatchObject({
      status: 'skipped',
      reason: ILLUSTRATION_PACK_SKIP.INVALID_MANIFEST,
      slots: [],
    });
    expect(result.errors.length).toBeGreaterThan(0);
  });

  it('skips the whole pack on storyVersion mismatch', () => {
    const result = resolveIllustrationPack({
      storyId: STORY_ID,
      storyVersion: '2',
      paragraphs: PARAGRAPHS,
      manifest: manifest(),
      assets: { 'stars-fall.webp': '/packs/stars-fall.webp' },
    });
    expect(result).toEqual(
      expect.objectContaining({
        status: 'skipped',
        reason: ILLUSTRATION_PACK_SKIP.VERSION_MISMATCH,
        slots: [],
        skipped: [],
      })
    );
  });

  it('skips the whole pack on storyId mismatch', () => {
    const result = resolveIllustrationPack({
      storyId: 'grimm-klassiker/aschenputtel',
      storyVersion: '1',
      paragraphs: PARAGRAPHS,
      manifest: manifest(),
    });
    expect(result.reason).toBe(ILLUSTRATION_PACK_SKIP.STORY_MISMATCH);
    expect(result.slots).toEqual([]);
  });

  it('skips a missing image file and keeps the pager empty of that slot', () => {
    const result = resolveIllustrationPack({
      storyId: STORY_ID,
      storyVersion: '1',
      paragraphs: PARAGRAPHS,
      manifest: manifest(),
      assets: {},
    });
    expect(result.status).toBe('matched');
    expect(result.slots).toEqual([]);
    expect(result.skipped).toEqual([
      { id: 'stars-fall', reason: ILLUSTRATION_PACK_SKIP.MISSING_SRC },
    ]);
  });

  it('skips an out-of-range paragraph index', () => {
    const result = resolveIllustrationPack({
      storyId: STORY_ID,
      storyVersion: '1',
      paragraphs: PARAGRAPHS,
      manifest: manifest({}, { anchor: { paragraph: 99 } }),
      assets: { 'stars-fall.webp': '/x.webp' },
    });
    expect(result.slots).toEqual([]);
    expect(result.skipped[0].reason).toBe(ILLUSTRATION_PACK_SKIP.ANCHOR_OUT_OF_RANGE);
  });

  it('skips an image when the optional paragraph-start hash does not match', () => {
    const result = resolveIllustrationPack({
      storyId: STORY_ID,
      storyVersion: '1',
      paragraphs: PARAGRAPHS,
      manifest: manifest({}, { anchor: { paragraph: 2, hash: 'fnv1a:deadbeef' } }),
      assets: { 'stars-fall.webp': '/x.webp' },
    });
    expect(result.slots).toEqual([]);
    expect(result.skipped[0].reason).toBe(ILLUSTRATION_PACK_SKIP.ANCHOR_HASH_MISMATCH);
  });

  it('keeps an image when the optional paragraph-start hash matches', () => {
    const result = resolveIllustrationPack({
      storyId: STORY_ID,
      storyVersion: '1',
      paragraphs: PARAGRAPHS,
      manifest: manifest({}, { anchor: { paragraph: 2, hash: hashParagraphStart(PARAGRAPHS[2]) } }),
      assets: { 'stars-fall.webp': '/x.webp' },
    });
    expect(result.slots).toHaveLength(1);
  });

  it('skips duplicate ids and a second image on the same paragraph', () => {
    const result = resolveIllustrationPack({
      storyId: STORY_ID,
      storyVersion: '1',
      paragraphs: PARAGRAPHS,
      manifest: manifest({
        images: [
          { id: 'a', src: 'a.webp', anchor: { paragraph: 0 } },
          { id: 'a', src: 'b.webp', anchor: { paragraph: 1 } },
          { id: 'c', src: 'c.webp', anchor: { paragraph: 0 } },
        ],
      }),
      assets: { 'a.webp': '/a.webp', 'b.webp': '/b.webp', 'c.webp': '/c.webp' },
    });
    expect(result.slots).toEqual([
      { id: 'a', src: '/a.webp', paragraphIndex: 0, packId: 'die-sterntaler-v1' },
    ]);
    expect(result.skipped.map((s) => s.reason)).toEqual([
      ILLUSTRATION_PACK_SKIP.DUPLICATE_ID,
      ILLUSTRATION_PACK_SKIP.DUPLICATE_PARAGRAPH,
    ]);
  });

  it('passes absolute URLs through without an assets map', () => {
    const result = resolveIllustrationPack({
      storyId: STORY_ID,
      storyVersion: '1',
      paragraphs: PARAGRAPHS,
      manifest: manifest({}, { src: 'https://cdn.example/stars.webp' }),
    });
    expect(result.slots[0].src).toBe('https://cdn.example/stars.webp');
  });

  it('never throws on garbage input', () => {
    expect(() => resolveIllustrationPack()).not.toThrow();
    expect(resolveIllustrationPack().slots).toEqual([]);
    expect(emptyIllustrationPackResult().slots).toEqual([]);
  });
});

describe('createIllustrationPackRegistry', () => {
  const story = { id: STORY_ID, version: '1', content: PARAGRAPHS.join('\n\n') };

  it('resolves a pack by storyId + version and maps assets from the pack dir', () => {
    const registry = createIllustrationPackRegistry({
      manifests: {
        '/illustration-packs/die_sterntaler/v1/manifest.json': manifest(),
      },
      assets: {
        '/illustration-packs/die_sterntaler/v1/stars-fall.webp': '/built/stars-fall.webp',
      },
    });
    const result = registry.resolveForStory(story);
    expect(result.status).toBe('matched');
    expect(result.slots[0].src).toBe('/built/stars-fall.webp');
    expect(result.slots[0].paragraphIndex).toBe(2);
  });

  it('returns empty slots when no pack exists (pager unchanged)', () => {
    const registry = createIllustrationPackRegistry({ manifests: {}, assets: {} });
    const result = registry.resolveForStory(story);
    expect(result.reason).toBe(ILLUSTRATION_PACK_SKIP.NO_PACK);
    expect(result.slots).toEqual([]);
  });

  it('returns empty slots when every candidate has the wrong storyVersion', () => {
    const registry = createIllustrationPackRegistry({
      manifests: {
        '/illustration-packs/die_sterntaler/v1/manifest.json': manifest({ storyVersion: '9' }),
      },
      assets: {
        '/illustration-packs/die_sterntaler/v1/stars-fall.webp': '/built/stars-fall.webp',
      },
    });
    const result = registry.resolveForStory(story);
    expect(result.reason).toBe(ILLUSTRATION_PACK_SKIP.VERSION_MISMATCH);
    expect(result.slots).toEqual([]);
  });

  it('prefers the highest path version when two packs match the same storyVersion', () => {
    const registry = createIllustrationPackRegistry({
      manifests: {
        '/illustration-packs/die_sterntaler/v1/manifest.json': manifest({ packId: 'old' }),
        '/illustration-packs/die_sterntaler/v2/manifest.json': manifest({ packId: 'new' }),
      },
      assets: {
        '/illustration-packs/die_sterntaler/v1/stars-fall.webp': '/old.webp',
        '/illustration-packs/die_sterntaler/v2/stars-fall.webp': '/new.webp',
      },
    });
    const result = registry.resolveForStory(story);
    expect(result.packId).toBe('new');
    expect(result.slots[0].src).toBe('/new.webp');
  });

  it('ignores a pack written for a different storyId', () => {
    const registry = createIllustrationPackRegistry({
      manifests: {
        '/illustration-packs/aschenputtel/v1/manifest.json': manifest({
          storyId: 'grimm-klassiker/aschenputtel',
        }),
      },
    });
    expect(registry.resolveForStory(story).reason).toBe(ILLUSTRATION_PACK_SKIP.NO_PACK);
  });
});

describe('resolvePackSrc', () => {
  it('uses the assets map for relative names and skips misses', () => {
    expect(resolvePackSrc('a.webp', { 'a.webp': '/a.webp' })).toBe('/a.webp');
    expect(resolvePackSrc('missing.webp', { 'a.webp': '/a.webp' })).toBeNull();
  });

  it('keeps http(s), root-relative, and data URLs', () => {
    expect(resolvePackSrc('https://x/a.webp', {})).toBe('https://x/a.webp');
    expect(resolvePackSrc('/static/a.webp', {})).toBe('/static/a.webp');
    expect(resolvePackSrc('data:image/gif;base64,xx', {})).toBe('data:image/gif;base64,xx');
  });
});
