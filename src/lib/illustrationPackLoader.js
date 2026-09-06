import { validateIllustrationPackManifest } from './illustrationPackSchema';
import { hashParagraphStart, hashStoryContent, splitStoryParagraphs } from './storyContentHash';

export { hashParagraphStart, hashStoryContent, splitStoryParagraphs } from './storyContentHash';

const bundledPackManifests = import.meta.glob('/illustration-packs/*/v*/manifest.json', {
  eager: true,
  import: 'default',
});
const bundledPackAssets = import.meta.glob('/illustration-packs/*/*/**/*.{svg,png,jpg,jpeg,webp}', {
  query: '?url',
  eager: true,
  import: 'default',
});

export const ILLUSTRATION_PACK_SKIP = {
  INVALID_MANIFEST: 'invalid-manifest',
  STORY_MISMATCH: 'story-mismatch',
  VERSION_MISMATCH: 'version-mismatch',
  NO_PACK: 'no-pack',
  MISSING_SRC: 'missing-src',
  ANCHOR_OUT_OF_RANGE: 'anchor-out-of-range',
  ANCHOR_HASH_MISMATCH: 'anchor-hash-mismatch',
  ANCHOR_PAGE: 'page-anchor',
  DUPLICATE_ID: 'duplicate-id',
  DUPLICATE_PARAGRAPH: 'duplicate-paragraph',
};

/**
 * Empty pack result. Lesefluss must treat `slots: []` as "render the
 * pager exactly as today" — no reserved image height, no layout change.
 *
 * @param {string} [reason]
 * @param {object} [extra]
 * @returns {IllustrationPackResult}
 */
export function emptyIllustrationPackResult(reason = ILLUSTRATION_PACK_SKIP.NO_PACK, extra = {}) {
  const status = reason === ILLUSTRATION_PACK_SKIP.NO_PACK ? 'empty' : 'skipped';
  return {
    status,
    reason,
    packId: extra.packId ?? null,
    storyId: extra.storyId ?? null,
    storyVersion: extra.storyVersion ?? null,
    slots: [],
    skipped: extra.skipped ?? [],
    errors: extra.errors ?? [],
  };
}

/**
 * Canonical version a pack must exact-match.
 * Prefers frontmatter `version`; otherwise hashes the pager body
 * with the same FNV-1a UTF-8 hex as Inhalt (#70).
 *
 * @param {{ version?: string | null, content?: string | null } | null | undefined} story
 */
export function computeStoryVersion(story) {
  const declared = story?.version;
  if (typeof declared === 'string' && declared.trim()) return declared.trim();
  if (typeof declared === 'number' && Number.isFinite(declared)) return String(declared);
  return hashStoryContent(story?.content ?? '');
}

/**
 * Resolve one pack against a story. Never throws. Version mismatch or a
 * broken manifest yields `slots: []` so the word-packing pager is unchanged.
 *
 * @param {object} opts
 * @param {string} opts.storyId
 * @param {string} [opts.storyVersion]
 * @param {string[]} [opts.paragraphs]
 * @param {unknown} opts.manifest
 * @param {Record<string, string> | null} [opts.assets] relative src → resolved URL
 * @returns {IllustrationPackResult}
 */
