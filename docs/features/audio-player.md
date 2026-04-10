---
id: "audio-player"
name: "Audio Player"
type: "app"
flag_key: "audio-player"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "advanced-reading"
personas:
  - "01-pre-readers"
  - "02-parents"
  - "07-passive-consumers"
  - "09-seniors"
related_features:
  - "audio-narration"
  - "sleep-timer"
  - "text-to-speech"
  - "word-highlighting"
parent: null
children: []
---

# Audio Player

**Flag:** `audio-player` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Pre-Readers](../personas/01-pre-readers.md) · [Parents](../personas/02-parents.md) · [Passive Consumers](../personas/07-passive-consumers.md) · [Seniors](../personas/09-seniors.md)

Displays an embedded audio player when a recorded audio file exists for the current story.

## Behavior

- `AudioPlayer` component rendered in the reader area when `storyAudioFiles` has an entry for the current story
- Audio files tracked via `loadStoryAudioMap` at app load
- Supports play/pause, seek, and volume
- Foundation for [Audio Narration](audio-narration.md) strategic feature

## Links

- [Back to Feature Matrix](../personas.md)
- [Audio Narration](audio-narration.md) — strategic roadmap feature
- [Text-to-Speech](text-to-speech.md) — TTS narration complement
- [Sleep Timer](sleep-timer.md) — companion feature
