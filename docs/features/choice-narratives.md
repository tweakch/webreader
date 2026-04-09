# Choice Narratives

**Status:** Vision  
**Personas:** [Pre-Readers](../personas/01-pre-readers.md) · [Creatives](../personas/06-creatives.md) · [Gamified Explorers](../personas/10-gamified-explorers.md)

Branching story experiences where reader decisions shape the narrative path.

## Story Format

Stories are authored as a decision graph:
- Each node is a story segment (Markdown content block)
- Each segment ends with 2–3 choices
- Choices link to child nodes
- Terminal nodes are story endings (multiple possible outcomes)

## Implementation Notes

- Story format extension: `content.branches.json` alongside `content.md`, describing the graph
- The reader displays choice buttons at page-turn points instead of the normal next-page control
- State: `currentNodeId` replaces `currentPage` when branch mode is active
- `buildPages` runs on the current node's content only — same algorithm, smaller input

## Links

- [Back to Feature Matrix](../personas.md)
- [Story Remix](story-remix.md) — AI can generate branch options from a linear story
