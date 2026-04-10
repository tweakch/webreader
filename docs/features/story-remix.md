---
id: "story-remix"
name: "Story Remix"
type: "strategic"
status: "vision"
category: "creative"
personas:
  - "06-creatives"
  - "08-developers"
related_features:
  - "story-api"
  - "adaption-switcher"
  - "choice-narratives"
  - "symbol-analysis"
parent: null
children: []
---

# Story Remix

**Status:** Vision
**Personas:** [Creatives](../personas/06-creatives.md) · [Developers](../personas/08-developers.md)

AI-assisted story transformation: retelling, style transfer, genre shift, and mashup.

## Remix Modes

| Mode | Description |
|---|---|
| Style transfer | Grimm → Sci-Fi · Modern · Horror · Romance |
| Character swap | Replace characters with user-defined ones |
| Mashup | Combine two story archetypes into one new tale |
| Continuation | Generate a sequel or alternate ending |
| Simplification | Adapt a classic for younger readers |

## Implementation Notes

- Claude API call with the source story + a structured remix prompt
- Output rendered directly in the reader with a "Remixed" badge in the variant switcher
- Remix variants stored ephemerally (session) or saved to a user library
- For [Developers](../personas/08-developers.md): expose remix as an API endpoint

## Links

- [Back to Feature Matrix](../personas.md)
- [Story API](story-api.md)
- [Adaption Switcher](adaption-switcher.md) — existing app flag (surface for output)
