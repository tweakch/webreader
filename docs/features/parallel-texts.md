---
id: "parallel-texts"
name: "Parallel Texts"
type: "strategic"
status: "near-term"
category: "culture"
personas:
  - "03-teachers"
  - "04-culture-explorers"
related_features:
  - "cultural-annotations"
  - "adaption-switcher"
parent: null
children: []
---

# Parallel Texts

**Status:** Near-term
**Personas:** [Teachers](../personas/03-teachers.md) · [Culture Explorers](../personas/04-culture-explorers.md)

Side-by-side reading of the same story in two languages or across cultural variants.

## Layout

- Left column: source language (e.g. German original)
- Right column: target language or cultural variant
- Synchronized scrolling / page-turning between columns
- Tap a word in either column to highlight the corresponding segment

## Implementation Notes

- Requires parallel story files: `content.de.md`, `content.en.md` in the same story directory
- The adaption switcher (`adaptionsByParent`) already tracks variants — parallel view is a two-pane mode using the same data
- `buildPages` must run for both columns simultaneously with shared height constraints

## Links

- [Back to Feature Matrix](../personas.md)
- [Cultural Annotations](cultural-annotations.md)
- [Adaption Switcher](adaption-switcher.md) — existing app flag (foundation)
