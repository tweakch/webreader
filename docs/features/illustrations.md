---
id: 'illustrations'
name: 'Illustrations'
type: 'app'
flag_key: 'illustrations'
lifecycle: 'EXPERIMENT'
flag_default: 'off'
category: 'gen-alpha'
personas:
  - '01-pre-readers'
  - '02-parents'
related_features:
  - 'read-along'
  - 'child-profile'
parent: null
children: []
---

# Illustrations

**Flag:** `illustrations` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Pre-Readers](../personas/01-pre-readers.md) · [Parents](../personas/02-parents.md)

Downloadable extra-content illustration packs, resolved per story version and anchored to **paragraphs** (not pages). Images are **not** embedded in Markdown.

Keep the flag **off** until the Lesefluss (slot / Chrome-Hide) and Inhalt (pilot pack) slices land. The loader still works when the flag is on.

## Enable for local pilot

Default stays `off` in `flags.json`. To try the loader:

1. Profile panel → toggle **Illustrationen**, or
2. Child profile (umbrella forces illustrations on), or
3. Override `illustrations` → `on` in the debug flag HUD

Without a matching pack, the word-packing pager is unchanged.

## External pack model

Packs live **outside** the story folder:

```
illustration-packs/<storySlug>/v1/
  manifest.json
  *.svg|png|jpg|jpeg|webp
```

Pilot story (Inhalt): `grimm-klassiker/die_sterntaler` → `illustration-packs/die_sterntaler/v1/`.

JSON Schema: [`illustration-packs/manifest.schema.json`](../../illustration-packs/manifest.schema.json)

### `manifest.json`

| Field                       | Required | Notes                                                                                                                   |
| --------------------------- | -------- | ----------------------------------------------------------------------------------------------------------------------- |
| `storyId`                   | yes      | Canonical id, e.g. `grimm-klassiker/die_sterntaler`                                                                     |
| `storyVersion`              | yes      | **Exact** match against frontmatter `version`, else `hashStoryContent(body)` (FNV-1a UTF-8, 8 hex — same as Inhalt #70) |
| `packId`                    | yes      | Stable pack id, e.g. `die-sterntaler-v1`                                                                                |
| `images[]`                  | yes      | May be empty                                                                                                            |
| `images[].id`               | yes      | Unique within the pack                                                                                                  |
| `images[].src`              | yes      | Filename relative to the pack dir, or an absolute `http(s)` URL                                                         |
| `images[].alt`              | no       | Optional accessible label                                                                                               |
| `images[].anchor.paragraph` | yes\*    | **0-based** paragraph index (Technik brief). Same blank-line split as the pager. Do **not** use page.                   |
| `images[].anchor.index`     | yes\*    | Inhalt #70 alias for `paragraph`, with `type: "paragraph"`                                                              |
| `images[].anchor.hash`      | no       | `hashParagraphStart(paragraph)` — first 48 trimmed chars, FNV-1a UTF-8 hex. Mismatch skips **only that image**.         |

Unknown extra fields are ignored.

### Version pin (Inhalt)

Prefer an explicit frontmatter field so packs do not churn on whitespace:

```yaml
version: '1'
```

`storyVersion` in the manifest must equal `"1"`. If `version` is absent, the loader hashes the pager body (`hashStoryContent` → 8 hex chars, e.g. Sterntaler `3645b111`). Mismatch → skip the whole pack.

The loader accepts **both** anchor spellings so #70 can merge without a rewrite.

### Soft-fail (Technik contract)

The loader **never throws**. Any of the following yields `slots: []` and the pager stays word-packing with no reserved image height:

- no pack for this `storyId`
- invalid / unreadable manifest
- `storyVersion` mismatch
- missing image file (that image only)
- paragraph index out of range (that image only)
- optional `anchor.hash` mismatch (that image only)
- duplicate `id` or duplicate paragraph (later entry skipped)

Missing image / version mismatch must **not** break layout.

## How Lesefluss should consume resolved images

Do not change `buildPages` measurement unless a slot is actually present. Call:

```js
import {
  getStoryIllustrationSlots,
  getIllustrationSlotMap,
  computeStoryVersion,
  hashParagraphStart,
} from '../src/lib/storyLibrary';

const pack = getStoryIllustrationSlots(selectedStory);
// pack.status: 'empty' | 'skipped' | 'matched'
// pack.slots: [{ id, src, paragraphIndex, packId, alt }]
// pack.skipped: [{ id, reason }]

// Inhalt #70 Feel alias — same data as a Map:
const { byParagraph, skipped } = getIllustrationSlotMap(selectedStory.id, {
  storyVersion: computeStoryVersion(selectedStory),
  content: selectedStory.content,
});
```

- If `pack.slots` is empty → render exactly as today (cover / collection ornament only).
- If a slot exists → one image after that paragraph; reserve height in measurement **only for those paragraphs**.
- Chrome-Hide / Feel stays in the Lesefluss slice. This loader does not add gestures.
- Collection-level `opening` / `ending` / `ornament` (from `packages/collection-*`) is unchanged and still gated by the same flag.

## Behavior

- Flag default **off**
- Images are extra packs, not files next to `content.md`
- App binds each image to `storyId` + `storyVersion` + paragraph index
- Responsive width (reading column) is a Lesefluss/render concern
- Child profile still forces the flag on (existing umbrella)

## Links

- [Back to Feature Matrix](../personas.md)
- [Read-Along](read-along.md) — pairs with narration for immersive experience
- [Child Profile](child-profile.md) — illustrations always on in child mode
