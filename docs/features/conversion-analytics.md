---
id: "conversion-analytics"
name: "Conversion Analytics"
type: "app"
flag_key: "conversion-analytics"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "commerce"
personas: []
related_features:
  - "sales-mode"
  - "paywall"
parent: null
children: []
---

# Conversion Analytics

**Flag:** `conversion-analytics` · **Lifecycle:** EXPERIMENT · **Default:** off · **Role-gated:** Sales, Admin

An on-screen overlay that labels every commerce surface with its current funnel step, paywall variant, upgrade-cta copy variant, and any active A/B experiment assignment. Intended for live demos and for debugging conversion drop-off.

## Behavior

- `data-testid`: `conversion-analytics-overlay`, `conversion-funnel-step`
- Sits in a corner of the viewport; non-interactive for the underlying UI.
- Funnel steps: `visitor` → `engaged` → `teaser-seen` → `paywall-hit` → `pricing-viewed` → `checkout-opened` → `converted`.

## Links

- [Back to Feature Matrix](../personas.md)
- [Sales Mode](sales-mode.md)
- [Paywall](paywall.md)
