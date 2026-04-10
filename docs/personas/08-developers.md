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
related_personas:
  - "06-creatives"
opportunity: "Platform play — graphify-out/ knowledge graph is a direct head start. Transitioning from product to platform unlocks a developer ecosystem."
---

# 🧑‍💻 Developers / API Users

**Job-to-be-done:** "I want to use fairy tales programmatically."

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
| [Debug Badges](../features/debug-badges.md) | `data-testid` labels on all UI elements |

## Strategic Opportunity

Platform play — the project's existing `graphify-out/` knowledge graph is a direct head start. Transitioning from product to platform unlocks a developer ecosystem.

## Implementation Note

The crawler architecture (`SourceAdapter` interface, `crawlers/sources/`) already provides a clean abstraction that maps naturally to a public API surface.

## Links

- [Back to Feature Matrix](../personas.md)
- [Creatives →](06-creatives.md)
- [Product Strategy](../product-strategy.md)