export function resolveIllustrationPack({
  storyId,
  storyVersion,
  paragraphs,
  manifest,
  assets = null,
} = {}) {
  const validated = validateIllustrationPackManifest(manifest, { lenient: true });
  if (!validated.ok) {
    return emptyIllustrationPackResult(ILLUSTRATION_PACK_SKIP.INVALID_MANIFEST, {
      storyId: storyId ?? null,
      storyVersion: storyVersion ?? null,
      errors: validated.errors,
    });
  }

  const pack = validated.value;
  const expectedVersion = storyVersion ?? null;

  if (storyId && pack.storyId !== storyId) {
    return emptyIllustrationPackResult(ILLUSTRATION_PACK_SKIP.STORY_MISMATCH, {
      packId: pack.packId,
      storyId,
      storyVersion: expectedVersion,
    });
  }

  if (expectedVersion != null && pack.storyVersion !== expectedVersion) {
    return emptyIllustrationPackResult(ILLUSTRATION_PACK_SKIP.VERSION_MISMATCH, {
      packId: pack.packId,
      storyId: pack.storyId,
      storyVersion: expectedVersion,
    });
  }

  const paras = Array.isArray(paragraphs) ? paragraphs : [];
  const slots = [];
  const skipped = [];
  const seenIds = new Set();
  const seenParagraphs = new Set();

  for (const image of pack.images) {
    if (seenIds.has(image.id)) {
      skipped.push({ id: image.id, reason: ILLUSTRATION_PACK_SKIP.DUPLICATE_ID });
      continue;
    }
    seenIds.add(image.id);

    const resolvedSrc = resolvePackSrc(image.src, assets);
    if (!resolvedSrc) {
      skipped.push({ id: image.id, reason: ILLUSTRATION_PACK_SKIP.MISSING_SRC });
      continue;
    }

    const paragraphIndex = image.anchor.paragraph;
    if (paragraphIndex >= paras.length) {
      skipped.push({ id: image.id, reason: ILLUSTRATION_PACK_SKIP.ANCHOR_OUT_OF_RANGE });
      continue;
    }

    if (image.anchor.hash) {
      const actual = hashParagraphStart(paras[paragraphIndex]);
      if (actual !== image.anchor.hash) {
        skipped.push({ id: image.id, reason: ILLUSTRATION_PACK_SKIP.ANCHOR_HASH_MISMATCH });
        continue;
      }
    }

    if (seenParagraphs.has(paragraphIndex)) {
      skipped.push({ id: image.id, reason: ILLUSTRATION_PACK_SKIP.DUPLICATE_PARAGRAPH });
      continue;
    }
    seenParagraphs.add(paragraphIndex);

    slots.push({
      id: image.id,
      src: resolvedSrc,
      paragraphIndex,
      packId: pack.packId,
      alt: image.alt || '',
    });
  }

  return {
    status: 'matched',
    reason: null,
    packId: pack.packId,
    storyId: pack.storyId,
    storyVersion: pack.storyVersion,
    slots,
    skipped,
    errors: [],
  };
}

/** Vite-bundled packs under `illustration-packs/<slug>/vN/`. Empty until Inhalt lands a pack. */
export const bundledIllustrationPackRegistry = createIllustrationPackRegistry({
  manifests: bundledPackManifests,
  assets: bundledPackAssets,
});

/**
 * Build a registry from Vite `import.meta.glob` maps (or test fixtures).
 * Picks the pack whose `storyId` + `storyVersion` exact-match; if several
 * path versions match (`v1`, `v2`), the highest `vN` wins.
 *
 * @param {{ manifests?: Record<string, unknown>, assets?: Record<string, string> }} maps
 */
export function createIllustrationPackRegistry({ manifests = {}, assets = {} } = {}) {
  const entries = Object.entries(manifests).map(([path, raw]) => ({
    path,
    packDir: packDirFromManifestPath(path),
    manifest: raw,
  }));

  return {
    resolveForStory(story) {
      if (!story?.id) return emptyIllustrationPackResult(ILLUSTRATION_PACK_SKIP.NO_PACK);
      const storyVersion = computeStoryVersion(story);
      const paragraphs = splitStoryParagraphs(story.content);

      const forStory = [];
      for (const entry of entries) {
        const validated = validateIllustrationPackManifest(entry.manifest, { lenient: true });
        if (!validated.ok) continue;
        if (validated.value.storyId !== story.id) continue;
        forStory.push({ ...entry, value: validated.value });
      }

      if (forStory.length === 0) {
        return emptyIllustrationPackResult(ILLUSTRATION_PACK_SKIP.NO_PACK, {
          storyId: story.id,
          storyVersion,
        });
      }

      const versionMatched = forStory.filter((entry) => entry.value.storyVersion === storyVersion);
      if (versionMatched.length === 0) {
        return emptyIllustrationPackResult(ILLUSTRATION_PACK_SKIP.VERSION_MISMATCH, {
          storyId: story.id,
          storyVersion,
        });
      }

      versionMatched.sort((a, b) => packPathVersion(a.path) - packPathVersion(b.path));
      const chosen = versionMatched[versionMatched.length - 1];

      return resolveIllustrationPack({
        storyId: story.id,
        storyVersion,
        paragraphs,
        manifest: chosen.value,
        assets: assetsForPackDir(assets, chosen.packDir),
      });
    },

    /** Pack metadata + resolved srcs, no paragraph-hash check (Inhalt `getIllustrationPack`). */
    getPack(storyId, storyVersion) {
      if (!storyId || storyVersion == null || String(storyVersion) === '') return null;
      const version = String(storyVersion);
      const matches = [];
      for (const entry of entries) {
        const validated = validateIllustrationPackManifest(entry.manifest, { lenient: true });
        if (!validated.ok) continue;
        if (validated.value.storyId !== storyId || validated.value.storyVersion !== version)
          continue;
        matches.push({ ...entry, value: validated.value });
      }
      if (matches.length === 0) return null;
      matches.sort((a, b) => packPathVersion(a.path) - packPathVersion(b.path));
      const chosen = matches[matches.length - 1];
      const packAssets = assetsForPackDir(assets, chosen.packDir);
      const images = chosen.value.images
        .map((image) => {
          const src = resolvePackSrc(image.src, packAssets);
          if (!src) return null;
          return {
            id: image.id,
            src,
            relSrc: image.src,
            alt: image.alt || '',
            anchor: {
              type: 'paragraph',
              index: image.anchor.paragraph,
              ...(image.anchor.hash ? { hash: image.anchor.hash } : {}),
            },
          };
        })
        .filter(Boolean);
      return {
        packId: chosen.value.packId,
        storyId: chosen.value.storyId,
        storyVersion: chosen.value.storyVersion,
        images,
      };
    },
  };
}

