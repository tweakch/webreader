import {
  parseIllustrationPack,
  buildIllustrationPackIndex,
  getIllustrationPack,
  getAnchoredIllustration,
} from '../../src/lib/illustrationPacks';

const PILOT_STORY_ID = 'grimm-klassiker/die_sterntaler';

const validManifest = {
  packId: 'die_sterntaler-v1',
  storyId: PILOT_STORY_ID,
  storyVersion: '1',
  locale: 'de',
  images: [
    {
      id: 'girl-in-field',
      src: 'images/01-girl-in-field.svg',
      alt: 'Feld',
      anchor: { type: 'paragraph', index: 0 },
    },
    {
      id: 'giving-bread',
      src: 'images/02-giving-bread.svg',
      anchor: { type: 'paragraph', index: 1 },
    },
  ],
};

describe('parseIllustrationPack', () => {
  it('normalizes a valid manifest and keeps relative srcs when no resolver is given', () => {
    const pack = parseIllustrationPack(validManifest);
    expect(pack.packId).toBe('die_sterntaler-v1');
    expect(pack.storyId).toBe(PILOT_STORY_ID);
    expect(pack.storyVersion).toBe('1');
    expect(pack.locale).toBe('de');
    expect(pack.images).toHaveLength(2);
    expect(pack.images[0]).toMatchObject({
      id: 'girl-in-field',
      src: 'images/01-girl-in-field.svg',
      alt: 'Feld',
      anchor: { type: 'paragraph', index: 0 },
    });
  });

  it('returns null when packId or storyId is missing', () => {
    expect(parseIllustrationPack({ ...validManifest, packId: '' })).toBeNull();
    expect(parseIllustrationPack({ ...validManifest, storyId: null })).toBeNull();
    expect(parseIllustrationPack(null)).toBeNull();
  });

  it('skips images with a missing file, bad anchor, or empty src', () => {
    const pack = parseIllustrationPack(
      {
        ...validManifest,
        images: [
          { id: 'ok', src: 'images/ok.svg', anchor: { type: 'page', index: 0 } },
          { id: 'missing', src: 'images/gone.svg', anchor: { type: 'page', index: 1 } },
          { id: 'no-src', src: '', anchor: { type: 'page', index: 2 } },
          { id: 'bad-anchor', src: 'images/ok.svg', anchor: { type: 'scene', index: 0 } },
          { id: 'neg', src: 'images/ok.svg', anchor: { type: 'paragraph', index: -1 } },
          null,
        ],
      },
      { resolveSrc: (rel) => (rel.endsWith('ok.svg') ? `/assets/${rel}` : null) }
    );
    expect(pack.images).toEqual([
      {
        id: 'ok',
        src: '/assets/images/ok.svg',
        relSrc: 'images/ok.svg',
        alt: '',
        anchor: { type: 'page', index: 0 },
      },
    ]);
  });

  it('defaults storyVersion to "1" when omitted', () => {
    const { storyVersion: _, ...rest } = validManifest;
    expect(parseIllustrationPack(rest).storyVersion).toBe('1');
  });
});

describe('buildIllustrationPackIndex + getIllustrationPack', () => {
  const manifests = {
    '/illustration-packs/die_sterntaler/v1/manifest.json': validManifest,
    '/illustration-packs/die_sterntaler/v2/manifest.json': {
      ...validManifest,
      packId: 'die_sterntaler-v2',
      storyVersion: '2',
      images: [
        {
          id: 'stars',
          src: 'images/03-stars-falling.svg',
          anchor: { type: 'paragraph', index: 2 },
        },
      ],
    },
    '/illustration-packs/broken/v1/manifest.json': { packId: 'no-story' },
  };

  const images = {
    '/illustration-packs/die_sterntaler/v1/images/01-girl-in-field.svg': '/v1/girl.svg',
    '/illustration-packs/die_sterntaler/v1/images/02-giving-bread.svg': '/v1/bread.svg',
    '/illustration-packs/die_sterntaler/v2/images/03-stars-falling.svg': '/v2/stars.svg',
  };

  const packs = buildIllustrationPackIndex(manifests, images);

  it('indexes resolvable packs and drops invalid manifests', () => {
    expect(packs.map((p) => p.packId).sort()).toEqual(['die_sterntaler-v1', 'die_sterntaler-v2']);
  });

  it('returns the latest pack when no storyVersion is requested', () => {
    const pack = getIllustrationPack(PILOT_STORY_ID, {}, packs);
    expect(pack.packId).toBe('die_sterntaler-v2');
  });

  it('returns the matching version when storyVersion is given', () => {
    const pack = getIllustrationPack(PILOT_STORY_ID, { storyVersion: '1' }, packs);
    expect(pack.packId).toBe('die_sterntaler-v1');
    expect(pack.images[0].src).toBe('/v1/girl.svg');
  });

  it('returns null for an unknown story, missing version, or empty id', () => {
    expect(getIllustrationPack('grimm-klassiker/unknown', {}, packs)).toBeNull();
    expect(getIllustrationPack(PILOT_STORY_ID, { storyVersion: '9' }, packs)).toBeNull();
    expect(getIllustrationPack('', {}, packs)).toBeNull();
  });
});

describe('getAnchoredIllustration', () => {
  const pack = parseIllustrationPack(validManifest);

  it('finds the image for a paragraph or page anchor', () => {
    expect(getAnchoredIllustration(pack, { type: 'paragraph', index: 1 }).id).toBe('giving-bread');
  });

  it('returns null when the anchor is missing or malformed', () => {
    expect(getAnchoredIllustration(pack, { type: 'paragraph', index: 9 })).toBeNull();
    expect(getAnchoredIllustration(pack, { type: 'page', index: 0 })).toBeNull();
    expect(getAnchoredIllustration(null, { type: 'paragraph', index: 0 })).toBeNull();
    expect(getAnchoredIllustration(pack, { type: 'paragraph', index: -1 })).toBeNull();
  });
});

describe('pilot pack (build-time glob)', () => {
  it('resolves Die Sterntaler v1 with three anchored images', () => {
    const pack = getIllustrationPack(PILOT_STORY_ID);
    expect(pack).not.toBeNull();
    expect(pack.packId).toBe('die_sterntaler-v1');
    expect(pack.storyVersion).toBe('1');
    expect(pack.images).toHaveLength(3);

    const field = getAnchoredIllustration(pack, { type: 'paragraph', index: 0 });
    const bread = getAnchoredIllustration(pack, { type: 'paragraph', index: 1 });
    const stars = getAnchoredIllustration(pack, { type: 'paragraph', index: 2 });
    expect(field.id).toBe('girl-in-field');
    expect(bread.id).toBe('giving-bread');
    expect(stars.id).toBe('stars-falling');
    expect(field.relSrc).toBe('images/01-girl-in-field.svg');
    expect(bread.relSrc).toBe('images/02-giving-bread.svg');
    expect(stars.relSrc).toBe('images/03-stars-falling.svg');
    expect(field.src).toBeTruthy();
    expect(bread.src).toBeTruthy();
    expect(stars.src).toBeTruthy();
  });

  it('does not resolve a pack for an unrelated story', () => {
    expect(getIllustrationPack('grimm-klassiker/aschenputtel')).toBeNull();
  });
});
