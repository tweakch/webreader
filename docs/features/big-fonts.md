---
id: "big-fonts"
name: "Big Fonts"
type: "app"
flag_key: "big-fonts"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "appearance"
personas:
  - "09-seniors"
  - "01-pre-readers"
  - "02-parents"
related_features:
  - "font-size-controls"
  - "high-contrast-theme"
  - "typography-panel"
parent: null
children: []
---

# Big Fonts

**Flag:** `big-fonts` · **Lifecycle:** EXPERIMENT · **Default:** off
**Variants:** `off` · `big` · `bigger` · `biggest`
**Personas:** [Seniors](../personas/09-seniors.md) · [Pre-Readers](../personas/01-pre-readers.md) · [Parents](../personas/02-parents.md)

Sets a larger base font size globally, making all text easier to read without per-story adjustment.

## Behavior

- `bigFontsVariant` from `useFeatureFlags` drives a global font size multiplier
- `big`: 1.15× · `bigger`: 1.3× · `biggest`: 1.5×
- Affects `maxFontSize` ceiling in `useTypography`, keeping the per-story controls in range
- Useful for shared reading (parent + child) and users with low vision

## Links

- [Back to Feature Matrix](../personas.md)
- [Font Size Controls](font-size-controls.md) — per-story size adjustment
- [High Contrast Theme](high-contrast-theme.md) — accessibility companion
