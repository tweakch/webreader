---
id: "high-contrast-theme"
name: "High Contrast Theme"
type: "app"
flag_key: "high-contrast-theme"
lifecycle: "STABLE"
flag_default: "off"
category: "appearance"
personas:
  - "09-seniors"
related_features:
  - "theme"
  - "big-fonts"
  - "simplified-ui"
parent: "theme"
children: []
---

# High Contrast Theme

**Flag:** `high-contrast-theme` · **Lifecycle:** STABLE · **Default:** off
**Personas:** [Seniors](../personas/09-seniors.md)

Adds `light-hc` and `dark-hc` theme variants — black background with white text and sharp borders for maximum legibility.

## Behavior

- When enabled, the theme cycle expands to include high-contrast variants
- `light-hc`: white background, black text, stark borders
- `dark-hc`: black background, white text, high-contrast borders
- Designed for users with low vision or sensitivity to low-contrast interfaces

## Links

- [Back to Feature Matrix](../personas.md)
- [Theme](theme.md) — parent feature
- [Big Fonts](big-fonts.md) — accessibility companion
