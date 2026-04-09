# Bedtime Mode

**Status:** MVP  
**Personas:** [Parents](../personas/02-parents.md) · [Passive Consumers](../personas/07-passive-consumers.md)

One-tap ritual mode: curated story queue, fixed session length, screen-dimming, and auto-stop.

## User Flow

1. Tap "Bedtime" → choose 5 / 10 / 15 min
2. App selects an age-appropriate story and begins reading or narration
3. Screen dims after 30 s of inactivity
4. At session end (or [Sleep Timer](sleep-timer.md) expiry), audio fades out and app locks

## Implementation Notes

- Session length maps to approximate word count using the existing `readingDuration` calculation
- Story selection draws from the filtered library (respects [Age Filter](age-filter.md) if enabled)
- Screen dimming: CSS `filter: brightness()` transition on the reader area

## Links

- [Back to Feature Matrix](../personas.md)
- [Sleep Timer](sleep-timer.md)
- [Age Filter](age-filter.md)
