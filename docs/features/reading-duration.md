---
id: "reading-duration"
name: "Reading Duration"
type: "app"
flag_key: "reading-duration"
lifecycle: "STABLE"
flag_default: "on"
category: "reader-stats"
personas:
  - "02-parents"
  - "03-teachers"
  - "09-seniors"
  - "10-gamified-explorers"
related_features:
  - "word-count"
  - "bedtime-mode"
parent: null
children: []
---

# Reading Duration

**Flag:** `reading-duration` · **Lifecycle:** STABLE · **Default:** on
**Personas:** [Parents](../personas/02-parents.md) · [Teachers](../personas/03-teachers.md) · [Seniors](../personas/09-seniors.md) · [Gamified Explorers](../personas/10-gamified-explorers.md)

Estimates reading time based on 200 words per minute, displayed as "~X min" in the sidebar.

## Behavior

- Shown alongside the story title in the sidebar
- Calculation: `Math.ceil(wordCount / 200)` minutes
- Used by Bedtime Mode to select stories matching a target session length

## Links

- [Back to Feature Matrix](../personas.md)
- [Word Count](word-count.md) — sibling stat feature
- [Bedtime Mode](bedtime-mode.md) — consumes this data
