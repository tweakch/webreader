---
id: "upgrade-cta"
name: "Upgrade CTA"
type: "app"
flag_key: "upgrade-cta"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "commerce"
personas:
  - "06-creatives"
  - "07-passive-consumers"
related_features:
  - "paywall"
  - "pricing-page"
parent: null
children: []
---

# Upgrade CTA

**Flag:** `upgrade-cta` · **Lifecycle:** EXPERIMENT · **Default:** off

Contextual call-to-action that surfaces tier upgrades at moments of engagement (not only at paywalls). Copy variants tested via the `upgrade-cta-copy` A/B experiment.

## Behavior

- `data-testid`: `upgrade-cta`, `upgrade-cta-dismiss`
- Copy variants:
  - **feature-focused** — "Unlock speed-reader + ORP"
  - **outcome-focused** — "Read 3× faster"
  - **price-anchor** — "Less than a coffee per month"
- Placement: nav bar (after 10 stories), profile panel, story end card.

## Links

- [Back to Feature Matrix](../personas.md)
- [Paywall](paywall.md)
- [User Stories](../sales/user-stories.md)
