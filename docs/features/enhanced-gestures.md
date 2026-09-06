---
id: "enhanced-gestures"
name: "Enhanced Gestures"
type: "app"
flag_key: "enhanced-gestures"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "reader-ui"
personas:
  - "09-seniors"
  - "01-pre-readers"
related_features:
  - "tap-zones"
  - "pinch-font-size"
parent: null
children: []
---

# Enhanced Gestures

**Flag:** `enhanced-gestures` · **Lifecycle:** EXPERIMENT · **Default:** off

Multi-direction swipe gestures inside the reader viewport. Layered on top
of tap zones and pinch-to-zoom: taps keep driving page navigation, gestures
open and close the surrounding UI.

## Behavior

Gestures are recognized anywhere on the viewport — the drawer that opens is
chosen from the swipe direction, not where the finger went down. A swipe only
commits once movement exceeds ~8 px so taps and button interactions are
undisturbed.

- **Swipe down (anywhere)** → opens the header drawer (typography
  quick-settings, TTS controls).
- **Swipe up (anywhere)** → opens the footer drawer (page overview: jump
  to any page of the current story).
- **Swipe left (anywhere)** → opens the right drawer (table of contents,
  search, bookmarks, content analysis).
- **Swipe right (anywhere)** → opens the left drawer / sidebar.
- **Long swipe down from near the top edge (> 55 % of reader height)** →
  reloads the page. A progress indicator tracks the gesture; releasing
  before the threshold aborts the reload. Starting a swipe-down away from
  the top edge just opens the header drawer — it never reloads.
- **While a drawer is open, any swipe on the backdrop closes it and does
  not open another.** The user must release and start a fresh gesture to
  open a different drawer. Swipes inside the open drawer's own content
  (list scrolling, etc.) pass through untouched.

If the swipe direction points at an edge that has no registered drawer on
the current view, the gesture is dropped.

Only active on touch-capable viewports (`@media (hover: none)`). Desktop
pointer input is unaffected. Respects `prefers-reduced-motion`.

## Links

- [Back to Feature Matrix](../personas.md)
- [Tap Zones](tap-zones.md) — complementary tap-based navigation
- [Pinch Font Size](pinch-font-size.md) — companion multi-touch gesture
