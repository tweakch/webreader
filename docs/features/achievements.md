# Achievements

**Status:** Near-term  
**Personas:** [Gamified Explorers](../personas/10-gamified-explorers.md)

Badges and milestones awarded for reading activity, breadth, and discovery.

## Achievement Categories

| Category | Examples |
|---|---|
| Streaks | 3-day · 7-day · 30-day reading streak |
| Breadth | Read stories from 5 / 10 / all sources |
| Depth | Complete all stories from a single source |
| Discovery | First story from a new canton / country / motif |
| Completion | Finish 10 · 50 · 100 stories |

## Implementation Notes

- Achievement definitions are a static JSON manifest checked against `completedStories` and `readingHistory`
- The existing `completedStories` (a `Set` in `usePersistence`) is the primary data source
- Achievements rendered in a dedicated section of `ProfilePanel`
- Optional: unlock badge → share card generation

## Links

- [Back to Feature Matrix](../personas.md)
- [Story Map](story-map.md)
