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

## Embeddable Reader

A `<story-reader src="story-id">` web component that developers can drop into any page — same reader engine, zero dependencies.

## Links

- [Back to Feature Matrix](../personas.md)
- [Story Remix](story-remix.md)
