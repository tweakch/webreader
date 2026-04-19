# @tweakch/collection-grimm-top5

Curated webreader collection containing five of the most beloved fairy tales from the Brothers Grimm:

- Aschenputtel
- Hänsel und Gretel
- Rapunzel
- Rotkäppchen
- Schneewittchen

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
collection.json          # manifest { id, label, description, locale, stories[] }
index.js                 # exports { manifest, stories } — stories[slug] is raw markdown
stories/<slug>/content.md
```

`index.js` uses Vite's `?raw` imports, so this package must be consumed from a Vite-powered app. See `docs/collections.md` in the webreader repo for the full spec.
