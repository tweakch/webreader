---
id: "story-directories"
name: "Story Directories"
type: "app"
flag_key: "story-directories"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "navigation"
personas:
  - "04-culture-explorers"
  - "08-developers"
  - "10-gamified-explorers"
related_features:
  - "story-map"
  - "deep-search"
  - "story-api"
parent: null
children: []
---

# Story Directories

**Flag:** `story-directories` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Culture Explorers](../personas/04-culture-explorers.md) · [Developers](../personas/08-developers.md) · [Gamified Explorers](../personas/10-gamified-explorers.md)

Displays stories in a three-level directory hierarchy: source → directory → story.

## Behavior

- When enabled, sidebar shows an intermediate directory level between source and story list
- `data-testid`: `directory-button`, `back-to-directories`
- Swiss canton stories already use the 3-level structure (`stories/swiss/{canton}/{slug}/`)
- `activeDirectory` state in `grimm-reader.jsx` tracks the current drill-down level

## Foundation For

- [Story Map](story-map.md) geographic browsing (directories = regions)
- [Story API](story-api.md) structured content hierarchy

## Links

- [Back to Feature Matrix](../personas.md)
- [Story Map](story-map.md) — strategic extension
- [Deep Search](deep-search.md) — search companion
