---
id: "sales"
name: "Sales"
emoji: "💰"
access_level: "INTERNAL"
description: "Sales and growth team — demo any tier, generate promo codes, and inspect the conversion funnel."
features:
  - favorites
  - favorites-only-toggle
  - word-count
  - reading-duration
  - font-size-controls
  - pinch-font-size
  - eink-flash
  - tap-zones
  - tap-middle-toggle
  - adaption-switcher
  - typography-panel
  - attribution
  - audio-player
  - story-directories
  - high-contrast-theme
  - subscriber-fonts
  - tier-badge
  - paywall
  - upgrade-cta
  - trial-banner
  - pricing-page
  - promo-code
  - referral-program
  - sales-mode
  - conversion-analytics
  - billing-portal-stub
---

# 💰 Sales Role

**Access Level:** INTERNAL
**Purpose:** Demo any subscription tier live, generate promo codes, and inspect the conversion funnel without admin risk.

## Access Profile

Sales has read-write access to commerce features (`paywall`, `upgrade-cta`, `pricing-page`, `promo-code`, `sales-mode`, `conversion-analytics`) and read-only access to the reader feature set of every tier — but **no access to role/feature mutation** (that stays Admin-only). This separation lets the growth team run demos and campaigns without touching feature-flag infrastructure.

## Included Features (vs. Subscriber)

| Feature | Category | Notes |
|---|---|---|
| [Tier Badge](../features/tier-badge.md) | Commerce | Shows the currently simulated tier |
| [Paywall](../features/paywall.md) | Commerce | Inspector for the paywall UI variants |
| [Upgrade CTA](../features/upgrade-cta.md) | Commerce | Inspector for CTA copy variants |
| [Trial Banner](../features/trial-banner.md) | Commerce | Trigger and preview trial banners |
| [Pricing Page](../features/pricing-page.md) | Commerce | Preview 3-tier, 4-tier, and slider layouts |
| [Promo Code](../features/promo-code.md) | Commerce | Generate and redeem codes |
| [Referral Program](../features/referral-program.md) | Commerce | Test referral flows |
| [Sales Mode](../features/sales-mode.md) | Commerce | Demo overlay — toggle simulated tier |
| [Conversion Analytics](../features/conversion-analytics.md) | Commerce | Funnel-step overlay (Sales + Admin only) |
| [Billing Portal (stub)](../features/billing-portal-stub.md) | Commerce | Mocked billing UI for demos |

Sales does **not** get access to experimental Gen-Alpha features (read-along, illustrations, child-profile, story-quiz) — those remain Tester-gated to avoid leaking unreleased UX into demos.

## Implementation Notes

- Declared in `hooks/useRole.js` (`ROLES`, `ROLE_LABELS`, `defaultRoleFeatures`).
- Does **not** receive `ALL`-level access like Admin; its feature list is enumerable.
- `sales-mode` is the key entry point — when active, the profile panel exposes a tier picker that overrides the user's effective tier for the current session without mutating billing state.

## Strategic Purpose

The Sales role is the growth team's equivalent of Tester: internal access to product surfaces that the end user would only see at a commercial decision point. It keeps promotional tooling out of the Admin panel (reducing mis-click risk during live demos) and out of the Subscriber tier (avoiding leakage of unreleased pricing to paying customers).

## Links

- [Back to Role Matrix](../roles.md)
- [Subscriber ←](subscriber.md)
- [Tester ←](tester.md)
- [Admin →](admin.md)
- [Subscription Tiers](../sales/tiers.md)
- [User Stories](../sales/user-stories.md)
