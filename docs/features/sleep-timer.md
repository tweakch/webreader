---
id: "sleep-timer"
name: "Sleep Timer"
type: "strategic"
status: "mvp"
category: "audio"
personas:
  - "02-parents"
  - "07-passive-consumers"
  - "09-seniors"
related_features:
  - "bedtime-mode"
  - "audio-narration"
  - "audio-player"
parent: "bedtime-mode"
children: []
---

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
- [Bedtime Mode](bedtime-mode.md) — parent feature
- [Audio Narration](audio-narration.md)
- [Audio Player](audio-player.md) — existing app flag
