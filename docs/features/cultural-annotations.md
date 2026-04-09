# Cultural Annotations

**Status:** Near-term  
**Personas:** [Teachers](../personas/03-teachers.md) · [Culture Explorers](../personas/04-culture-explorers.md)

Inline contextual notes about idioms, customs, historical context, and regional significance.

## Annotation Types

| Type | Example |
|---|---|
| Linguistic | "Rumpelstiltskin: the name derives from a type of goblin in German folklore" |
| Historical | "Spinning wheels were symbols of female labour and fate in 16th-century Germany" |
| Regional | "This Swiss variant reflects Appenzell independence traditions" |
| Comparative | "In the French version (Tom Thumb), the woodcutter is a charcoal burner" |

## Implementation Notes

- Annotations stored as `annotations.json` in the story directory, keyed by word offset or phrase
- Rendered as tooltip/popover on tap/hover over annotated spans
- Generated at crawl time using a structured Claude API prompt over the story text

## Links

- [Back to Feature Matrix](../personas.md)
- [Parallel Texts](parallel-texts.md)
