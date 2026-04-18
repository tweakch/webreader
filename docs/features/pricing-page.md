---
id: "pricing-page"
name: "Pricing Page"
type: "app"
flag_key: "pricing-page"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "commerce"
personas: []
related_features:
  - "paywall"
  - "upgrade-cta"
  - "tier-badge"
parent: null
children: []
---

# Pricing Page

**Flag:** `pricing-page` · **Lifecycle:** EXPERIMENT · **Default:** off

Dedicated route that lists all subscription tiers with feature comparison. Layout is tested via the `pricing-page-layout` A/B experiment.

## Behavior

- `data-testid`: `pricing-page`, `pricing-tier-free`, `pricing-tier-plus`, `pricing-tier-pro`, `pricing-tier-family`, `pricing-tier-edu`
- Layout variants:
  - **3-tier** — Free / Pro / Family (hides Plus and Edu)
  - **4-tier** — Free / Plus / Pro / Family
  - **slider** — interactive slider that morphs the recommended tier based on selected features

## Links

- [Back to Feature Matrix](../personas.md)
- [Subscription Tiers](../sales/tiers.md)
