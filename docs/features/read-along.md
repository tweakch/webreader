---
id: "read-along"
name: "Read-Along"
type: "app"
flag_key: "read-along"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "gen-alpha"
personas:
  - "01-pre-readers"
  - "02-parents"
related_features:
  - "word-highlighting"
  - "audio-player"
  - "text-to-speech"
parent: null
children: []
---

# Read-Along

**Flag:** `read-along` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Pre-Readers](../personas/01-pre-readers.md) · [Parents](../personas/02-parents.md)

Simultaneous narration and synchronized word-by-word highlighting — the app-flag implementation of the [Word Highlighting](word-highlighting.md) strategic feature.

## Behavior

- Audio plays (via [Audio Player](audio-player.md) or [Text-to-Speech](text-to-speech.md)) while the current word is highlighted in the reader
- Designed for children learning to read — connects spoken words to written form
- Label: "Vorlesen mit Markierung" (Read aloud with highlighting)

## Links

- [Back to Feature Matrix](../personas.md)
- [Word Highlighting](word-highlighting.md) — strategic feature this implements
- [Audio Player](audio-player.md) — audio source
- [Text-to-Speech](text-to-speech.md) — TTS audio source
