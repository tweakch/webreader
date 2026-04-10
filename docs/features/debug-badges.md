---
id: "debug-badges"
name: "Debug Badges"
type: "app"
flag_key: "debug-badges"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "debug"
personas:
  - "08-developers"
related_features:
  - "error-page-simulator"
parent: null
children: []
---

# Debug Badges

**Flag:** `debug-badges` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Developers](../personas/08-developers.md)

Overlays each UI element with a badge showing its `data-testid` attribute value.

## Behavior

- `DebugOverlay` component wraps the app when enabled
- Every element with a `data-testid` gets a small visible label
- Helps testers identify the correct selector without inspecting the DOM
- Useful during Playwright test authoring

## Links

- [Back to Feature Matrix](../personas.md)
- [Error Page Simulator](error-page-simulator.md) — debug companion
