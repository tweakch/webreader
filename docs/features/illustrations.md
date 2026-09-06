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

| Field                       | Required | Notes                                                                                                                        |
| --------------------------- | -------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `storyId`                   | yes      | Canonical id, e.g. `grimm-klassiker/die_sterntaler`                                                                          |
| `storyVersion`              | yes      | **Exact** match against frontmatter `version`, else the content hash from `computeStoryVersion()`                            |
| `packId`                    | yes      | Stable pack id, e.g. `die-sterntaler-v1`                                                                                     |
| `images[]`                  | yes      | May be empty                                                                                                                 |
| `images[].id`               | yes      | Unique within the pack                                                                                                       |
| `images[].src`              | yes      | Filename relative to the pack dir, or an absolute `http(s)` URL                                                              |
| `images[].anchor.paragraph` | yes      | **0-based** paragraph index. Same blank-line split as the pager. Do **not** anchor by page — pages drift with font/viewport. |
| `images[].anchor.hash`      | no       | `hashParagraphStart(paragraph)` of the first 64 collapsed characters. Mismatch skips **only that image**.                    |

Unknown extra fields are ignored.

### Version pin (Inhalt)

Prefer an explicit frontmatter field so packs do not churn on whitespace:

```yaml
version: '1'
```

`storyVersion` in the manifest must equal `"1"`. If `version` is absent, the loader hashes the pager body (`fnv1a:<8 hex chars>` via `computeStoryVersion`). Mismatch → skip the whole pack.

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
  computeStoryVersion,
  hashParagraphStart,
} from '../src/lib/storyLibrary';
// PageContent already calls getStoryIllustrations(selectedStory) when the flag
// is on; use `.slots` / `.pack`. Do not render until this slice lands.

const pack = getStoryIllustrationSlots(selectedStory);
// pack.status: 'empty' | 'skipped' | 'matched'
// pack.slots: [{ id, src, paragraphIndex, packId }]
// pack.skipped: [{ id, reason }]
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
