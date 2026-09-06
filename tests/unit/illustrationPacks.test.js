import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  parseIllustrationPack,
  buildIllustrationPackIndex,
  getIllustrationPack,
  getAnchoredIllustration,
  getIllustrationSlotMap,
  hashStoryContent,
  hashParagraphStart,
  splitStoryParagraphs,
} from '../../src/lib/illustrationPacks';

const PILOT_STORY_ID = 'grimm-klassiker/die_sterntaler';
const PILOT_VERSION = '3645b111';

const validManifest = {
  packId: 'die_sterntaler-v1',
  storyId: PILOT_STORY_ID,
  storyVersion: PILOT_VERSION,
  locale: 'de',
  images: [
    {
      id: 'girl-in-field',
      src: 'images/01-girl-in-field.svg',
      alt: 'Feld',
      anchor: { type: 'paragraph', index: 0, hash: 'e1f839ba' },
    },
    {
      id: 'giving-bread',
      src: 'images/02-giving-bread.svg',
      anchor: { type: 'paragraph', index: 1 },
    },
  ],
};

function loadPilotBody() {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
  const raw = readFileSync(
    join(root, 'packages/collection-grimm-klassiker/stories/die_sterntaler/content.md'),
    'utf8'
  );
  const fmMatch = raw.match(/^---\n([\s\S]*?)\n---\n/);
  const afterFm = fmMatch ? raw.slice(fmMatch[0].length) : raw;
  return afterFm.replace(/^#[^\n]*\n\n/, '').trimEnd();
}

describe('parseIllustrationPack', () => {
  it('normalizes a valid paragraph-anchored manifest', () => {
    const pack = parseIllustrationPack(validManifest);
    expect(pack.packId).toBe('die_sterntaler-v1');
    expect(pack.storyId).toBe(PILOT_STORY_ID);
    expect(pack.storyVersion).toBe(PILOT_VERSION);
    expect(pack.images).toHaveLength(2);
    expect(pack.images[0]).toMatchObject({
      id: 'girl-in-field',
      src: 'images/01-girl-in-field.svg',
      alt: 'Feld',
      anchor: { type: 'paragraph', index: 0, hash: 'e1f839ba' },
    });
  });

  it('returns null when packId, storyId, or storyVersion is missing', () => {
    expect(parseIllustrationPack({ ...validManifest, packId: '' })).toBeNull();
    expect(parseIllustrationPack({ ...validManifest, storyId: null })).toBeNull();
    expect(parseIllustrationPack({ ...validManifest, storyVersion: '' })).toBeNull();
    expect(parseIllustrationPack(null)).toBeNull();
  });

  it('skips page anchors, missing files, and empty srcs (soft-fail)', () => {
    const pack = parseIllustrationPack(
      {
        ...validManifest,
        images: [
          { id: 'ok', src: 'images/ok.svg', anchor: { type: 'paragraph', index: 0 } },
          { id: 'page', src: 'images/ok.svg', anchor: { type: 'page', index: 0 } },
          { id: 'missing', src: 'images/gone.svg', anchor: { type: 'paragraph', index: 1 } },
          { id: 'no-src', src: '', anchor: { type: 'paragraph', index: 2 } },
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
        anchor: { type: 'paragraph', index: 0 },
      },
    ]);
  });
});

describe('buildIllustrationPackIndex + getIllustrationPack', () => {
  const otherVersion = 'deadbeef';
  const manifests = {
    '/illustration-packs/die_sterntaler/v1/manifest.json': validManifest,
    '/illustration-packs/die_sterntaler/v2/manifest.json': {
      ...validManifest,
      packId: 'die_sterntaler-v2',
      storyVersion: otherVersion,
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

  it('matches storyVersion exactly and does not fall back to another revision', () => {
    const pack = getIllustrationPack(PILOT_STORY_ID, { storyVersion: PILOT_VERSION }, packs);
    expect(pack.packId).toBe('die_sterntaler-v1');
    expect(pack.images[0].src).toBe('/v1/girl.svg');
    expect(getIllustrationPack(PILOT_STORY_ID, { storyVersion: otherVersion }, packs).packId).toBe(
      'die_sterntaler-v2'
    );
  });

  it('soft-fails when version is omitted or unknown', () => {
    expect(getIllustrationPack(PILOT_STORY_ID, {}, packs)).toBeNull();
    expect(getIllustrationPack(PILOT_STORY_ID, { storyVersion: '9' }, packs)).toBeNull();
    expect(getIllustrationPack('', { storyVersion: PILOT_VERSION }, packs)).toBeNull();
  });
});

describe('getAnchoredIllustration', () => {
  const pack = parseIllustrationPack(validManifest);

  it('finds the image for a paragraph index', () => {
    expect(getAnchoredIllustration(pack, { type: 'paragraph', index: 1 }).id).toBe('giving-bread');
    expect(getAnchoredIllustration(pack, 1).id).toBe('giving-bread');
  });

  it('returns null for page anchors or a missing paragraph', () => {
    expect(getAnchoredIllustration(pack, { type: 'paragraph', index: 9 })).toBeNull();
    expect(getAnchoredIllustration(pack, { type: 'page', index: 0 })).toBeNull();
    expect(getAnchoredIllustration(null, { type: 'paragraph', index: 0 })).toBeNull();
  });
});

describe('getIllustrationSlotMap', () => {
  const packs = buildIllustrationPackIndex(
    { '/illustration-packs/die_sterntaler/v1/manifest.json': validManifest },
    {
      '/illustration-packs/die_sterntaler/v1/images/01-girl-in-field.svg': '/v1/girl.svg',
      '/illustration-packs/die_sterntaler/v1/images/02-giving-bread.svg': '/v1/bread.svg',
    }
  );

  it('returns a paragraph → image Map when version matches', () => {
    const { byParagraph, skipped, pack } = getIllustrationSlotMap(
      PILOT_STORY_ID,
      { storyVersion: PILOT_VERSION },
      packs
    );
    expect(pack.packId).toBe('die_sterntaler-v1');
    expect(skipped).toEqual([]);
    expect(byParagraph.get(0).id).toBe('girl-in-field');
    expect(byParagraph.get(1).id).toBe('giving-bread');
  });

  it('soft-fails the whole pack on version mismatch', () => {
    const { byParagraph, skipped, pack } = getIllustrationSlotMap(
      PILOT_STORY_ID,
      { storyVersion: 'ffffffff' },
      packs
    );
    expect(pack).toBeNull();
    expect(byParagraph.size).toBe(0);
    expect(skipped[0].reason).toBe('version-mismatch');
  });

  it('skips one image when the paragraph-start hash drifted', () => {
    const { byParagraph, skipped } = getIllustrationSlotMap(
      PILOT_STORY_ID,
      { storyVersion: PILOT_VERSION, paragraphs: ['changed opening', 'Da begegnete'] },
      packs
    );
    expect(byParagraph.has(0)).toBe(false);
    expect(byParagraph.get(1).id).toBe('giving-bread');
    expect(skipped).toEqual([
      { reason: 'paragraph-hash-mismatch', imageId: 'girl-in-field', index: 0 },
    ]);
  });
});

describe('pilot pack (build-time glob)', () => {
  const body = loadPilotBody();
  const storyVersion = hashStoryContent(body);
  const paragraphs = splitStoryParagraphs(body);

  it('pins Die Sterntaler to the live content hash and paragraph-start hashes', () => {
    expect(storyVersion).toBe(PILOT_VERSION);
    expect(paragraphs).toHaveLength(3);
    expect(hashParagraphStart(paragraphs[0])).toBe('e1f839ba');
    expect(hashParagraphStart(paragraphs[1])).toBe('5a0300e9');
    expect(hashParagraphStart(paragraphs[2])).toBe('e932ee0b');
  });

  it('resolves three paragraph-anchored images via the soft-fail Map', () => {
    const { byParagraph, skipped, pack } = getIllustrationSlotMap(PILOT_STORY_ID, {
      storyVersion,
      content: body,
    });
    expect(pack).not.toBeNull();
    expect(pack.packId).toBe('die_sterntaler-v1');
    expect(skipped).toEqual([]);
    expect(byParagraph.size).toBe(3);
    expect(byParagraph.get(0).relSrc).toBe('images/01-girl-in-field.svg');
    expect(byParagraph.get(1).relSrc).toBe('images/02-giving-bread.svg');
    expect(byParagraph.get(2).relSrc).toBe('images/03-stars-falling.svg');
    expect(byParagraph.get(0).src).toBeTruthy();
  });

  it('does not resolve a pack for an unrelated story', () => {
    expect(
      getIllustrationPack('grimm-klassiker/aschenputtel', { storyVersion: PILOT_VERSION })
    ).toBeNull();
  });
});
