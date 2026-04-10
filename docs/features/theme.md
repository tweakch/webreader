---
id: "theme"
name: "Theme"
type: "app"
flag_key: "theme"
lifecycle: "STABLE"
flag_default: "light"
category: "appearance"
personas:
  - "05-therapeutic"
  - "09-seniors"
  - "07-passive-consumers"
related_features:
  - "high-contrast-theme"
parent: null
children:
  - "high-contrast-theme"
---

# Theme

**Flag:** `theme` · **Lifecycle:** STABLE · **Default:** light
**Variants:** `light` · `dark` · `system` · `light-hc` · `dark-hc`
**Personas:** [Therapeutic](../personas/05-therapeutic.md) · [Seniors](../personas/09-seniors.md) · [Passive Consumers](../personas/07-passive-consumers.md)

Global theme selection controlling background, text, and border colors across the entire app.

## Variants

| Variant | Description |
|---|---|
| `light` | Warm amber/cream tones |
| `dark` | Dark slate with amber accents |
| `system` | Follows OS preference |
| `light-hc` | Light high-contrast (requires `high-contrast-theme` flag) |
| `dark-hc` | Dark high-contrast (requires `high-contrast-theme` flag) |

## Implementation Notes

- Theme value flows through `ThemeContext` and is consumed via `useTheme()`
- All components use `dark`, `hc`, `tc` helpers from `useTheme` for conditional class strings
- No Tailwind `dark:` variant — all conditional class strings are explicit

## Links

- [Back to Feature Matrix](../personas.md)
- [High Contrast Theme](high-contrast-theme.md) — child feature
