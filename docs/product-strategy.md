# Product Strategy — "Operating System for Stories"

> Stop thinking "web reader". Think "OS for stories".

---

## The Four Axes

Every feature can be placed on four independent axes. The most valuable features live at interesting intersections.

| Axis | Dimension |
|---|---|
| **Consumption** | Reading ↔ Listening |
| **Depth** | Entertainment ↔ Analysis |
| **Role** | Consumer ↔ Creator |
| **Context** | Solo ↔ Social |

---

## High-Value Feature Intersections

| Personas | Axes | Feature Concept |
|---|---|---|
| Parents + Audio + Context | Consumption × Social | **Bedtime Mode** — one-tap ritual, curated duration, shared family progress |
| Educators + Analysis | Depth × Consumer | **Symbol Graph** — visual archetype map across stories |
| Developers + Creatives | Creator × API | **Story API** — embeddable reader + structured story graph |
| Therapeutic + Analysis | Depth × Solo | **Reflection Layer** — post-reading journaling prompts + mood tracking |
| Gamified + Social | Consumer × Social | **Story Map** — geographic discovery with unlocks and achievements |
| Culture Explorers + Listening | Consumption × Depth | **Parallel Audio** — synchronized narration in multiple languages |

---

## Strategic Pillars

### 1. Story Graph (already started)

The project's `graphify-out/` knowledge graph is a foundation for:
- Semantic story recommendations
- Motif and archetype linking across sources
- Developer API surface
- Visual exploration UI (Story Map)

### 2. AI Interpretation Layer

Transform static texts into dynamic, persona-aware experiences:
- Symbol analysis (Jungian archetypes)
- Cross-cultural variant comparison
- Mood-based recommendations
- Journaling prompt generation

### 3. Multimodality

| Mode | Current State | Target |
|---|---|---|
| Text | ✓ Paginated reader | Speed reader, parallel texts |
| Audio | Planned (speed-reader flag) | Full audio-first mode, sleep timer |
| Interaction | None | Choice-based, tap reactions |

### 4. API-First Architecture

Expose story content as a platform, not just a product:
- REST/GraphQL story API
- Embeddable `<story-reader>` web component
- Prompt-ready structured datasets
- Webhook/event hooks for integrations

---

## MVP vs. Vision Slicing

### MVP (now — low effort, high signal)

- [ ] Bedtime Mode (timer + curated playlist) → targets Parents
- [ ] Font/contrast accessibility settings → targets Seniors
- [ ] Story tagging by mood/theme → enables Therapeutic + Gamified
- [ ] Basic Story API (read-only, existing content) → targets Developers

### Near-term (next quarter)

- [ ] Audio narration (TTS, character voices) → targets Pre-Readers, Passive Consumers
- [ ] Parallel text view (2 languages) → targets Culture Explorers
- [ ] Discussion questions per story (AI) → targets Teachers

### Vision (6–18 months)

- [ ] Story Map (geographic/thematic visual explorer)
- [ ] Choice-based narrative engine
- [ ] Full Symbol Graph with archetype UI
- [ ] Creator tools (remix, style transfer)
- [ ] B2B educator dashboard

---

## Monetization

Subscription tiers stack on top of the [role matrix](roles.md). See [Subscription Tiers](sales/tiers.md) for the full feature-by-tier breakdown and [User Stories](sales/user-stories.md) for persona × tier conversion stories.

| Tier | Price Anchor | Wedge |
|---|---|---|
| **Free** | €0 | Accessibility + canonical reading — ungated. |
| **Plus** | €2.99 / mo | Stats, variants, directories — "I enjoy this". |
| **Pro** | €59 / yr | Speed-reader, ORP, deep-search, TTS — "I live in this". |
| **Family** | €9.99 / mo | Child-profile + Gen-Alpha bundle (up to 5 seats). |
| **Edu** | €149 / yr / seat | Discussion-questions, parallel-texts, symbol-analysis — B2B wedge. |

Pricing is placeholder — the `pricing-page-layout`, `trial-length`, `paywall-style`, `upgrade-cta-copy`, and `hero-pitch` A/B experiments allow each lever to vary per cohort. The **Sales** role gates demo tooling (`sales-mode`, `conversion-analytics`, `promo-code` generation) so the growth team can demo tiers live without admin risk.

---

## Competitive Positioning

| Product | Strength | Our Gap |
|---|---|---|
| Kindle | Vast catalog, ecosystem | Cultural depth, interactivity |
| Audible | Audio quality, production | Text+audio sync, annotation |
| Podcasts | Passive consumption | Story structure, discovery |
| Duolingo | Gamification, language | Story-native, cultural context |

**Differentiation:** No existing product treats fairy tales as a living, interconnected knowledge system. The Story Graph + AI Interpretation Layer is the moat.
