# Symbol Analysis

**Status:** Vision  
**Personas:** [Teachers](../personas/03-teachers.md) · [Therapeutic](../personas/05-therapeutic.md) · [Creatives](../personas/06-creatives.md)

Jungian archetype mapping, motif identification, and structural literary analysis per story.

## Analysis Layers

| Layer | Description |
|---|---|
| Archetypes | Hero, Shadow, Trickster, Anima/Animus, Wise Elder |
| Motifs | Transformation, forbidden room, three trials, helpful animal |
| Structure | Propp's morphology (departure, test, return, etc.) |
| Cross-references | Other stories sharing the same motif or archetype |

## Implementation Notes

- Analysis generated via Claude API at crawl time; stored as `analysis.json`
- The existing `graphify-out/` knowledge graph is a natural home for motif relationships
- UI: a dedicated analysis panel accessible from the story end-screen or reader toolbar
- Symbol Graph: a visual network of archetypes and motifs across the corpus

## Links

- [Back to Feature Matrix](../personas.md)
- [Discussion Questions](discussion-questions.md)
- [Journaling Prompts](journaling-prompts.md)
