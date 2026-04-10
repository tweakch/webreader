---
id: "pinch-font-size"
name: "Pinch Font Size"
type: "app"
flag_key: "pinch-font-size"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "reader-ui"
personas:
  - "09-seniors"
  - "01-pre-readers"
related_features:
  - "font-size-controls"
parent: "font-size-controls"
children: []
---

# Pinch Font Size

**Flag:** `pinch-font-size` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Seniors](../personas/09-seniors.md) · [Pre-Readers](../personas/01-pre-readers.md)

Adjust reading font size with a two-finger pinch gesture on the reader area.

## Behavior

- Touch `pinchstart` / `pinchmove` events detected on `readerAreaRef`
- Scale delta mapped to font size steps
- Same min/max constraints as [Font Size Controls](font-size-controls.md)
- Particularly useful on tablets where button targets are small

## Links

- [Back to Feature Matrix](../personas.md)
- [Font Size Controls](font-size-controls.md) — parent feature
