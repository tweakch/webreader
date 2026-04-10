---
id: "word-count"
name: "Word Count"
type: "app"
flag_key: "word-count"
lifecycle: "STABLE"
flag_default: "off"
category: "reader-stats"
personas:
  - "03-teachers"
  - "10-gamified-explorers"
related_features:
  - "reading-duration"
parent: null
children: []
---

# Word Count

**Flag:** `word-count` · **Lifecycle:** STABLE · **Default:** off
**Personas:** [Teachers](../personas/03-teachers.md) · [Gamified Explorers](../personas/10-gamified-explorers.md)

Displays the number of words in a story in the sidebar metadata.

## Behavior

- Word count shown alongside the story title in the sidebar list
- Computed at load time from the story's token array
- Serves as a quick signal for lesson planning (Teachers) and completionism (Gamified)

## Links

- [Back to Feature Matrix](../personas.md)
- [Reading Duration](reading-duration.md) — sibling stat feature
