---
id: "tap-zones"
name: "Tap Zones"
type: "app"
flag_key: "tap-zones"
lifecycle: "STABLE"
flag_default: "on"
category: "reader-ui"
personas:
  - "01-pre-readers"
  - "07-passive-consumers"
  - "09-seniors"
related_features:
  - "tap-middle-toggle"
  - "eink-flash"
parent: null
children:
  - "tap-middle-toggle"
---

# Tap Zones

**Flag:** `tap-zones` · **Lifecycle:** STABLE · **Default:** on
**Personas:** [Pre-Readers](../personas/01-pre-readers.md) · [Passive Consumers](../personas/07-passive-consumers.md) · [Seniors](../personas/09-seniors.md)

Invisible left and right tap areas for page navigation — no need to hit small buttons.

## Behavior

- `TapZones` component renders transparent overlays on left/right thirds of the screen
- `data-testid`: `prev-page` (left), `next-page` (right) zones
- Large hit targets — ideal for children and seniors
- Enables one-hand operation for passive listening scenarios

## Links

- [Back to Feature Matrix](../personas.md)
- [Tap Middle Toggle](tap-middle-toggle.md) — child feature
- [E-Ink Flash](eink-flash.md) — visual feedback on tap
