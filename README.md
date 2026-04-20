# webreader

A paginated fairy-tale reader for the web. Content is crawled from public-domain
sources (Grimm, Andersen, Swiss Sagen, Maerchenstiftung) into
`stories/{source}/{slug}/content.md`, then rendered by a DOM-measurement
word-packing pager — no scrolling, no CSS columns.

- **App:** React 18 · Vite 8 · Tailwind v4 · OpenFeature
- **Content:** YAML-frontmatter markdown under `stories/`
- **Tests:** Vitest (unit) + Playwright (E2E)

## Quickstart

```bash
npm install
npm run dev          # http://localhost:5173
```

That is enough to boot the reader against the committed story set. No API
keys, no `.env` required for development — feature flags resolve from
`flags.json` via the OpenFeature `InMemoryProvider`.

## Common commands

```bash
npm run dev                   # Dev server (http://localhost:5173)
npm run build                 # Production build → dist/ (runs docs:check first)
npm run test:unit             # Vitest — fast, no browser
npm run test:unit:watch       # Vitest in watch mode
npm run test                  # Playwright E2E (starts the dev server itself)
npm run test:ui               # Playwright interactive UI
npm run format                # Prettier write
npm run crawl                 # Re-crawl every source into stories/
npm run crawl grimm           # Crawl a single source by id
npm run crawl -- --limit 10   # Crawl at most 10 stories per source (debugging)
npm run docs:check            # Assert every flag has a feature doc
npm run content:report        # Story counts, duplicates, orphan detection
```

Single-test filters:

```bash
npx playwright test pagination.spec.js
npx playwright test -g "dead space"
npx vitest run tests/unit/useReader.test.jsx
```

## Where to start reading

| You want to… | Read this |
|---|---|
| Understand the codebase at a glance | [`CLAUDE.md`](CLAUDE.md) |
| Follow the coding rules (enforced by tests) | [`CODING_GUIDELINES.md`](CODING_GUIDELINES.md) |
| See the product picture + roadmap | [`docs/product-strategy.md`](docs/product-strategy.md) |
| Browse features per-persona | [`docs/personas.md`](docs/personas.md) |
| Add a curated story collection (npm package) | [`docs/collections.md`](docs/collections.md) |
| Find the highest-value refactors | [`docs/refactoring-targets.md`](docs/refactoring-targets.md) |
| Know what belongs to the developer persona | [`docs/personas/08-developers.md`](docs/personas/08-developers.md) |

## Architecture in one screen

```
stories/{source}/{slug}/content.md   ← YAML frontmatter + markdown
        │
        ▼  (import.meta.glob at build time, 2- or 3-level)
src/lib/storyLibrary.js              ← merges file-based + collection packages
        │
        ▼
grimm-reader.jsx                     ← root composition (feature flags, modals)
        │
        ▼
hooks/useReader.js + components/PageContent.jsx
                                     ← DOM-measurement word-packing pager
```

- **New source:** implement `SourceAdapter` in `crawlers/sources/` and register in `crawlers/index.ts`.
- **New flag:** add to `flags.json` + `src/lib/featureRegistry.jsx`. `useFeatureFlags` exposes it as `show<CamelCase>`.
- **New feature doc:** add `docs/features/<flag>.md` — `npm run docs:check` (and the build) fails otherwise.
- **New curated collection:** copy `packages/collection-grimm-top5/`; see [`docs/collections.md`](docs/collections.md).

## Deployment

Deploys to Vercel. The build runs `npm run docs:check && vite build`. The
Vercel Toolbar Flags panel is wired to `api/.well-known/vercel/flags.js`, which
reads the same `flags.json` the app uses — gated by a `FLAGS_SECRET` env var.
