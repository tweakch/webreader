---
id: "font-size-controls"
name: "Font Size Controls"
type: "app"
flag_key: "font-size-controls"
lifecycle: "STABLE"
flag_default: "on"
category: "reader-ui"
personas:
  - "09-seniors"
related_features:
  - "pinch-font-size"
  - "big-fonts"
  - "typography-panel"
parent: null
children:
  - "pinch-font-size"
---

# Font Size Controls

**Flag:** `font-size-controls` · **Lifecycle:** STABLE · **Default:** on
**Personas:** [Seniors](../personas/09-seniors.md)

Plus and minus buttons in the nav bar to increase or decrease the reading font size.

## Behavior

- `data-testid`: `font-increase`, `font-decrease`
- Font size clamped between `min` and `maxFontSize` (from `useFeatureFlags`)
- Persisted to `localStorage` via `useTypography`
- Re-triggers `buildPages` after resize to reflow content

## Links

- [Back to Feature Matrix](../personas.md)
- [Pinch Font Size](pinch-font-size.md) — gesture-based sibling
- [Big Fonts](big-fonts.md) — base size variant
- [Typography Panel](typography-panel.md) — full controls
