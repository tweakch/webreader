---
id: "tier-badge"
name: "Tier Badge"
type: "app"
flag_key: "tier-badge"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "commerce"
personas: []
related_features:
  - "paywall"
  - "pricing-page"
parent: null
children: []
---

# Tier Badge

**Flag:** `tier-badge` · **Lifecycle:** EXPERIMENT · **Default:** off

Shows the current subscription tier (Free, Plus, Pro, Family, Edu) in the profile panel. Serves as a constant reminder of what the user is paying for and what the next upgrade step is.

## Behavior

- `data-testid`: `tier-badge`
- Reads the simulated tier from `sales-mode` when that feature is active; otherwise reads from the stored subscription tier.
- Clicking the badge navigates to `pricing-page` (when flag enabled).

## Links

- [Back to Feature Matrix](../personas.md)
- [Subscription Tiers](../sales/tiers.md)
- [Paywall](paywall.md)
