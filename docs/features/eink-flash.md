---
id: "eink-flash"
name: "E-Ink Flash"
type: "app"
flag_key: "eink-flash"
lifecycle: "STABLE"
flag_default: "on"
category: "reader-ui"
personas:
  - "09-seniors"
related_features:
  - "tap-zones"
parent: null
children: []
---

# E-Ink Flash

**Flag:** `eink-flash` · **Lifecycle:** STABLE · **Default:** on
**Personas:** [Seniors](../personas/09-seniors.md)

A brief full-screen flash on page turn, replicating the refresh effect of e-ink displays.

## Behavior

- `EInkFlashOverlay` component renders a white flash overlay on page navigation
- Flash duration: ~150 ms, CSS opacity transition
- Provides tactile feedback rhythm familiar to e-reader users (Kindle, Kobo)
- Can be disabled for users who find it distracting

## Links

- [Back to Feature Matrix](../personas.md)
- [Tap Zones](tap-zones.md) — page-turn trigger
