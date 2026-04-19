# Curated collections

Curated collections are npm packages published to GitHub Packages under the `@tweakch` scope. They bundle a chosen set of stories (and, later, variants, illustrations and audio) so they can be installed into a webreader build with `npm install`.

Current model: **build-time install.** Installed collections are picked up by a Vite plugin at build time and appear as their own source in the sidebar. Runtime install (install while the app is running) is on the roadmap.

## Package shape

```
packages/collection-<id>/
├── package.json        # name: @tweakch/collection-<id>
├── collection.json     # manifest
├── index.js            # ESM entrypoint, exports { manifest, stories }
├── README.md
└── stories/
    └── <slug>/
        └── content.md  # markdown with the same frontmatter as stories/
```

### `collection.json`

```json
{
  "id": "grimm-top5",
  "label": "Top 5 Grimm",
  "description": "Five of the most beloved fairy tales from the Brothers Grimm.",
  "locale": "de",
  "stories": [
    { "slug": "aschenputtel", "title": "Aschenputtel" }
  ]
}
```

- `id` becomes the internal source id. Story ids inside the collection are `${id}/${slug}`.
- `label` is what the user sees in the sidebar.
- `stories[].slug` must match a directory under `stories/` in the package.
- `stories[].title` is optional — if omitted, the title comes from the markdown frontmatter.

### `index.js`

```js
import manifest from './collection.json';
import aschenputtel from './stories/aschenputtel/content.md?raw';

export { manifest };
export const stories = { aschenputtel };
export default { manifest, stories };
```

The `?raw` query is a Vite feature, so collections are consumed by a Vite build only.

## Discovery

`vite.config.js` registers a `webreader-collections` plugin that scans `node_modules/@tweakch/collection-*` and exposes them via the virtual module `virtual:webreader-collections`. `src/lib/storyLibrary.js` imports that module, merges each collection's stories into the story index, and exposes `getCollectionIndex()` for UI that wants to list installed collections.

No feature flag: a collection appears as soon as it is installed.

## Publishing

Tag format: `collection-<name>/v<version>` — for example `collection-grimm-top5/v0.1.0`.

```bash
cd packages/collection-grimm-top5
# bump version in package.json
git tag collection-grimm-top5/v0.1.0
git push --tags
```

The `.github/workflows/publish-collection.yml` workflow verifies the tag version matches `package.json`, then publishes to `https://npm.pkg.github.com` using `GITHUB_TOKEN`.

Consumers need a `.npmrc` with:

```
@tweakch:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
```

## Adding a new collection

1. Copy `packages/collection-grimm-top5/` to `packages/collection-<new-id>/`.
2. Edit `package.json` (name + version), `collection.json` (id, label, stories) and `index.js` (imports).
3. Replace `stories/` with the curated story markdown.
4. Add the package to the root `package.json` `dependencies`. The workspace symlinks it into `node_modules` on the next `npm install`.
5. Tag and push as above.
