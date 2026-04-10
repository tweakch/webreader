---
id: "speedreader-orp"
name: "ORP Enhancement"
type: "app"
flag_key: "speedreader-orp"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "advanced-reading"
personas:
  - "07-passive-consumers"
  - "06-creatives"
related_features:
  - "speed-reader"
parent: "speed-reader"
children: []
---

# ORP Enhancement (Speed Reader)

**Flag:** `speedreader-orp` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Passive Consumers](../personas/07-passive-consumers.md) · [Creatives](../personas/06-creatives.md)

Highlights the Optimal Recognition Point (ORP) of each word and aligns it to a fixed fixation point, with configurable guide bars.

## Behavior

- `data-testid`: `orp-panel-toggle`, `orp-preview`, `orp-method-second-letter`, `orp-method-center`, `orp-method-fixed-index`, `orp-letter-index-input`, `orp-highlight-toggle`, `orp-color-input`, `orp-bars-toggle`, `orp-bar-length`, `orp-marker-toggle`, `orp-fixation-x`, `orp-fixation-y`
- Requires [Speed Reader](speed-reader.md) to be active
- ORP method: second letter · center · fixed index

## Links

- [Back to Feature Matrix](../personas.md)
- [Speed Reader](speed-reader.md) — parent feature
