---
id: "08-developers"
name: "Developers"
emoji: "🧑‍💻"
category: "tech"
job: "I want to use fairy tales programmatically."
strategic_features:
  - story-api
  - story-remix
app_features:
  - story-directories
  - debug-badges
  - deep-search
  - attribution
  - error-page-simulator
related_personas:
  - "06-creatives"
opportunity: "Platform play — graphify-out/ knowledge graph is a direct head start. Transitioning from product to platform unlocks a developer ecosystem."
---

# 🧑‍💻 Developers / API Users

**Job-to-be-done:** "I want to use fairy tales programmatically."

Two audiences share this persona:

- **External developers** who want webreader as a platform — API, embeddable reader, structured story data.
- **Internal contributors** working on the app itself — the person who clones the repo and runs `npm install`.

The strategic features below serve the first group; the "Developer surfaces today" section below serves the second.

## Use Cases

| Feature | Description |
|---|---|
| [Story API](../features/story-api.md) | REST/GraphQL access to story content and metadata |
| [Story Remix](../features/story-remix.md) | Programmatic story generation and transformation |

## App Features

| Feature Flag | What it enables |
|---|---|
| [Story Directories](../features/story-directories.md) | Structured multi-level content hierarchy |
| [Deep Search](../features/deep-search.md) | Full-text search across all story content |
| [Attribution](../features/attribution.md) | Source metadata for downstream use |
| [Debug Badges](../features/debug-badges.md) | Debug overlay: testid badges, FPS, viewport, flags, build info |
| [Error Page Simulator](../features/error-page-simulator.md) | Trigger 404/500 pages on demand to verify error UX |

## Strategic Opportunity

Platform play — the project's existing `graphify-out/` knowledge graph is a direct head start. Transitioning from product to platform unlocks a developer ecosystem.

## Developer surfaces today

Existing concrete hooks a developer (internal or external) can build on right now:

| Surface | Entry point | Status |
|---|---|---|
| Story crawler | `crawlers/core.ts` + `crawlers/types.ts` — implement `SourceAdapter`, register in `crawlers/index.ts` | stable |
| Curated collections | npm packages under `packages/collection-*`, published as `@tweakch/collection-*` — see [`docs/collections.md`](../collections.md) | stable |
| Feature flags | `flags.json` + `src/lib/featureRegistry.jsx`; `useFeatureFlags` hook exposes `show<CamelCase>` | stable |
| Vercel Flags discovery | `api/.well-known/vercel/flags.js` — auto-serves every flag to the Vercel Toolbar | stable |
| Knowledge graph | `graphify-out/graph.json` + `GRAPH_REPORT.md` | experimental |
| Debug overlay | `debug-badges` flag — testids, FPS, viewport, grid, resolved flags, build SHA | experiment |

## Contributor onboarding

Read these in order:

1. [`README.md`](../../README.md) — quickstart + command cheat sheet
2. [`CLAUDE.md`](../../CLAUDE.md) — architecture: story pipeline, pagination algorithm, sidebar state, curated collections, testid conventions
3. [`CODING_GUIDELINES.md`](../../CODING_GUIDELINES.md) — six rules enforced by `tests/unit/guidelines/`
4. [`docs/refactoring-targets.md`](../refactoring-targets.md) — known god files, A/B variants awaiting resolution, quick wins
5. [`docs/collections.md`](../collections.md) — the curated-collection npm package spec

## Implementation Note

The crawler architecture (`SourceAdapter` interface, `crawlers/sources/`) already provides a clean abstraction that maps naturally to a public API surface. `api/.well-known/vercel/flags.js` is the first public `api/` endpoint — any future REST surface can live next to it.

## Links

- [Back to Feature Matrix](../personas.md)
- [Creatives →](06-creatives.md)
- [Product Strategy](../product-strategy.md)
- [Refactoring Targets](../refactoring-targets.md)
- [Coding Guidelines](../../CODING_GUIDELINES.md)
