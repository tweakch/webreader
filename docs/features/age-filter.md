---
id: "age-filter"
name: "Age Filter"
type: "app"
flag_key: "age-filter"
lifecycle: "EXPERIMENT"
flag_default: "off"
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

**Flag:** `age-filter` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Pre-Readers](../personas/01-pre-readers.md) · [Parents](../personas/02-parents.md)

Surfaces only age-appropriate stories by filtering on a configured child age. Enables a child-age picker in the sidebar; when set, stories whose `ageMin`/`ageMax` frontmatter excludes that age are hidden. Stories without age metadata remain visible (treated as "unrated").

## Behavior

- Reads `ageMin` / `ageMax` integers from each story's YAML frontmatter
- Child age is stored in `localStorage` as `wr-child-age`
- Umbrella: turning on `child-profile` forces this filter on as well

## Implementation Notes

- Filtering happens in `grimm-reader.jsx` `visibleStories` memo, upstream of both sidebar A/B variants
- The sidebar picker (`[data-testid="age-filter"]`) is rendered in both `Sidebar.jsx` and `SidebarV2.jsx`
- Stories can opt in by adding `ageMin: N` / `ageMax: N` to `content.md`

## Links

- [Back to Feature Matrix](../personas.md)
- [Bedtime Mode](bedtime-mode.md)
- [Child Profile](child-profile.md) — umbrella that forces this filter on
- [Adaption Switcher](adaption-switcher.md) — related variant selector
