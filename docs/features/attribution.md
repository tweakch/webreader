---
id: "attribution"
name: "Attribution"
type: "app"
flag_key: "attribution"
lifecycle: "STABLE"
flag_default: "on"
category: "ui"
personas:
  - "03-teachers"
  - "04-culture-explorers"
  - "08-developers"
related_features:
  - "cultural-annotations"
  - "story-api"
parent: null
children: []
---

# Attribution

**Flag:** `attribution` · **Lifecycle:** STABLE · **Default:** on
**Personas:** [Teachers](../personas/03-teachers.md) · [Culture Explorers](../personas/04-culture-explorers.md) · [Developers](../personas/08-developers.md)

Displays the author and source on the last page of each story.

## Behavior

- Shown on the final page of the reader via `EndOfStoryButtons` component
- Attribution text sourced from story frontmatter (`author`, `source` fields)
- Critical for academic and educational use cases
- Metadata exposed in the [Story API](story-api.md)

## Links

- [Back to Feature Matrix](../personas.md)
- [Cultural Annotations](cultural-annotations.md) — contextual companion
