---
id: "adaption-switcher"
name: "Adaption Switcher"
type: "app"
flag_key: "adaption-switcher"
lifecycle: "STABLE"
flag_default: "on"
category: "typography"
personas:
  - "03-teachers"
  - "04-culture-explorers"
  - "06-creatives"
  - "10-gamified-explorers"
related_features:
  - "parallel-texts"
  - "choice-narratives"
  - "story-remix"
parent: null
children: []
---

# Adaption Switcher

**Flag:** `adaption-switcher` · **Lifecycle:** STABLE · **Default:** on
**Personas:** [Teachers](../personas/03-teachers.md) · [Culture Explorers](../personas/04-culture-explorers.md) · [Creatives](../personas/06-creatives.md) · [Gamified Explorers](../personas/10-gamified-explorers.md)

A dropdown in the reader that switches between the original story and alternative adaptations or variants.

## Behavior

- Variants tracked in `adaptionsByParent` — stories with a shared parent ID
- `VariantSwitcher` component renders a dropdown above the reader area
- Switching variant reloads the story content without leaving the reader
- Foundation for [Parallel Texts](parallel-texts.md) (show two variants side-by-side)

## Links

- [Back to Feature Matrix](../personas.md)
- [Parallel Texts](parallel-texts.md) — strategic extension
- [Story Remix](story-remix.md) — AI-generated variants surface here
