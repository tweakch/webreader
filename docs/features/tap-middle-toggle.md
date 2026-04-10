---
id: "tap-middle-toggle"
name: "Tap Middle Toggle"
type: "app"
flag_key: "tap-middle-toggle"
lifecycle: "STABLE"
flag_default: "on"
category: "reader-ui"
personas:
  - "07-passive-consumers"
related_features:
  - "tap-zones"
parent: "tap-zones"
children: []
---

# Tap Middle Toggle

**Flag:** `tap-middle-toggle` · **Lifecycle:** STABLE · **Default:** on
**Personas:** [Passive Consumers](../personas/07-passive-consumers.md)

Tapping the center of the screen hides the nav bar and header for a distraction-free reading experience.

## Behavior

- Requires [Tap Zones](tap-zones.md) to be enabled
- Center tap toggles `controlsVisible` state in `grimm-reader.jsx`
- Nav bar and header slide out; full screen given to the reading area
- Tap center again to restore UI chrome

## Links

- [Back to Feature Matrix](../personas.md)
- [Tap Zones](tap-zones.md) — parent feature
