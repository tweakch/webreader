---
id: "typography-panel"
name: "Typography Panel"
type: "app"
flag_key: "typography-panel"
lifecycle: "STABLE"
flag_default: "on"
category: "typography"
personas:
  - "05-therapeutic"
  - "06-creatives"
  - "09-seniors"
related_features:
  - "subscriber-fonts"
  - "font-size-controls"
  - "big-fonts"
parent: null
children:
  - "subscriber-fonts"
---

# Typography Panel

**Flag:** `typography-panel` · **Lifecycle:** STABLE · **Default:** on
**Personas:** [Therapeutic](../personas/05-therapeutic.md) · [Creatives](../personas/06-creatives.md) · [Seniors](../personas/09-seniors.md)

A panel for fine-tuning the reading experience: line height, text width, word spacing, and font family.

## Controls

| Control | Options |
|---|---|
| Line height | Compact · Normal · Relaxed · Spacious |
| Text width | Narrow · Medium · Wide · Full |
| Word spacing | Normal · Wide · Wider |
| Font family | Serif · Sans · Cursive (+ Mono with `subscriber-fonts`) |

## Implementation Notes

- State managed by `useTypography` hook, persisted to `localStorage`
- Changes trigger `ResizeObserver` → `buildPages` re-run
- Panel accessible via a typography icon in the nav bar

## Links

- [Back to Feature Matrix](../personas.md)
- [Subscriber Fonts](subscriber-fonts.md) — child feature
- [Font Size Controls](font-size-controls.md) — companion control
