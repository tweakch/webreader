import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  ILLUSTRATION_PACK_REQUIRED_FIELDS,
  validateIllustrationPackManifest,
} from '../../src/lib/illustrationPackSchema';

const validManifest = {
  storyId: 'grimm-klassiker/die_sterntaler',
  storyVersion: '1',
  packId: 'die-sterntaler-v1',
  images: [
    {
      id: 'stars-fall',
      src: 'stars-fall.webp',
      anchor: { paragraph: 2, hash: 'fnv1a:abcd1234' },
    },
  ],
};

describe('validateIllustrationPackManifest', () => {
  it('accepts the agreed pilot shape', () => {
    const result = validateIllustrationPackManifest(validManifest);
    expect(result.ok).toBe(true);
    expect(result.value).toEqual(validManifest);
  });

  it('parses a JSON string', () => {
    const result = validateIllustrationPackManifest(JSON.stringify(validManifest));
    expect(result.ok).toBe(true);
    expect(result.value.packId).toBe('die-sterntaler-v1');
  });

  it('ignores unknown extra fields (Inhalt can extend)', () => {
    const result = validateIllustrationPackManifest({
      ...validManifest,
      locale: 'de',
      images: [
        { ...validManifest.images[0], alt: 'Sterne', anchor: { paragraph: 2, note: 'climax' } },
      ],
    });
    expect(result.ok).toBe(true);
    expect(result.value.images[0].anchor).toEqual({ paragraph: 2 });
  });

  it.each(ILLUSTRATION_PACK_REQUIRED_FIELDS)('rejects a missing %s', (field) => {
    const { [field]: _omit, ...rest } = validManifest;
    const result = validateIllustrationPackManifest(rest);
    expect(result.ok).toBe(false);
    expect(result.errors.some((e) => e.path === field)).toBe(true);
  });

  it('rejects invalid JSON', () => {
    const result = validateIllustrationPackManifest('{not-json');
    expect(result.ok).toBe(false);
    expect(result.errors[0].message).toMatch(/not valid JSON/);
  });

  it('rejects a non-object manifest', () => {
    expect(validateIllustrationPackManifest(null).ok).toBe(false);
    expect(validateIllustrationPackManifest([]).ok).toBe(false);
  });

  it('rejects empty strings', () => {
    const result = validateIllustrationPackManifest({ ...validManifest, storyId: '   ' });
    expect(result.ok).toBe(false);
  });

  it('rejects a non-array images field', () => {
    const result = validateIllustrationPackManifest({ ...validManifest, images: {} });
    expect(result.ok).toBe(false);
    expect(result.errors[0].path).toBe('images');
  });

  it('accepts an empty images array', () => {
    const result = validateIllustrationPackManifest({ ...validManifest, images: [] });
    expect(result.ok).toBe(true);
    expect(result.value.images).toEqual([]);
  });

  it('rejects an image missing id/src/anchor', () => {
    const result = validateIllustrationPackManifest({
      ...validManifest,
      images: [{ src: 'a.webp' }],
    });
    expect(result.ok).toBe(false);
    expect(result.errors.map((e) => e.path)).toEqual(
      expect.arrayContaining(['images[0].id', 'images[0].anchor'])
    );
  });

  it('rejects a page-only anchor (paragraph is required)', () => {
    const result = validateIllustrationPackManifest({
      ...validManifest,
      images: [{ id: 'x', src: 'x.webp', anchor: { page: 3 } }],
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0].path).toBe('images[0].anchor.paragraph');
  });

  it('accepts Inhalt #70 { type, index } anchors and normalizes to paragraph', () => {
    const result = validateIllustrationPackManifest({
      ...validManifest,
      images: [
        {
          id: 'x',
          src: 'x.webp',
          alt: 'Sterne',
          anchor: { type: 'paragraph', index: 2, hash: 'e932ee0b' },
        },
      ],
    });
    expect(result.ok).toBe(true);
    expect(result.value.images[0]).toEqual({
      id: 'x',
      src: 'x.webp',
      alt: 'Sterne',
      anchor: { paragraph: 2, hash: 'e932ee0b' },
    });
  });

  it('rejects anchor.type other than paragraph', () => {
    const result = validateIllustrationPackManifest({
      ...validManifest,
      images: [{ id: 'x', src: 'x.webp', anchor: { type: 'page', index: 0 } }],
    });
    expect(result.ok).toBe(false);
    expect(result.errors[0].path).toBe('images[0].anchor.type');
  });

  it('in lenient mode drops bad images and keeps the pack', () => {
    const result = validateIllustrationPackManifest(
      {
        ...validManifest,
        images: [
          { id: 'ok', src: 'ok.webp', anchor: { paragraph: 0 } },
          { id: 'page', src: 'x.webp', anchor: { type: 'page', index: 0 } },
        ],
      },
      { lenient: true }
    );
    expect(result.ok).toBe(true);
    expect(result.value.images).toEqual([{ id: 'ok', src: 'ok.webp', anchor: { paragraph: 0 } }]);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it('rejects a negative or non-integer paragraph index', () => {
    expect(
      validateIllustrationPackManifest({
        ...validManifest,
        images: [{ id: 'x', src: 'x.webp', anchor: { paragraph: -1 } }],
      }).ok
    ).toBe(false);
    expect(
      validateIllustrationPackManifest({
        ...validManifest,
        images: [{ id: 'x', src: 'x.webp', anchor: { paragraph: 1.5 } }],
      }).ok
    ).toBe(false);
  });

  it('rejects an empty optional hash', () => {
    const result = validateIllustrationPackManifest({
      ...validManifest,
      images: [{ id: 'x', src: 'x.webp', anchor: { paragraph: 0, hash: '' } }],
    });
    expect(result.ok).toBe(false);
  });
});

describe('illustration-packs/manifest.schema.json', () => {
  it('declares the required fields Inhalt and Lesefluss agreed on', () => {
    const schema = JSON.parse(
      readFileSync(join(process.cwd(), 'illustration-packs/manifest.schema.json'), 'utf8')
    );
    expect(schema.required).toEqual(ILLUSTRATION_PACK_REQUIRED_FIELDS);
    expect(schema.properties.images.items.required).toEqual(['id', 'src', 'anchor']);
    expect(schema.properties.images.items.properties.anchor.anyOf).toEqual([
      { required: ['paragraph'] },
      { required: ['index'] },
    ]);
    expect(schema.properties.images.items.properties.anchor.properties.paragraph.minimum).toBe(0);
  });
});
