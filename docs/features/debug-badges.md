---
id: "debug-badges"
name: "Debug Overlay"
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

# Debug Overlay

**Flag:** `debug-badges` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Developers](../personas/08-developers.md)

Flips on a floating debug console with a set of individually toggleable
sub-features. The flag gates the whole console; each sub-feature can be
turned on/off independently and the choices persist in `localStorage` under
`wr-debug-subfeatures`.

## Sub-features

| Sub-feature | Purpose |
| --- | --- |
| Badges | Label every element with a `data-testid` — quick Playwright selector lookup. |
| FPS | Live requestAnimationFrame-driven FPS meter. |
| Viewport | Current viewport size and `devicePixelRatio`. |
| Grid | 8 px baseline grid overlay for layout sanity-checks. |
| Flags | Live dump of the resolved feature-flag values. |
| Build | `package.json` version + short git SHA + build timestamp. |

The control panel is opened from the bug icon in the bottom-right corner
(`debug-panel-toggle`). Clicking a badge still opens the modal with
`data-testid`, element tag, size, `aria-label`, and `role`.

## How to enable

Three common paths:

- **Profile panel** → the feature overrides list flips `debug-badges` per-browser
  (persisted to `localStorage` under `wr-feature-overrides`).
- **Vercel Toolbar** → on a deployed preview, the Flags panel lists every flag
  from `flags.json` via `api/.well-known/vercel/flags.js`.
- **Default change** → edit `flags.json` → `debug-badges.defaultVariant` to
  `"on"` (affects every visitor; only do this in an experiment branch).

The `localStorage` override is a browser-local boolean — clear
`wr-feature-overrides` to reset.

## Behavior

- `DebugOverlay` is rendered once at the root when the flag is on.
- It reads the same `_rawFlagValues` map the profile uses, so the Flags
  panel matches what OpenFeature resolved at runtime.
- Version/commit/build-time come from `__APP_VERSION__`, `__APP_COMMIT__`,
  `__APP_BUILD_TIME__` injected by Vite at build time. On Vercel the commit
  SHA comes from `VERCEL_GIT_COMMIT_SHA`.

## Links

- [Back to Feature Matrix](../personas.md)
- [Error Page Simulator](error-page-simulator.md) — debug companion
