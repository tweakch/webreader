---
id: "audio-narration"
name: "Audio Narration"
type: "strategic"
status: "near-term"
category: "audio"
personas:
  - "01-pre-readers"
  - "02-parents"
  - "04-culture-explorers"
  - "07-passive-consumers"
  - "09-seniors"
related_features:
  - "word-highlighting"
  - "sleep-timer"
  - "audio-player"
  - "text-to-speech"
  - "read-along"
parent: null
children:
  - "word-highlighting"
  - "sleep-timer"
---

# Audio Narration

**Status:** Near-term
**Personas:** [Pre-Readers](../personas/01-pre-readers.md) · [Parents](../personas/02-parents.md) · [Culture Explorers](../personas/04-culture-explorers.md) · [Passive Consumers](../personas/07-passive-consumers.md) · [Seniors](../personas/09-seniors.md)

Full-story audio narration with optional AI character voices.

## Variants

| Variant | Description |
|---|---|
| Single narrator | One TTS voice reads the full story |
| Character voices | Distinct AI voices assigned per story character |
| Original-language | Native-language audio for cultural authenticity |
| Slow-paced | Deliberate narration with natural pauses (Seniors) |

## Implementation Notes

- The `audio-player` feature flag and `AudioPlayer` UI component already exist in the codebase
- Story audio files are tracked in `storyAudioFiles` state (loaded via `loadStoryAudioMap`)
- TTS generation can be pre-rendered at crawl time and stored alongside `content.md` in `stories/{source}/{slug}/`

## Links

- [Back to Feature Matrix](../personas.md)
- [Word Highlighting](word-highlighting.md) — pairs with narration
- [Sleep Timer](sleep-timer.md) — companion feature
- [Audio Player](audio-player.md) — existing app flag
- [Text-to-Speech](text-to-speech.md) — existing app flag
