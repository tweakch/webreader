# Discussion Questions

**Status:** Near-term  
**Personas:** [Teachers](../personas/03-teachers.md) · [Therapeutic](../personas/05-therapeutic.md)

AI-generated Socratic discussion prompts and guided inquiry questions per story.

## Question Types

| Type | Example |
|---|---|
| Comprehension | "Why did the miller's daughter agree to spin gold?" |
| Interpretation | "What does the spinning wheel represent in this story?" |
| Personal | "Have you ever felt pressure to do something impossible?" |
| Cross-cultural | "How does this version differ from the French variant?" |

## Implementation Notes

- Generated at crawl time and stored as `questions.json` in `stories/{source}/{slug}/`
- Or generated on-demand via a Claude API call with the story text as context
- Display as a collapsible panel below the story in `ReaderView`

## Links

- [Back to Feature Matrix](../personas.md)
- [Symbol Analysis](symbol-analysis.md)
- [Journaling Prompts](journaling-prompts.md)
