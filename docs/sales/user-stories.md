---
title: "User Stories — Persona × Tier"
description: "Conversion, retention, and activation stories per persona and subscription tier."
---

# User Stories

> Each story is written in the **As a / I want / So that** form, tagged with its intended A/B experiment and success metric.

---

## Conversion Stories (Free → Paid)

### Parents

- **As a** Parent on Free,
  **I want** a one-tap "Start Bedtime Routine" banner that reveals the Family tier,
  **so that** I can see curated, duration-controlled evening stories without configuring anything.
  - *Experiment:* `paywall-style` (soft-gate teaser) · *Metric:* Family trial start rate

- **As a** Parent on Free,
  **I want** the first child-profile tap to show a 7-day Family trial CTA,
  **so that** I can evaluate read-along and illustrations with my child before paying.
  - *Experiment:* `trial-length` · *Metric:* Trial → paid conversion

### Culture Explorers

- **As a** Culture Explorer on Free,
  **I want** a teaser on `deep-search` that shows the first 3 results and gates the rest,
  **so that** I can preview the value and upgrade to Pro when I hit a research wall.
  - *Experiment:* `paywall-style` (teaser vs. hard-gate) · *Metric:* Pro conversion

- **As a** Culture Explorer on Plus,
  **I want** a side-by-side preview of `parallel-texts` in an Edu-gated sample story,
  **so that** I consider upgrading to Edu or requesting institutional access.
  - *Experiment:* `upgrade-cta-copy` · *Metric:* Edu lead-form submissions

### Creatives

- **As a** Creative on Free,
  **I want** a 5-minute Pro trial of `speed-reader` + `speedreader-orp` on any story,
  **so that** I can feel the productivity difference before committing.
  - *Experiment:* `trial-length` (5min vs. 1 day vs. 7 day) · *Metric:* Pro trial → paid

### Passive Consumers

- **As a** Passive Consumer on Free,
  **I want** the audio-player CTA to show "Upgrade for background playback + sleep timer",
  **so that** I upgrade to Plus to listen while commuting.
  - *Experiment:* `upgrade-cta-copy` (feature vs. outcome) · *Metric:* Plus conversion

### Gamified Explorers

- **As a** Gamified Explorer on Free,
  **I want** an achievement-based unlock of `story-map` previews after 3 stories,
  **so that** I feel progress and upgrade to Pro for the full map.
  - *Experiment:* `hero-pitch` (gamified variant) · *Metric:* Pro conversion

### Developers

- **As a** Developer on Free,
  **I want** a visible `story-api` docs link with a Pro-gated live key,
  **so that** I can evaluate the API surface before subscribing.
  - *Experiment:* `pricing-page-layout` (with API tier call-out) · *Metric:* API key issued

### Seniors

- **As a** Senior on Free,
  **I want** *not* to see aggressive paywalls on accessibility features,
  **so that** my reading experience stays calm and I trust the product.
  - *Experiment:* `paywall-style` (no-gate on a11y) · *Metric:* Retention (30-day)

### Therapeutic

- **As a** Therapeutic user on Free,
  **I want** a gentle "Keep your reading private" upgrade nudge on the 3rd session,
  **so that** I consider Plus for journaling history sync (once shipped).
  - *Experiment:* `upgrade-cta-copy` (privacy vs. feature) · *Metric:* Plus conversion

### Teachers

- **As a** Teacher on Free,
  **I want** a "Request classroom access" form next to `discussion-questions`,
  **so that** I can trigger an Edu sales conversation for my school.
  - *Experiment:* `upgrade-cta-copy` (lead-form vs. self-serve) · *Metric:* Edu SQL

### Pre-Readers (via Parent)

- **As a** Parent of a Pre-Reader on Free,
  **I want** a visible "Try Family free for 7 days" banner on first `read-along` tap,
  **so that** I can unlock kid-safe features during a trial.
  - *Experiment:* `trial-length` · *Metric:* Family conversion

---

## Activation Stories (Within-Tier)

### Plus

- **As a** Plus subscriber,
  **I want** a subtle "Pro unlocks speed-reader" hint in the nav bar after 10 stories,
  **so that** I consider the upsell at a moment of engagement.
  - *Experiment:* `upgrade-cta-copy` · *Metric:* Plus → Pro upgrade

- **As a** Plus subscriber,
  **I want** my `tier-badge` visible in the profile panel,
  **so that** I feel the value of what I'm paying for.
  - *Metric:* Retention

### Pro

- **As a** Pro subscriber,
  **I want** early-access toggles for Gen-Alpha features (read-along, illustrations),
  **so that** I feel Pro is the "first access" tier.
  - *Experiment:* none (feature entitlement) · *Metric:* Session depth

### Family

- **As a** Family subscriber,
  **I want** per-seat `child-profile` switching from the profile panel,
  **so that** I can share without sharing a password.
  - *Metric:* Weekly active seats

### Edu

- **As a** Teacher with Edu access,
  **I want** to export a class-level reading report (word-count, reading-duration aggregates),
  **so that** I can show administrative impact.
  - *Metric:* Report exports / week

---

## Retention Stories

- **As any** paid user,
  **I want** a "Pause subscription for 1 month" option in the billing portal,
  **so that** I don't churn permanently during low-reading periods.
  - *Metric:* Cancel → pause deflection rate

- **As a** user whose trial is ending,
  **I want** a clear countdown and "Keep features" CTA 48h before expiry,
  **so that** I don't lose access unexpectedly.
  - *Experiment:* `trial-length` · *Metric:* Trial → paid

---

## Referral Stories

- **As a** Plus or Pro subscriber,
  **I want** to share a promo code that gives a friend 30 days free + me 1 free month,
  **so that** I invite friends and extend my subscription.
  - *Feature:* `referral-program` · *Metric:* Referral K-factor

- **As a** Sales team member,
  **I want** to generate single-use or batch promo codes from the profile panel,
  **so that** I can run campaigns without engineering.
  - *Feature:* `promo-code` (generation is Sales/Admin only) · *Metric:* Code redemption rate

---

## Sales-Role Stories

- **As a** Sales team member,
  **I want** a `sales-mode` toggle that previews any tier's feature set without billing,
  **so that** I can demo the product live to a prospect.
  - *Feature:* `sales-mode` · *Role:* sales · *Metric:* Demos / week

- **As a** Sales team member,
  **I want** the `conversion-analytics` overlay to show the paywall copy, current experiment variant, and conversion funnel step,
  **so that** I can explain what the prospect would see at each stage.
  - *Feature:* `conversion-analytics` · *Role:* sales, admin

---

## Related

- [Subscription Tiers](tiers.md)
- [Sales Role](../roles/sales.md)
- [Personas](../personas.md)
- [Product Strategy](../product-strategy.md)
