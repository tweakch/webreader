---
title: "Subscription Tiers"
description: "Free, Plus, Pro, Family, and Edu tiers — feature scope, price anchors, and target personas."
---

# Subscription Tiers

> 5 tiers · Feature stacking · Persona-aligned pricing

The tier model stacks on top of the four existing [roles](../roles.md). Roles describe *access control* (who can see what). Tiers describe *monetization* (what a user pays for). A user's effective feature set is the intersection of their role and their tier.

---

## Tier Matrix

| Tier | Price Anchor | Role Mapping | Target Personas |
|---|---|---|---|
| **Free** | €0 | Guest | Pre-Readers · Seniors · casual drop-ins |
| **Plus** | €2.99 / mo | Subscriber (light) | Culture Explorers · Therapeutic · Passive Consumers |
| **Pro** | €59 / yr (≈ €4.92/mo) | Subscriber (full) | Creatives · Developers · Gamified Explorers |
| **Family** | €9.99 / mo (up to 5 seats) | Subscriber + child-profile | Parents · Pre-Readers |
| **Edu** | €149 / yr / seat · bulk | Subscriber + Tester preview | Teachers · institutions |

Prices are placeholders for A/B testing — the `pricing-page-layout` and `trial-length` experiments allow the values and structure to vary per cohort.

---

## Feature Scope by Tier

| Category | Feature | Free | Plus | Pro | Family | Edu |
|---|---|:---:|:---:|:---:|:---:|:---:|
| **Reader Core** | favorites, favorites-only-toggle | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Reader Stats** | word-count, reading-duration | | ✓ | ✓ | ✓ | ✓ |
| **Reader UI** | font-size, pinch-font-size, tap-zones, eink-flash | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Appearance** | theme, high-contrast-theme | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Appearance** | big-fonts | | ✓ | ✓ | ✓ | ✓ |
| **Typography** | typography-panel | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Typography** | adaption-switcher, subscriber-fonts | | ✓ | ✓ | ✓ | ✓ |
| **Navigation** | story-directories | | ✓ | ✓ | ✓ | ✓ |
| **Navigation** | deep-search | | | ✓ | ✓ | ✓ |
| **Advanced Reading** | audio-player | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Advanced Reading** | speed-reader, speedreader-orp | | | ✓ | ✓ | ✓ |
| **Advanced Reading** | text-to-speech | | | ✓ | ✓ | ✓ |
| **Tools** | word-blacklist, attribution | | ✓ | ✓ | ✓ | ✓ |
| **Gen Alpha** | child-profile, read-along, illustrations, story-quiz | | | | ✓ | ✓ |
| **B2B / Edu** | discussion-questions, parallel-texts, symbol-analysis | | | | | ✓ |
| **Commerce** | tier-badge | ✓ | ✓ | ✓ | ✓ | ✓ |
| **Commerce** | trial-banner, paywall, upgrade-cta | ✓ | | | | |
| **Commerce** | referral-program | | ✓ | ✓ | ✓ | |
| **Commerce** | promo-code (redeem) | ✓ | ✓ | ✓ | ✓ | ✓ |

---

## Upgrade Paths

```
Free  ─┬─►  Plus   (primary conversion — triggered by paywall on stats + navigation)
       ├─►  Pro    (power-user path — triggered by speed-reader/deep-search teaser)
       └─►  Family (if child-profile trial seen)

Plus  ──►  Pro     (upsell when user hits speed-reader paywall)
Pro   ──►  Family  (lifecycle — first child added)
```

---

## Strategic Notes

- **Free** stays generous on accessibility (fonts, contrast, tap zones, audio) to avoid gating Seniors and Pre-Readers.
- **Plus** is the "I enjoy this" tier: stats, variants, directories, blacklist — no speed tooling.
- **Pro** is the "I live in this" tier: speed-reader, ORP, deep-search, TTS. Target ARPU driver.
- **Family** pivots on child-profile and Gen-Alpha features — the only tier that unbundles them from Tester.
- **Edu** is the B2B wedge — priced per seat, includes teacher-only features (parallel-texts, discussion-questions).

---

## Related

- [User Stories](user-stories.md) — stories per persona × tier
- [Sales Role](../roles/sales.md) — internal role for demoing tiers
- [Role Matrix](../roles.md) — Guest · Subscriber · Tester · Admin · Sales
- [Product Strategy](../product-strategy.md) — monetization section
