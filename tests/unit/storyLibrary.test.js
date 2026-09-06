import { parseStoryRaw, buildCoverMap, getStoryIllustrationSlots } from '../../src/lib/storyLibrary';

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

  it('extracts frontmatter version for illustration-pack pinning', () => {
    const quoted = parseStoryRaw(twoLevelPath, fm('version: "1"'), {});
    const bare = parseStoryRaw(twoLevelPath, fm('version: 2'), {});
    expect(quoted.version).toBe('1');
    expect(bare.version).toBe('2');
    expect(parseStoryRaw(twoLevelPath, fm(), {}).version).toBeNull();
  });
});

describe('getStoryIllustrationSlots', () => {
  it('fails soft when no matching pack is installed', () => {
    const result = getStoryIllustrationSlots({
      id: 'grimm-klassiker/die_sterntaler',
      version: '1',
      content: 'Es war einmal ein kleines Mädchen.',
    });
    expect(result.slots).toEqual([]);
    expect(['empty', 'skipped']).toContain(result.status);
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
    expect(Object.keys(map).sort()).toEqual([
      'grimm/aschenputtel',
      'sagen/bern/riesenstein',
    ]);
  });

  it('returns an empty map for an empty modules object', () => {
    expect(buildCoverMap({})).toEqual({});
  });
});