export function packDirFromManifestPath(manifestPath) {
  return String(manifestPath).replace(/\/manifest\.json$/i, '');
}

export function packPathVersion(manifestPath) {
  const match = String(manifestPath).match(/\/v(\d+)\//i);
  return match ? Number(match[1]) : 0;
}

function assetsForPackDir(assets, packDir) {
  const prefix = packDir.endsWith('/') ? packDir : `${packDir}/`;
  const map = {};
  for (const [assetPath, url] of Object.entries(assets)) {
    if (assetPath.startsWith(prefix)) {
      map[assetPath.slice(prefix.length)] = url;
    }
  }
  return map;
}

/**
 * Relative filenames must resolve through `assets` when a map is provided
 * (missing file → skip that image). Absolute http(s) URLs and root-relative
 * paths pass through. Without an assets map, a non-empty relative src is
 * returned as-is so unit tests can map without Vite URLs.
 */
export function resolvePackSrc(src, assets) {
  if (typeof src !== 'string' || src.trim() === '') return null;
  const trimmed = src.trim();
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith('/')) return trimmed;
  if (trimmed.startsWith('data:')) return trimmed;
  if (assets && typeof assets === 'object') {
    return typeof assets[trimmed] === 'string' && assets[trimmed] ? assets[trimmed] : null;
  }
  return trimmed;
}

/** Feel API (Inhalt #70): paragraph index → slot. Soft-fail → empty Map. */
export function toIllustrationSlotMap(result) {
  const byParagraph = new Map();
  for (const slot of result.slots) byParagraph.set(slot.paragraphIndex, slot);
  return {
    byParagraph,
    skipped: result.skipped,
    pack:
      result.status === 'matched'
        ? { packId: result.packId, storyId: result.storyId, storyVersion: result.storyVersion }
        : null,
  };
}

export function getIllustrationSlotMap(storyOrId, opts = {}) {
  const story =
    typeof storyOrId === 'string'
      ? { id: storyOrId, version: opts.storyVersion, content: opts.content }
      : {
          ...storyOrId,
          version: opts.storyVersion ?? storyOrId?.version,
          content: opts.content ?? storyOrId?.content,
        };
  const result = opts.manifest
    ? resolveIllustrationPack({
        storyId: story.id,
        storyVersion: opts.storyVersion ?? computeStoryVersion(story),
        paragraphs: opts.paragraphs ?? splitStoryParagraphs(story.content),
        manifest: opts.manifest,
        assets: opts.assets ?? null,
      })
    : bundledIllustrationPackRegistry.resolveForStory(story);
  return { ...toIllustrationSlotMap(result), result };
}

export function getIllustrationPack(storyId, { storyVersion } = {}) {
  return bundledIllustrationPackRegistry.getPack(storyId, storyVersion);
}

/**
 * @typedef {object} IllustrationSlot
 * @property {string} id
 * @property {string} src
 * @property {number} paragraphIndex
 * @property {string} packId
 */

/**
 * @typedef {object} IllustrationPackResult
 * @property {'empty' | 'skipped' | 'matched'} status
 * @property {string | null} reason
 * @property {string | null} packId
 * @property {string | null} storyId
 * @property {string | null} storyVersion
 * @property {IllustrationSlot[]} slots
 * @property {Array<{ id: string | null, reason: string }>} skipped
 * @property {Array<{ path: string, message: string }>} errors
 */
