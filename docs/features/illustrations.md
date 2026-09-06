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
parent: null
children: []
---

# Illustrations

**Flag:** `illustrations` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Pre-Readers](../personas/01-pre-readers.md) · [Parents](../personas/02-parents.md)

Displays story-appropriate illustrations when available. Images are **additional downloadable content** — they are not embedded in story Markdown.

## Behavior

- Flag default is **off**. Callers check the flag before rendering; the loader itself always resolves packs so a missing pack or a disabled flag leaves the pager unchanged.
- A missing, unreadable, or unresolvable image is skipped. The pager does not fail.
- Story `content.md` stays text-only. Do not inline images in Markdown.

## Per-story illustration packs (primary model)

Packs live outside the story tree:

```
illustration-packs/<story-slug>/v<version>/
  manifest.json
  images/
    01-….svg
```

`manifest.json` is the source of truth for _which story version_ an image belongs to and _where_ it anchors:

```json
{
  "packId": "die_sterntaler-v1",
  "storyId": "grimm-klassiker/die_sterntaler",
  "storyVersion": "1",
  "locale": "de",
  "images": [
    {
      "id": "girl-in-field",
      "src": "images/01-girl-in-field.svg",
      "alt": "Ein kleines Mädchen geht mit einem Stück Brot hinaus aufs Feld.",
      "anchor": { "type": "paragraph", "index": 0 }
    }
  ]
}
```

| Field          | Role                                                                                  |
| -------------- | ------------------------------------------------------------------------------------- |
| `storyId`      | Library id (`source/slug`, or `source/directory/slug`)                                |
| `storyVersion` | Illustrated text revision. A pack for version N is not applied to a different version |
| `anchor.type`  | `page` or `paragraph` (0-based `index`)                                               |
| `src`          | Path relative to the pack directory, resolved at build time                           |

Style is consistent **within a pack** (per story). Placeholder SVGs are acceptable for pilots.

**Pilot:** `grimm-klassiker/die_sterntaler` · pack `die_sterntaler-v1` (girl in the field, giving bread, stars falling).

### Resolve API

`src/lib/illustrationPacks.js` is loaded at build time via `import.meta.glob`. `src/lib/storyLibrary.js` re-exports it:

- `getStoryIllustrationPack(storyId, { storyVersion }?)` — pack or `null`
- `getAnchoredIllustration(pack, { type, index })` — one image or `null`
- `getStoryIllustrations(storyId)` — collection chrome (`opening` / `ending` / `ornament`) plus `pack` when either exists

Page-slot rendering (Chrome-Hide / Bild-Slot) is owned separately. This module only resolves _what_ to show and _where_ it belongs.

## Collection-level illustrations (companion model)

Installed collection packages may still export shared `opening`, `ending`, and `ornament` SVGs (`packages/collection-*/assets/`). Those wrap the story (title page, last page, paragraph dividers) and are **not** per-story or anchored. See [Curated collections](../collections.md).

Story `cover` files remain a title-page fallback, distinct from the pack.

## Links

- [Back to Feature Matrix](../personas.md)
- [Read-Along](read-along.md) — pairs with narration for immersive experience
- [Child Profile](child-profile.md) — illustrations always on in child mode
