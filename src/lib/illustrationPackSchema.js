/**
 * Schema + validation for external illustration-pack manifests.
 *
 * Packs live at `illustration-packs/<storySlug>/vN/manifest.json` and are
 * never inlined into Markdown. Unknown extra fields are ignored so Inhalt
 * can extend the manifest without a loader break.
 */

export const ILLUSTRATION_PACK_SCHEMA_ID =
  'https://webreader.local/illustration-packs/manifest.schema.json';

export const ILLUSTRATION_PACK_REQUIRED_FIELDS = ['storyId', 'storyVersion', 'packId', 'images'];
export const ILLUSTRATION_PACK_IMAGE_REQUIRED_FIELDS = ['id', 'src', 'anchor'];

/**
 * @typedef {object} SchemaError
 * @property {string} path
 * @property {string} message
 */

/**
 * @typedef {object} ValidatedIllustrationPack
 * @property {string} storyId
 * @property {string} storyVersion
 * @property {string} packId
 * @property {Array<{ id: string, src: string, anchor: { paragraph: number, hash?: string } }>} images
 */

/**
 * @param {unknown} input raw object or JSON string
 * @param {{ lenient?: boolean }} [opts] when lenient, invalid images are dropped (soft-fail) instead of failing the pack
 * @returns {{ ok: true, value: ValidatedIllustrationPack } | { ok: false, errors: SchemaError[] }}
 */
export function validateIllustrationPackManifest(input, { lenient = false } = {}) {
  const parsed = coerceManifestInput(input);
  if (!parsed.ok) return parsed;

  const raw = parsed.value;
  const errors = [];

  if (!isPlainObject(raw)) {
    return fail('', 'manifest must be an object');
  }

  const storyId = readRequiredString(raw, 'storyId', errors);
  const storyVersion = readRequiredString(raw, 'storyVersion', errors);
  const packId = readRequiredString(raw, 'packId', errors);

  if (!Object.prototype.hasOwnProperty.call(raw, 'images')) {
    errors.push({ path: 'images', message: 'images is required' });
  } else if (!Array.isArray(raw.images)) {
    errors.push({ path: 'images', message: 'images must be an array' });
  }

  const images = [];
  const imageErrors = [];
  if (Array.isArray(raw.images)) {
    raw.images.forEach((image, index) => {
      const path = `images[${index}]`;
      const normalized = validateImageEntry(image, path, imageErrors);
      if (normalized) images.push(normalized);
    });
  }

  if (!lenient) errors.push(...imageErrors);
  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    value: { storyId, storyVersion, packId, images },
    warnings: lenient ? imageErrors : [],
  };
}

function coerceManifestInput(input) {
  if (typeof input === 'string') {
    try {
      return { ok: true, value: JSON.parse(input) };
    } catch {
      return fail('', 'manifest is not valid JSON');
    }
  }
  if (input == null) {
    return fail('', 'manifest is required');
  }
  return { ok: true, value: input };
}

function validateImageEntry(image, path, errors) {
  if (!isPlainObject(image)) {
    errors.push({ path, message: 'image entry must be an object' });
    return null;
  }

  const id = readRequiredString(image, 'id', errors, path);
  const src = readRequiredString(image, 'src', errors, path);
  const anchor = validateAnchor(image.anchor, `${path}.anchor`, errors);

  if (!id || !src || !anchor) return null;
  const alt = typeof image.alt === 'string' ? image.alt.trim() : '';
  return alt ? { id, src, alt, anchor } : { id, src, anchor };
}

function validateAnchor(anchor, path, errors) {
  if (anchor == null) {
    errors.push({ path, message: 'anchor is required' });
    return null;
  }
  if (!isPlainObject(anchor)) {
    errors.push({ path, message: 'anchor must be an object' });
    return null;
  }
  if (anchor.type != null && anchor.type !== 'paragraph') {
    errors.push({
      path: `${path}.type`,
      message: 'anchor.type must be "paragraph" (page anchors are not allowed)',
    });
    return null;
  }

  // Brief: `{ paragraph }`. Inhalt #70: `{ type: "paragraph", index }`.
  const paragraph = Number.isInteger(anchor.paragraph)
    ? anchor.paragraph
    : Number.isInteger(anchor.index)
      ? anchor.index
      : null;
  if (paragraph == null || paragraph < 0) {
    errors.push({
      path: `${path}.paragraph`,
      message: 'anchor.paragraph (or Inhalt alias anchor.index) must be a non-negative integer',
    });
    return null;
  }

  let hash;
  if (anchor.hash != null) {
    if (typeof anchor.hash !== 'string' || anchor.hash.trim() === '') {
      errors.push({
        path: `${path}.hash`,
        message: 'anchor.hash must be a non-empty string when present',
      });
      return null;
    }
    hash = anchor.hash.trim();
  }

  return hash ? { paragraph, hash } : { paragraph };
}

function readRequiredString(obj, key, errors, prefix = '') {
  const path = prefix ? `${prefix}.${key}` : key;
  if (!Object.prototype.hasOwnProperty.call(obj, key) || obj[key] == null) {
    errors.push({ path, message: `${key} is required` });
    return null;
  }
  if (typeof obj[key] !== 'string' || obj[key].trim() === '') {
    errors.push({ path, message: `${key} must be a non-empty string` });
    return null;
  }
  return obj[key].trim();
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function fail(path, message) {
  return { ok: false, errors: [{ path, message }] };
}
