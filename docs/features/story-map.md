---
id: "story-map"
name: "Story Map"
type: "strategic"
status: "vision"
category: "discovery"
personas:
  - "04-culture-explorers"
  - "10-gamified-explorers"
related_features:
  - "achievements"
  - "cultural-annotations"
  - "story-directories"
  - "symbol-analysis"
parent: null
children:
  - "achievements"
---

# Story Map

**Status:** Vision
**Personas:** [Culture Explorers](../personas/04-culture-explorers.md) · [Gamified Explorers](../personas/10-gamified-explorers.md)

A visual geographic and thematic map for discovering stories by origin, motif, or region.

## Map Modes

| Mode | Description |
|---|---|
| Geographic | Stories pinned to their cultural origin on a world map |
| Motif graph | Network view of stories connected by shared archetypes |
| Timeline | Stories plotted by era of first written record |
| Completion | Personal progress overlay — read vs. unread |

## Implementation Notes

- Geographic coordinates can be added to story frontmatter during crawl
- The Swiss canton structure (`stories/swiss/{canton}/`) already has built-in geographic metadata
- `graphify-out/` knowledge graph maps naturally to the motif network view
- Completion overlay uses the existing `completedStories` set from `usePersistence`

## Links

- [Back to Feature Matrix](../personas.md)
- [Achievements](achievements.md)
- [Cultural Annotations](cultural-annotations.md)
- [Story Directories](story-directories.md) — existing app flag (geographic foundation)
