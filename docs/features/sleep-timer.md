# Sleep Timer

**Status:** MVP  
**Personas:** [Parents](../personas/02-parents.md) · [Passive Consumers](../personas/07-passive-consumers.md) · [Seniors](../personas/09-seniors.md)

Auto-stop audio playback after a configurable duration.

## Options

- 15 min · 30 min · 45 min · end of current story
- Volume fade-out in the last 60 seconds
- Optional: resume from last position on next open

## Implementation Notes

- Timer state lives alongside `speedReaderMode` in `grimm-reader.jsx`
- Audio fade: `AudioPlayer` exposes a volume prop; tween it down over 60 s using `requestAnimationFrame`
- "End of story" option: stop when `currentPage === totalPages` and the story is marked complete

## Links

- [Back to Feature Matrix](../personas.md)
- [Bedtime Mode](bedtime-mode.md)
- [Audio Narration](audio-narration.md)
