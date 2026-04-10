---
id: "word-highlighting"
name: "Word Highlighting"
type: "strategic"
status: "vision"
category: "reading-experience"
personas:
  - "01-pre-readers"
related_features:
  - "audio-narration"
  - "read-along"
parent: null
children: []
---

# Word Highlighting

**Status:** Vision
**Personas:** [Pre-Readers](../personas/01-pre-readers.md)

Synchronized word-by-word text highlighting driven by audio playback position.

## How It Works

As audio plays, each word is highlighted in the rendered page in real time. The reader scrolls or pages automatically to keep the current word visible.

## Implementation Notes

- Requires per-word timing data — either WebVTT cues or a custom timestamp array alongside the audio file
- The `buildPages` algorithm already tokenizes content into `{ word, isPara }` entries — each token maps cleanly to a highlightable `<span>`
- Highlight state is a single `currentWordIndex` integer; no re-pagination needed

## Links

- [Back to Feature Matrix](../personas.md)
- [Audio Narration](audio-narration.md) — prerequisite feature
- [Read-Along](read-along.md) — app flag implementing this concept
