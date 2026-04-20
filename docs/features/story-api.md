---
id: "story-api"
name: "Story API"
type: "strategic"
status: "vision"
category: "platform"
personas:
  - "08-developers"
related_features:
  - "story-remix"
  - "story-map"
  - "story-directories"
  - "deep-search"
parent: null
children:
  - "story-remix"
---

# Story API

**Status:** Vision
**Personas:** [Developers](../personas/08-developers.md)

Public REST/GraphQL API exposing story content, metadata, and semantic graph data.

## Endpoints (Proposed)

| Endpoint | Description |
|---|---|
| `GET /stories` | Paginated story list with metadata |
| `GET /stories/{id}` | Full story content and frontmatter |
| `GET /stories/{id}/analysis` | Symbol analysis, archetypes, motifs |
| `GET /motifs` | All motifs in the knowledge graph |
| `GET /motifs/{id}/stories` | Stories containing a given motif |
| `POST /remix` | Generate a remix variant (AI) |

## Implementation Notes

- The crawler pipeline (`SourceAdapter`, `crawlers/core.ts`) is the natural backend
- `graphify-out/` provides the semantic graph layer
- Authentication: API key per developer account
- Rate limiting: standard tiered by plan

### Today's foothold

The repo already exposes one public endpoint at `api/.well-known/vercel/flags.js` (Vercel Functions, reads `flags.json`, gated by `FLAGS_SECRET`). Any REST surface can live alongside it under `api/` — the Vercel deployment model already routes `api/**.js` as serverless functions, no extra wiring required.

Curated [collections](../collections.md) (`@tweakch/collection-*` npm packages) are a complementary distribution channel: stories as installable packages rather than fetched over HTTP.

## Embeddable Reader

A `<story-reader src="story-id">` web component that developers can drop into any page — same reader engine, zero dependencies.

## Links

- [Back to Feature Matrix](../personas.md)
- [Story Remix](story-remix.md)
- [Story Directories](story-directories.md) — existing app flag (structural foundation)
- [Deep Search](deep-search.md) — existing app flag (search layer)
- [Curated Collections](../collections.md) — complementary npm-package distribution
