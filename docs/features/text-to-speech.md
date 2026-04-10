---
id: "text-to-speech"
name: "Text-to-Speech"
type: "app"
flag_key: "text-to-speech"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "advanced-reading"
personas:
  - "09-seniors"
  - "07-passive-consumers"
related_features:
  - "audio-player"
  - "audio-narration"
  - "read-along"
parent: null
children: []
---

# Text-to-Speech

**Flag:** `text-to-speech` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Seniors](../personas/09-seniors.md) · [Passive Consumers](../personas/07-passive-consumers.md)

Reads the story text aloud using a synthetic voice — independent of pre-recorded audio files.

## Behavior

- Uses Web Speech API (`SpeechSynthesis`) or a cloud TTS provider
- Works on any story without pre-recorded audio, unlike [Audio Player](audio-player.md)
- Rate and voice configurable in settings
- Complement to [Read-Along](read-along.md): TTS drives the audio, read-along adds highlighting

## Links

- [Back to Feature Matrix](../personas.md)
- [Audio Player](audio-player.md) — recorded audio sibling
- [Audio Narration](audio-narration.md) — strategic roadmap
- [Read-Along](read-along.md) — word highlight complement
