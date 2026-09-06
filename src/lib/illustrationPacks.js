import { hashParagraphStart, splitStoryParagraphs } from './storyContentHash';

export { hashStoryContent, hashParagraphStart, splitStoryParagraphs } from './storyContentHash';

const manifestModules = import.meta.glob('/illustration-packs/*/v*/manifest.json', {
  eager: true,
  import: 'default',
});

const imageModules = import.meta.glob(
  '/illustration-packs/*/v*/images/*.{svg,png,jpg,jpeg,webp}',
  { query: '?url', import: 'default', eager: true }
);

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseAnchor(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.type !== 'paragraph') return null;
  const index = Number(raw.index);
  if (!Number.isInteger(index) || index < 0) return null;
  const hash = isNonEmptyString(raw.hash) ? raw.hash.trim() : null;
  return hash ? { type: 'paragraph', index, hash } : { type: 'paragraph', index };
}

function resolvePackSrc(packDir, relSrc, imageModulesByPath) {
  const cleaned = String(relSrc).replace(/^\.\//, '');
  const abs = `${packDir}/${cleaned}`;
  const url = imageModulesByPath?.[abs];
  return typeof url === 'string' && url ? url : null;
}

/**
 * Normalize a pack manifest. Page anchors, missing files, and empty srcs are
 * dropped (soft-fail) so an incomplete pack never breaks the pager.
 */
export function parseIllustrationPack(raw, { resolveSrc, manifestPath } = {}) {
  if (!raw || typeof raw !== 'object') return null;
  const packId = isNonEmptyString(raw.packId) ? raw.packId.trim() : null;
  const storyId = isNonEmptyString(raw.storyId) ? raw.storyId.trim() : null;
  const storyVersion = isNonEmptyString(raw.storyVersion) ? String(raw.storyVersion).trim() : null;
  if (!packId || !storyId || !storyVersion) return null;

  const locale = isNonEmptyString(raw.locale) ? raw.locale.trim() : null;
  const imagesIn = Array.isArray(raw.images) ? raw.images : [];
  const images = [];

  for (const item of imagesIn) {
    if (!item || typeof item !== 'object') continue;
    const id = isNonEmptyString(item.id) ? item.id.trim() : null;
    const relSrc = isNonEmptyString(item.src) ? item.src.trim() : null;
    const anchor = parseAnchor(item.anchor);
    if (!id || !relSrc || !anchor) continue;
    const src = typeof resolveSrc === 'function' ? resolveSrc(relSrc) : relSrc;
    if (!src) continue;
    const alt = isNonEmptyString(item.alt) ? item.alt.trim() : '';
    images.push({ id, src, relSrc, anchor, alt });
  }

  return {
    packId,
    storyId,
    storyVersion,
    locale,
    manifestPath: manifestPath || null,
    images,
  };
}

export function buildIllustrationPackIndex(manifests = {}, images = {}) {
  const packs = [];
  for (const [manifestPath, raw] of Object.entries(manifests)) {
    const packDir = manifestPath.replace(/\/manifest\.json$/, '');
    const pack = parseIllustrationPack(raw, {
      manifestPath,
      resolveSrc: (relSrc) => resolvePackSrc(packDir, relSrc, images),
    });
    if (pack) packs.push(pack);
  }
  return packs;
}

const loadedPacks = buildIllustrationPackIndex(manifestModules, imageModules);

/**
 * Exact `storyVersion` match only. A missing or different version is `null`
 * (soft-fail) — never a fallback pack for another text revision.
 */
export function getIllustrationPack(storyId, { storyVersion } = {}, packs = loadedPacks) {
  if (!storyId || storyVersion == null || String(storyVersion) === '') return null;
  const version = String(storyVersion);
  return packs.find((pack) => pack.storyId === storyId && pack.storyVersion === version) || null;
}

/** Look up one pack image by paragraph index. Missing → `null`. */
export function getAnchoredIllustration(pack, anchor) {
  const parsed = parseAnchor(typeof anchor === 'number' ? { type: 'paragraph', index: anchor } : anchor);
  if (!pack || !parsed) return null;
  return pack.images.find((image) => image.anchor.index === parsed.index) || null;
}

function skipReason(image, paragraphs) {
  const { index, hash } = image.anchor;
  if (!image.src) return { reason: 'missing-src', imageId: image.id, index };
  if (!Array.isArray(paragraphs) || !hash) return null;
  const live = paragraphs[index];
  if (live == null) return { reason: 'paragraph-missing', imageId: image.id, index };
  if (hashParagraphStart(live) !== hash) {
    return { reason: 'paragraph-hash-mismatch', imageId: image.id, index };
  }
  return null;
}

/**
 * Soft-fail slot map for Feel / Bild-Slot: paragraph index → image.
 * Version mismatch, page anchors, missing files, and paragraph-hash drift
 * skip that image and record a reason — the pager is unchanged.
 */
export function getIllustrationSlotMap(storyId, { storyVersion, content, paragraphs } = {}, packs = loadedPacks) {
  const byParagraph = new Map();
  const skipped = [];
  const paras = Array.isArray(paragraphs)
    ? paragraphs
    : content != null
      ? splitStoryParagraphs(content)
      : null;

  const pack = getIllustrationPack(storyId, { storyVersion }, packs);
  if (!pack) {
    skipped.push({
      reason: storyVersion ? 'version-mismatch' : 'version-required',
      storyId: storyId || null,
      storyVersion: storyVersion == null ? null : String(storyVersion),
    });
    return { byParagraph, skipped, pack: null };
  }

  for (const image of pack.images) {
    const fail = skipReason(image, paras);
    if (fail) {
      skipped.push(fail);
      continue;
    }
    byParagraph.set(image.anchor.index, image);
  }

  return { byParagraph, skipped, pack };
}
