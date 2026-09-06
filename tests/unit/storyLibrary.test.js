import {
  parseStoryRaw,
  buildCoverMap,
  getStoryIllustrationPack,
  getStoryIllustrations,
  hashStoryContent,
} from '../../src/lib/storyLibrary';

const PILOT_STORY_ID = 'grimm-klassiker/die_sterntaler';
const PILOT_VERSION = '3645b111';

describe('parseStoryRaw', () => {
  const twoLevelPath = '/stories/grimm/aschenputtel/content.md';
  const threeLevelPath = '/stories/sagen/bern/riesenstein/content.md';

  const fm = (extra = '') => `---
title: "Aschenputtel"
source: "Grimms Märchen"
wordCount: 2412${extra ? '\n' + extra : ''}
---

Es war einmal ein Kind.`;

  it('extracts core fields', () => {
    const story = parseStoryRaw(twoLevelPath, fm(), {});
    expect(story.id).toBe('grimm/aschenputtel');
    expect(story.title).toBe('Aschenputtel');
    expect(story.sourceLabel).toBe('Grimms Märchen');
    expect(story.source).toBe('grimm');
    expect(story.directory).toBeNull();
    expect(story.wordCount).toBe(2412);
    expect(story.content).toContain('Es war einmal ein Kind.');
  });

  it('extracts ageMin and ageMax when present', () => {
    const story = parseStoryRaw(twoLevelPath, fm('ageMin: 6\nageMax: 12'), {});
    expect(story.ageMin).toBe(6);
    expect(story.ageMax).toBe(12);
  });

  it('returns null for ageMin/ageMax when absent', () => {
    const story = parseStoryRaw(twoLevelPath, fm(), {});
    expect(story.ageMin).toBeNull();
    expect(story.ageMax).toBeNull();
  });

  it('accepts ageMin without ageMax (open-ended upper bound)', () => {
    const story = parseStoryRaw(twoLevelPath, fm('ageMin: 12'), {});
    expect(story.ageMin).toBe(12);
    expect(story.ageMax).toBeNull();
  });

  it('builds a three-level id with directory', () => {
    const story = parseStoryRaw(threeLevelPath, fm(), {});
    expect(story.id).toBe('sagen/bern/riesenstein');
    expect(story.source).toBe('sagen');
    expect(story.directory).toBe('bern');
  });

  it('resolves coverUrl from the provided cover map', () => {
    const coverMap = { 'grimm/aschenputtel': '/covers/aschenputtel.svg' };
    const story = parseStoryRaw(twoLevelPath, fm(), coverMap);
    expect(story.coverUrl).toBe('/covers/aschenputtel.svg');
  });

  it('returns null coverUrl when the story is not in the cover map', () => {
    const story = parseStoryRaw(twoLevelPath, fm(), {});
    expect(story.coverUrl).toBeNull();
  });
});

describe('buildCoverMap', () => {
  it('maps 2-level cover paths to source/slug ids', () => {
    const map = buildCoverMap({
      '/stories/grimm/aschenputtel/cover.svg': '/assets/a.svg',
      '/stories/grimm/hans_im_glueck/cover.png': '/assets/h.png',
    });
    expect(map).toEqual({
      'grimm/aschenputtel': '/assets/a.svg',
      'grimm/hans_im_glueck': '/assets/h.png',
    });
  });

  it('maps 3-level cover paths to source/directory/slug ids', () => {
    const map = buildCoverMap({
      '/stories/sagen/bern/riesenstein/cover.webp': '/assets/r.webp',
    });
    expect(map).toEqual({ 'sagen/bern/riesenstein': '/assets/r.webp' });
  });

  it('merges 2-level and 3-level entries in the same map', () => {
    const map = buildCoverMap({
      '/stories/grimm/aschenputtel/cover.svg': '/assets/a.svg',
      '/stories/sagen/bern/riesenstein/cover.webp': '/assets/r.webp',
    });
    expect(Object.keys(map).sort()).toEqual(['grimm/aschenputtel', 'sagen/bern/riesenstein']);
  });

  it('returns an empty map for an empty modules object', () => {
    expect(buildCoverMap({})).toEqual({});
  });
});

describe('getStoryIllustrationPack', () => {
  it('resolves the Sterntaler pilot pack on an exact storyVersion match', () => {
    const pack = getStoryIllustrationPack(PILOT_STORY_ID, { storyVersion: PILOT_VERSION });
    expect(pack).not.toBeNull();
    expect(pack.images.length).toBeGreaterThan(0);
    expect(pack.images[0].src).toBeTruthy();
    expect(pack.images[0].anchor).toMatchObject({ type: 'paragraph', index: 0 });
    expect(pack.images.every((image) => image.anchor.type === 'paragraph')).toBe(true);
  });

  it('soft-fails when the version is omitted or does not match', () => {
    expect(getStoryIllustrationPack(PILOT_STORY_ID)).toBeNull();
    expect(getStoryIllustrationPack(PILOT_STORY_ID, { storyVersion: 'nope' })).toBeNull();
  });

  it('returns null when no pack exists', () => {
    expect(
      getStoryIllustrationPack('grimm-klassiker/aschenputtel', { storyVersion: PILOT_VERSION })
    ).toBeNull();
  });
});

describe('getStoryIllustrations', () => {
  it('attaches the slot Map next to collection chrome when the content hash matches', () => {
    expect(hashStoryContent).toBeTypeOf('function');
    const illustrations = getStoryIllustrations(PILOT_STORY_ID, { storyVersion: PILOT_VERSION });
    expect(illustrations).not.toBeNull();
    expect(illustrations.pack?.packId).toBe('die_sterntaler-v1');
    expect(illustrations.byParagraph.get(0).id).toBe('girl-in-field');
    expect(illustrations.skipped).toEqual([]);
    expect(illustrations).toHaveProperty('opening');
    expect(illustrations).toHaveProperty('ending');
    expect(illustrations).toHaveProperty('ornament');
  });

  it('keeps collection chrome and an empty Map when storyVersion is omitted', () => {
    const illustrations = getStoryIllustrations(PILOT_STORY_ID);
    expect(illustrations.pack).toBeNull();
    expect(illustrations.byParagraph.size).toBe(0);
    expect(illustrations.skipped[0].reason).toBe('version-required');
  });

  it('returns collection chrome without a pack for a story that has no pack', () => {
    const illustrations = getStoryIllustrations('grimm-klassiker/aschenputtel', {
      storyVersion: PILOT_VERSION,
    });
    expect(illustrations).not.toBeNull();
    expect(illustrations.pack).toBeNull();
    expect(illustrations.opening || illustrations.ending || illustrations.ornament).toBeTruthy();
  });

  it('returns null when the story has neither collection chrome nor a pack', () => {
    expect(getStoryIllustrations('grimm/unknown-story')).toBeNull();
  });
});
