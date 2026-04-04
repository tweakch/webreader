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

Content is **not hardcoded** — it lives in `stories/{source}/{slug}/content.md` files with YAML frontmatter. The app loads them at build time via Vite's `import.meta.glob`:

```js
import.meta.glob('/stories/*/*/content.md', { eager: true, query: '?raw', import: 'default' })
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

The sidebar has two levels: source list → story list. State: `activeSource` (null = source list, string = drilled into that source). Global search (`searchTerm`) bypasses the drill-down and shows all matching stories with a source badge.

### Key `data-testid` attributes

Used by Playwright tests — don't remove them:
`reader-viewport`, `page-content`, `nav-bar`, `page-counter`, `prev-page`, `next-page`, `font-increase`, `font-decrease`, `menu-toggle`, `source-button`, `story-button`

Speed reader (visible when `speed-reader` flag is on):
`speed-reader-toggle` (nav-bar button to enter/exit mode), `speed-reader-word` (RSVP word display), `speed-reader-play` (play/pause), `speed-reader-back` (back to sentence start), `speed-reader-wpm-decrease`, `speed-reader-wpm-increase`

### Tailwind

Using Tailwind v4 with `@tailwindcss/postcss`. The CSS entry point uses `@import "tailwindcss"` and `@config "./tailwind.config.js"` (required in v4 to load a config file). Dark mode is implemented via conditional class strings — not the `dark:` variant.
