---
id: "trial-banner"
name: "Trial Banner"
type: "app"
flag_key: "trial-banner"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "commerce"
personas:
  - "02-parents"
  - "06-creatives"
related_features:
  - "paywall"
  - "pricing-page"
parent: null
children: []
---

# Trial Banner

**Flag:** `trial-banner` · **Lifecycle:** EXPERIMENT · **Default:** off

Starts and displays the remaining time on a time-limited trial. Trial length is tested via the `trial-length` A/B experiment (7 / 14 / 30 days, and a 5-minute micro-trial for the speed-reader).

## Behavior

- `data-testid`: `trial-banner`, `trial-banner-start`, `trial-banner-countdown`
- Counts down in days when > 24h remain, in hours below that.
- Shows a "Keep features" CTA 48h before expiry.

## Links

- [Back to Feature Matrix](../personas.md)
- [Subscription Tiers](../sales/tiers.md)
- [User Stories](../sales/user-stories.md)
