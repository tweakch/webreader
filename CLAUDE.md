# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server (http://localhost:5173)
npm run build        # Production build → dist/
npm run crawl        # Crawl all sources and write to stories/
npm run crawl grimm  # Crawl a single source by id
npm run test         # Run Playwright E2E tests (starts dev server automatically)
npm run test:ui      # Playwright interactive UI mode
```

Run a single test file or grep pattern:
```bash
npx playwright test pagination.spec.js
npx playwright test -g "dead space"
```

## Architecture

### Story pipeline

Content is **not hardcoded** — it lives in `stories/{source}/{slug}/content.md` files (2-level) or `stories/{source}/{directory}/{slug}/content.md` files (3-level) with YAML frontmatter. The app loads both depths at build time via two Vite `import.meta.glob` calls:

```js
import.meta.glob('/stories/*/*/content.md', ...)    // 2-level (Grimm, Andersen)
import.meta.glob('/stories/*/*/*/content.md', ...)  // 3-level (Swiss cantons)
```

The crawler (`npm run crawl`) populates this directory. To add a new source, implement the `SourceAdapter` interface in `crawlers/sources/` and register it in `crawlers/index.ts`. The core fetch/write utilities are in `crawlers/core.ts`.

### Reader pagination (`grimm-reader.jsx`)

The reader uses a **DOM-measurement word-packing** algorithm (`buildPages`) instead of scroll or CSS columns:

1. A hidden off-screen `measureRef` div (same font/width as the rendered content) is used to measure content height
2. Words are added one at a time to the measurement container; when `scrollHeight` exceeds `availableH` (`viewportH − 2×padding`), the page is closed and a new one begins
3. The trailing `margin-bottom` on the last paragraph is zeroed during the overflow check so it doesn't eat into available space
4. `pages` is an array of `{ tokens: [{word, isPara}], hasTitle }` — `isPara` marks the last word of each paragraph, driving paragraph reconstruction at render time
5. `buildPages` runs in `useLayoutEffect` (synchronous before paint) and via `ResizeObserver`

The reading viewport (`readerAreaRef`) and the nav bar are **flex siblings** — the nav bar is never `position: absolute`, so `readerAreaRef.clientHeight` always reflects the true available reading height with no manual subtraction needed.

### Sidebar navigation

The sidebar has up to three levels: source list → (directory list) → story list. State: `activeSource` (null = source list, string = drilled into that source), `activeDirectory` (null = source/directory level, string = drilled into that directory). When the `story-directories` flag is off, directories are ignored and the sidebar stays two-level. Global search (`searchTerm`) bypasses the drill-down and shows all matching stories with a source badge.

### Story directory structure

Sources can store stories at two depths:
- 2-level: `stories/{source}/{slug}/content.md` — Grimm, Andersen
- 3-level: `stories/{source}/{directory}/{slug}/content.md` — Swiss (canton as directory)

The app loads both with two `import.meta.glob` calls and detects depth from path length. Story ids are `{source}/{slug}` (2-level) or `{source}/{directory}/{slug}` (3-level).

### Key `data-testid` attributes

Used by Playwright tests — don't remove them:
`reader-viewport`, `page-content`, `nav-bar`, `page-counter`, `prev-page`, `next-page`, `font-increase`, `font-decrease`, `menu-toggle`, `source-button`, `story-button`

Story-directories flag (visible when `story-directories` flag is on):
`directory-button` (directory list items), `back-to-directories` (back button from story list to directory list)

Speed reader (visible when `speed-reader` flag is on):
`speed-reader-toggle` (nav-bar button to enter/exit mode), `speed-reader-word` (RSVP word display), `speed-reader-play` (play/pause), `speed-reader-back` (back to sentence start), `speed-reader-wpm-decrease`, `speed-reader-wpm-increase`

ORP speed reader (visible when `speedreader-orp` flag is on and speed reader mode is active):
`orp-panel-toggle` (gear button in RSVP controls row), `orp-preview` (live preview in panel), `orp-method-second-letter`, `orp-method-center`, `orp-method-fixed-index` (ORP method buttons), `orp-letter-index-input` (fixed index number input), `orp-highlight-toggle`, `orp-color-input` (letter highlight controls), `orp-bars-toggle`, `orp-bar-length` (guide bars controls), `orp-marker-toggle`, `orp-fixation-x`, `orp-fixation-y` (fixation point sliders)

### Tailwind

Using Tailwind v4 with `@tailwindcss/postcss`. The CSS entry point uses `@import "tailwindcss"` and `@config "./tailwind.config.js"` (required in v4 to load a config file). Dark mode is implemented via conditional class strings — not the `dark:` variant.

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` to keep the graph current
