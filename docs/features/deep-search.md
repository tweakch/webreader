---
id: "deep-search"
name: "Deep Search"
type: "app"
flag_key: "deep-search"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "search"
personas:
  - "03-teachers"
  - "04-culture-explorers"
  - "06-creatives"
  - "08-developers"
related_features:
  - "story-directories"
  - "story-api"
  - "story-map"
parent: null
children: []
---

# Deep Search

**Flag:** `deep-search` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Teachers](../personas/03-teachers.md) · [Culture Explorers](../personas/04-culture-explorers.md) · [Creatives](../personas/06-creatives.md) · [Developers](../personas/08-developers.md)

Extends search from story titles to the full text of every story in the library.

## Behavior

- Sidebar search input runs against story body content, not just metadata
- Slower on large libraries — progressive indexing recommended
- Foundation for [Story API](story-api.md) search endpoint
- Enables motif hunting and cross-story research for Creatives and Teachers

## Links

- [Back to Feature Matrix](../personas.md)
- [Story Directories](story-directories.md) — navigation companion
- [Story API](story-api.md) — strategic extension
