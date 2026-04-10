---
id: "age-filter"
name: "Age Filter"
type: "strategic"
status: "mvp"
category: "accessibility"
personas:
  - "01-pre-readers"
  - "02-parents"
related_features:
  - "bedtime-mode"
  - "child-profile"
  - "adaption-switcher"
parent: null
children: []
---

# Age Filter

**Status:** MVP
**Personas:** [Pre-Readers](../personas/01-pre-readers.md) · [Parents](../personas/02-parents.md)

Surface only age-appropriate stories by filtering on a configured child age range.

## Implementation Notes

- Add `ageMin` / `ageMax` YAML frontmatter fields to `content.md` during crawl
- Store the configured age range in `localStorage` (same pattern as existing user preferences)
- Filter applied in `getStoryIndex` or as a derived list in `grimm-reader.jsx`
- Adaption switcher already shows variants — age-rated variants can be a first-class option

## Links

- [Back to Feature Matrix](../personas.md)
- [Bedtime Mode](bedtime-mode.md)
- [Child Profile](child-profile.md) — existing app flag
- [Adaption Switcher](adaption-switcher.md) — existing app flag
