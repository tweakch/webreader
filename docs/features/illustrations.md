---
id: "illustrations"
name: "Illustrations"
type: "app"
flag_key: "illustrations"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "gen-alpha"
personas:
  - "01-pre-readers"
  - "02-parents"
related_features:
  - "read-along"
  - "child-profile"
  - "tap-middle-toggle"
parent: null
children: []
---

# Illustrations

**Flag:** `illustrations` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Pre-Readers](../personas/01-pre-readers.md) · [Parents](../personas/02-parents.md)

Displays story-appropriate illustrations when available. Images are **additional downloadable content** — they are not embedded in story Markdown.

## Behavior

- Flag default is **off**. Callers check the flag before rendering.
- Missing, unreadable, version-mismatched, or unresolvable images are **soft-failed** (skipped). The pager does not throw or change layout.
- Story `content.md` stays text-only. Do not inline images in Markdown.

## Per-story illustration packs (primary model)

Packs live outside the story tree:

```
illustration-packs/<story-slug>/v<version>/
  manifest.json
  images/
    01-….svg
```

`manifest.json` pins each image to a **story text revision** and a **paragraph**, never a page:

```json
{
  "packId": "die_sterntaler-v1",
  "storyId": "grimm-klassiker/die_sterntaler",
  "storyVersion": "3645b111",
  "locale": "de",
  "images": [
    {
      "id": "girl-in-field",
      "src": "images/01-girl-in-field.svg",
      "alt": "Ein kleines Mädchen geht mit einem Stück Brot hinaus aufs Feld.",
      "anchor": { "type": "paragraph", "index": 0, "hash": "e1f839ba" }
    }
  ]
}
```

| Field | Role |
|---|---|
| `storyId` | Library id (`source/slug`, or `source/directory/slug`) |
| `storyVersion` | Exact content hash of the story body (or a frontmatter version string). The loader matches **exactly** or skips the image |
| `anchor.type` | **`paragraph` only.** Page indexes drift with font / high-contrast / big-fonts and must not be used |
| `anchor.index` | 0-based paragraph index — same split as the pager (`content.split('\\n\\n')`) |
| `anchor.hash` | Optional FNV-1a of the paragraph's first 48 characters. Mismatch → skip that image |
| `src` | Path relative to the pack directory, resolved at build time |

`storyVersion` and `anchor.hash` are FNV-1a 32-bit hex of UTF-8 bytes (`hashStoryContent` / `hashParagraphStart` in `src/lib/storyContentHash.js`). Hash the post-frontmatter body (`trimEnd`, same as `storyLibrary` parse).

Style is consistent **within a pack** (per story). Placeholder SVGs are acceptable for pilots.

**Pilot:** `grimm-klassiker/die_sterntaler` · pack `die_sterntaler-v1` (girl in the field, giving bread, stars falling) — three paragraph anchors, no page anchors.

### Resolve API (soft-fail Map)

`src/lib/illustrationPacks.js` is loaded at build time via `import.meta.glob`. `src/lib/storyLibrary.js` re-exports it.

Feel / Bild-Slot should consume **`getIllustrationSlotMap`**, not page indexes:

```js
const storyVersion = hashStoryContent(story.content);
const { byParagraph, skipped, pack } = getIllustrationSlotMap(story.id, {
  storyVersion,
  content: story.content,
});
const image = byParagraph.get(paragraphIndex); // undefined if skipped
```

- `byParagraph` — `Map<paragraphIndex, image>` of images that resolved
- `skipped` — `{ reason, imageId?, index? }[]` (`version-mismatch`, `version-required`, `missing-src`, `paragraph-missing`, `paragraph-hash-mismatch`)
- `getStoryIllustrationPack(storyId, { storyVersion })` — pack or `null` (exact version only)
- `getAnchoredIllustration(pack, { type: 'paragraph', index })` — one image or `null`
- `getStoryIllustrations(storyId, { storyVersion, content })` — collection chrome (`opening` / `ending` / `ornament`) plus `pack`, `byParagraph`, and `skipped`

Page-slot rendering (Chrome-Hide / Bild-Slot) is owned by Lesefluss. This module only resolves *what* belongs on *which paragraph*.

## Bild-Slot + Chrome-Hide (Lesefluss)

When the `illustrations` flag is on, `useReader` consumes `getIllustrationSlotMap` and inserts **one dedicated pager page** after each resolved paragraph in `byParagraph`. Word-packing continues around the slot. Empty `byParagraph` / skipped images → pager unchanged.

Full-screen Vorlesen uses the existing [Tap Middle Toggle](tap-middle-toggle.md) path — no new gestures, `enhanced-gestures` stays off.

## Collection-level illustrations (companion model)

Installed collection packages may still export shared `opening`, `ending`, and `ornament` SVGs (`packages/collection-*/assets/`). Those wrap the story (title page, last page, paragraph dividers) and are **not** per-story or paragraph-anchored. See [Curated collections](../collections.md).

Story `cover` files remain a title-page fallback, distinct from the pack.

## Links

- [Back to Feature Matrix](../personas.md)
- [Read-Along](read-along.md) — pairs with narration for immersive experience
- [Child Profile](child-profile.md) — illustrations always on in child mode
