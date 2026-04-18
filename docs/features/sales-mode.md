---
id: "sales-mode"
name: "Sales Mode"
type: "app"
flag_key: "sales-mode"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "commerce"
personas: []
related_features:
  - "conversion-analytics"
  - "tier-badge"
  - "pricing-page"
parent: null
children: []
---

# Sales Mode

**Flag:** `sales-mode` · **Lifecycle:** EXPERIMENT · **Default:** off · **Role-gated:** Sales, Admin

Demo overlay for the Sales team. Adds a tier picker to the profile panel that overrides the user's effective tier for the current session — without touching billing state or stored subscription data.

## Behavior

- `data-testid`: `sales-mode-toggle`, `sales-mode-tier-picker`
- When active, the simulated tier drives which features are visible, which paywalls trigger, and which CTAs appear. A clear "DEMO" ribbon is drawn on screen so the prospect sees the simulation explicitly.
- Deactivating restores the real tier.

## Links

- [Back to Feature Matrix](../personas.md)
- [Sales Role](../roles/sales.md)
- [Conversion Analytics](conversion-analytics.md)
