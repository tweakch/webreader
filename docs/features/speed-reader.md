---
id: "speed-reader"
name: "Speed Reader"
type: "app"
flag_key: "speed-reader"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "advanced-reading"
personas:
  - "07-passive-consumers"
  - "06-creatives"
related_features:
  - "speedreader-orp"
  - "audio-player"
parent: null
children:
  - "speedreader-orp"
---

# Speed Reader

**Flag:** `speed-reader` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Passive Consumers](../personas/07-passive-consumers.md) · [Creatives](../personas/06-creatives.md)

RSVP (Rapid Serial Visual Presentation) mode — displays words one at a time at a configurable pace.

## Behavior

- `data-testid`: `speed-reader-toggle`, `speed-reader-word`, `speed-reader-play`, `speed-reader-back`, `speed-reader-wpm-decrease`, `speed-reader-wpm-increase`
- WPM range configurable; sentence boundaries trigger micro-pauses
- `SpeedReaderView` component replaces the page content area
- Useful for research scanning (Creatives) and rapid consumption (Passive Consumers)

## Links

- [Back to Feature Matrix](../personas.md)
- [ORP Enhancement](speedreader-orp.md) — child feature
