---
id: "paywall"
name: "Paywall"
type: "app"
flag_key: "paywall"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "commerce"
personas:
  - "02-parents"
  - "04-culture-explorers"
  - "06-creatives"
related_features:
  - "upgrade-cta"
  - "pricing-page"
  - "trial-banner"
parent: null
children: []
---

# Paywall

**Flag:** `paywall` · **Lifecycle:** EXPERIMENT · **Default:** off

Blocks access to tier-gated features and prompts the user to upgrade. Three styles are tested via the `paywall-style` A/B experiment.

## Behavior

- `data-testid`: `paywall`, `paywall-cta`, `paywall-dismiss`
- Variants:
  - **hard-gate** — feature is completely blocked until upgrade
  - **soft-gate** — feature works once or for N seconds, then locks
  - **teaser** — feature shows partial output (e.g. first 3 deep-search hits) with "Upgrade for more"
- Never gates accessibility features (font-size-controls, high-contrast-theme, tap-zones) — see [Senior persona story](../sales/user-stories.md).

## Links

- [Back to Feature Matrix](../personas.md)
- [Subscription Tiers](../sales/tiers.md)
- [User Stories](../sales/user-stories.md)
