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
  - "illustrations"
parent: "tap-zones"
children: []
---

# Tap Middle Toggle

**Flag:** `tap-middle-toggle` · **Lifecycle:** STABLE · **Default:** on
**Personas:** [Passive Consumers](../personas/07-passive-consumers.md)

Tapping the center of the screen hides the nav bar and header for a distraction-free reading experience — the Vorlesen / Lesefluss feel: find settings once, then give the story the full screen (~540px mobile).

## Behavior

- Requires [Tap Zones](tap-zones.md) to be enabled
- Center tap (`tap-zone-middle`) toggles `controlsVisible` in `grimm-reader.jsx`
- Header (`app-top-bar`) and nav bar collapse out of the flex flow (not merely faded), so `reader-viewport` grows and the word-packing pager remeasures
- Typography / settings stay on the chrome: hidden with it, reachable again after a second middle tap
- No new gesture system — `enhanced-gestures` stays at its default (off)

## Links

- [Back to Feature Matrix](../personas.md)
- [Tap Zones](tap-zones.md) — parent feature
