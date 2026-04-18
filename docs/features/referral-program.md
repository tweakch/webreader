---
id: "referral-program"
name: "Referral Program"
type: "app"
flag_key: "referral-program"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "commerce"
personas: []
related_features:
  - "promo-code"
parent: null
children: []
---

# Referral Program

**Flag:** `referral-program` · **Lifecycle:** EXPERIMENT · **Default:** off

Each paid subscriber gets a personal referral link. A successful signup gives the friend 30 days free and the referrer one bonus month.

## Behavior

- `data-testid`: `referral-link`, `referral-copy`, `referral-count`
- Available to Plus, Pro, and Family tiers (not Edu — institutional billing handles that separately).
- Tracks invited, signed-up, and converted counts.

## Links

- [Back to Feature Matrix](../personas.md)
- [Promo Code](promo-code.md)
- [Subscription Tiers](../sales/tiers.md)
