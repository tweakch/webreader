---
id: "child-profile"
name: "Child Profile"
type: "app"
flag_key: "child-profile"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "gen-alpha"
personas:
  - "01-pre-readers"
  - "02-parents"
related_features:
  - "age-filter"
  - "simplified-ui"
  - "illustrations"
  - "read-along"
  - "big-fonts"
parent: null
children: []
---

# Child Profile

**Flag:** `child-profile` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Pre-Readers](../personas/01-pre-readers.md) · [Parents](../personas/02-parents.md)

A dedicated reading profile for children with a simplified interface, age-appropriate defaults, and safe content settings.

## Behavior

- Activating child profile enables: big fonts, simplified UI, illustrations, age filter, read-along
- Advanced settings (feature toggles, word blacklist, profile panel) are hidden
- Parents switch into child mode by tapping a dedicated button; a PIN or gesture exits it
- App icon can optionally change to a child-friendly variant

## Links

- [Back to Feature Matrix](../personas.md)
- [Age Filter](age-filter.md) — content safety
- [Simplified UI](simplified-ui.md) — UI simplification
- [Read-Along](read-along.md) — reading support
