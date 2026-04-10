---
id: "favorites-only-toggle"
name: "Favorites-Only Toggle"
type: "app"
flag_key: "favorites-only-toggle"
lifecycle: "STABLE"
flag_default: "on"
category: "reader-core"
personas:
  - "07-passive-consumers"
  - "09-seniors"
  - "10-gamified-explorers"
related_features:
  - "favorites"
parent: "favorites"
children: []
---

# Favorites-Only Toggle

**Flag:** `favorites-only-toggle` · **Lifecycle:** STABLE · **Default:** on
**Personas:** [Passive Consumers](../personas/07-passive-consumers.md) · [Seniors](../personas/09-seniors.md) · [Gamified Explorers](../personas/10-gamified-explorers.md)

A toggle in the sidebar that filters the story list to saved favorites only.

## Behavior

- Appears as a filter icon or toggle in the sidebar header
- When active, the sidebar story list shows only stories in the favorites set
- Requires [Favorites](favorites.md) to be enabled

## Links

- [Back to Feature Matrix](../personas.md)
- [Favorites](favorites.md) — parent feature
