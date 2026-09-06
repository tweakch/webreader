const ANCHOR_TYPES = new Set(['page', 'paragraph']);

const manifestModules = import.meta.glob('/illustration-packs/*/v*/manifest.json', {
  eager: true,
  import: 'default',
});

const imageModules = import.meta.glob('/illustration-packs/*/v*/images/*.{svg,png,jpg,jpeg,webp}', {
  query: '?url',
  import: 'default',
  eager: true,
});

function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function parseAnchor(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (!ANCHOR_TYPES.has(raw.type)) return null;
  const index = Number(raw.index);
  if (!Number.isInteger(index) || index < 0) return null;
  return { type: raw.type, index };
}

function compareStoryVersions(a, b) {
  const na = Number(a);
  const nb = Number(b);
  if (Number.isFinite(na) && Number.isFinite(nb)) return na - nb;
  return String(a).localeCompare(String(b), 'en', { numeric: true });
}

function pickLatestPack(packs) {
  return [...packs].sort((a, b) => compareStoryVersions(a.storyVersion, b.storyVersion)).at(-1);
}

function resolvePackSrc(packDir, relSrc, imageModulesByPath) {
  const cleaned = String(relSrc).replace(/^\.\//, '');
  const abs = `${packDir}/${cleaned}`;
  const url = imageModulesByPath?.[abs];
  return typeof url === 'string' && url ? url : null;
}

/**
 * Normalize a pack manifest. Images with a missing file, bad anchor, or empty
 * src are dropped so callers can treat an incomplete pack as a partial set
 * instead of a pager failure.
 */
export function parseIllustrationPack(raw, { resolveSrc, manifestPath } = {}) {
  if (!raw || typeof raw !== 'object') return null;
  const packId = isNonEmptyString(raw.packId) ? raw.packId.trim() : null;
  const storyId = isNonEmptyString(raw.storyId) ? raw.storyId.trim() : null;
  if (!packId || !storyId) return null;

  const storyVersion = raw.storyVersion == null ? '1' : String(raw.storyVersion);
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
 * Resolve the illustration pack for a story. When `storyVersion` is omitted,
 * the highest matching version wins. A missing pack is `null`.
 */
export function getIllustrationPack(storyId, { storyVersion } = {}, packs = loadedPacks) {
  if (!storyId) return null;
  const matches = packs.filter((pack) => pack.storyId === storyId);
  if (matches.length === 0) return null;
  if (storyVersion != null && String(storyVersion) !== '') {
    const version = String(storyVersion);
    return matches.find((pack) => pack.storyVersion === version) || null;
  }
  return pickLatestPack(matches) || null;
}

/** Look up one pack image by page or paragraph anchor. Missing → `null`. */
export function getAnchoredIllustration(pack, anchor) {
  const parsed = parseAnchor(anchor);
  if (!pack || !parsed) return null;
  return (
    pack.images.find(
      (image) => image.anchor.type === parsed.type && image.anchor.index === parsed.index
    ) || null
  );
}
