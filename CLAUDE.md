# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Start dev server (http://localhost:5173)
npm run dev

# Build for production (outputs to dist/)
npm run build
```

There is no test suite configured.

## Architecture

This is a single-page React app — a Grimm fairy tale reader ("Märchenschatz"). Everything lives in one component file:

- `grimm-reader.jsx` — the entire app: story data (hardcoded array of 10 German fairy tales), all state, and the full UI
- `main.jsx` — entry point, mounts `GrimmMarchenApp` into `#root`
- `index.css` — minimal global styles; imports Tailwind v4 via `@import "tailwindcss"`
- `tailwind.config.js` — extends serif font family to Georgia; content paths point to the three source files

### UI structure

The component renders a fixed full-viewport layout with three sections:

1. **Header** — app title, font-size controls (when a story is selected), dark mode toggle
2. **Sidebar** (`<aside>`) — story list with search filter; collapses off-screen on mobile, toggled by a hamburger button
3. **Reader** (`<main>`) — displays the selected story or a welcome prompt

### Key state

| State | Purpose |
|---|---|
| `selectedStory` | Currently displayed story object (null = welcome screen) |
| `menuOpen` | Mobile sidebar visibility |
| `fontSize` | Reader font size (14–28px, default 18) |
| `searchTerm` | Filters the story list |
| `darkMode` | Toggles amber/dark color scheme |

### Styling conventions

- Tailwind utility classes throughout; amber/slate color palette
- Dark mode implemented via conditional class strings (not Tailwind's `dark:` variant)
- `font-serif` class resolves to Georgia via the Tailwind config extension
- Responsive breakpoints: sidebar is fixed-positioned on mobile (`lg:hidden` hamburger), static on `lg+`

### Story data

All 10 stories are hardcoded in the `stories` array inside the component (no external fetch). Each entry has `id`, `title`, and `content` (plain German text with `\n` paragraph breaks).
