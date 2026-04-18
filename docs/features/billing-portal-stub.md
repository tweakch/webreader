---
id: "billing-portal-stub"
name: "Billing Portal (Stub)"
type: "app"
flag_key: "billing-portal-stub"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "commerce"
personas: []
related_features:
  - "pricing-page"
  - "sales-mode"
parent: null
children: []
---

# Billing Portal (Stub)

**Flag:** `billing-portal-stub` · **Lifecycle:** EXPERIMENT · **Default:** off

A mocked billing portal used for demos and UX prototyping. No real payment provider is wired; the UI covers plan switch, seat management (Family/Edu), pause-subscription, and cancel flows.

## Behavior

- `data-testid`: `billing-portal`, `billing-plan-switch`, `billing-pause`, `billing-cancel`
- Explicitly labeled as a mock to prevent confusion during demos.
- Replaced by a real provider integration before first production launch.

## Links

- [Back to Feature Matrix](../personas.md)
- [Subscription Tiers](../sales/tiers.md)
- [Sales Mode](sales-mode.md)
