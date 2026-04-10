---
id: "favorites"
name: "Favorites"
type: "app"
flag_key: "favorites"
lifecycle: "STABLE"
flag_default: "on"
category: "reader-core"
personas:
  - "07-passive-consumers"
  - "09-seniors"
  - "10-gamified-explorers"
  - "05-therapeutic"
related_features:
  - "favorites-only-toggle"
  - "achievements"
  - "mood-recommendations"
parent: null
children:
  - "favorites-only-toggle"
---

# Favorites

**Flag:** `favorites` · **Lifecycle:** STABLE · **Default:** on
**Personas:** [Passive Consumers](../personas/07-passive-consumers.md) · [Seniors](../personas/09-seniors.md) · [Gamified Explorers](../personas/10-gamified-explorers.md) · [Therapeutic](../personas/05-therapeutic.md)

Save stories with a heart icon and access them as a personal collection.

## Behavior

- Heart button appears in the story list and in the reader toolbar
- Favorites persisted to `localStorage` via `usePersistence`
- Combined with [Favorites-Only Toggle](favorites-only-toggle.md) to filter the sidebar to saved stories

## Links

- [Back to Feature Matrix](../personas.md)
- [Favorites-Only Toggle](favorites-only-toggle.md) — child feature
- [Achievements](achievements.md) — collecting favorites counts toward milestones
