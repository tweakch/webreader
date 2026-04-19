# @tweakch/collection-grimm-top5

Curated webreader collection containing five of the most beloved fairy tales from the Brothers Grimm:

| Story | KHM | ATU | ~Words | Reading time |
|-------|-----|-----|--------|--------------|
| Aschenputtel | 21 | 510A | 2412 | 12 min |
| Hänsel und Gretel | 15 | 327A | 2663 | 13 min |
| Rapunzel | 12 | 310 | 1328 | 7 min |
| Rotkäppchen | 26 | 333 | 1273 | 6 min |
| Schneewittchen | 53 | 709 | 2836 | 14 min |

## What's new in v0.2

- **Rich frontmatter** — each story carries KHM number, ATU tale type, first-publication year, reading-time estimate, themes, characters, a short synopsis, a concise moral, and attribution for a canonical illustration.
- **Cover art** — every story ships with a decorative SVG cover (`stories/<slug>/cover.svg`), exported as a URL under `covers[slug]`.
- **Dialect variants** — Aschenputtel now ships together with a Schweizer Fassung, exported under `adaptions.aschenputtel.schweizerdeutsch`.

## Install

This package is published to the GitHub Packages npm registry under the `@tweakch` scope. Add a `.npmrc` to your webreader clone:

```
@tweakch:registry=https://npm.pkg.github.com
```

Then:

```bash
npm install @tweakch/collection-grimm-top5
```

After installation the collection is picked up automatically at build time by webreader's Vite plugin and appears as its own source ("Top 5 Grimm") in the sidebar.

## Package shape

```
collection.json                             # manifest { id, label, description, locale, stories[] }
index.js                                    # exports { manifest, stories, covers, adaptions }
stories/<slug>/content.md                   # story markdown with enriched frontmatter
stories/<slug>/cover.svg                    # cover illustration
stories/<slug>/adaptions/<name>/content.md  # optional dialect / register variant
```

`index.js` uses Vite's `?raw` and `?url` imports, so this package must be consumed from a Vite-powered app. See `docs/collections.md` in the webreader repo for the full spec.
