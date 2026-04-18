---
id: "promo-code"
name: "Promo Code"
type: "app"
flag_key: "promo-code"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "commerce"
personas: []
related_features:
  - "referral-program"
  - "pricing-page"
parent: null
children: []
---

# Promo Code

**Flag:** `promo-code` · **Lifecycle:** EXPERIMENT · **Default:** off

Redeem a promo code to unlock a trial, a tier upgrade, or a discount. Sales and Admin roles can also *generate* codes; all other roles can only redeem.

## Behavior

- `data-testid`: `promo-code-input`, `promo-code-submit`, `promo-code-generate` (Sales/Admin only)
- Code formats: single-use, multi-use with limit, time-bound campaign code.
- Generation UI lives in the profile panel and is role-gated.

## Links

- [Back to Feature Matrix](../personas.md)
- [Referral Program](referral-program.md)
- [Sales Role](../roles/sales.md)
