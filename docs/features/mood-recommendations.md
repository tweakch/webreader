# Mood Recommendations

**Status:** Vision  
**Personas:** [Therapeutic](../personas/05-therapeutic.md)

Story suggestions driven by the user's current emotional state.

## Mood → Story Mapping

| Mood | Story Type | Example |
|---|---|---|
| Anxious | Calming, resolved endings | Cinderella, Sleeping Beauty |
| Sad | Transformative, hopeful | The Ugly Duckling |
| Angry | Trickster satisfaction | Rumpelstiltskin |
| Curious | Adventure, discovery | Alice-type journeys |
| Nostalgic | Classic canonical versions | Brothers Grimm originals |

## Implementation Notes

- User selects a mood from a simple emoji-based picker
- Mood-to-story affinity scores stored in story frontmatter or a separate `mood-map.json`
- Scores generated via Claude API analysis of story tone, resolution, and archetype
- Pairs naturally with [Journaling Prompts](journaling-prompts.md) post-read

## Links

- [Back to Feature Matrix](../personas.md)
- [Journaling Prompts](journaling-prompts.md)
