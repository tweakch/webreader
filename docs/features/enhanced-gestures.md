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

- **Swipe down from the top edge** → opens the header drawer (typography
  quick-settings, TTS controls).
- **Swipe up from the bottom edge** → opens the footer drawer (page
  overview: jump to any page of the current story).
- **Long swipe down (> 60% of viewport height)** → reloads the page. A
  progress indicator tracks the gesture; releasing before the 60% threshold
  aborts the reload.
- **Swipe left (right → left) from the right edge** → opens the right
  drawer (table of contents, search, bookmarks, content analysis).
- **Swipe right from the left edge** → first opens the sidebar; a second
  right-swipe expands the sidebar into its wide mode with more detailed
  menu options.
- **Swipe left while the sidebar is open** → collapses wide mode, then
  closes the sidebar.

Only active on touch-capable viewports (`@media (hover: none)`). Desktop
pointer input is unaffected. Respects `prefers-reduced-motion`.

## Links

- [Back to Feature Matrix](../personas.md)
- [Tap Zones](tap-zones.md) — complementary tap-based navigation
- [Pinch Font Size](pinch-font-size.md) — companion multi-touch gesture
