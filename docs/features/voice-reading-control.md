---
id: "voice-reading-control"
name: "Voice Reading Control"
type: "app"
flag_key: "voice-reading-control"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "advanced-reading"
personas:
  - "09-seniors"
  - "07-passive-consumers"
  - "01-pre-readers"
related_features:
  - "voice-control"
  - "text-to-speech"
  - "read-along"
parent: "voice-control"
children: []
---

# Voice Reading Control

**Flag:** `voice-reading-control` · **Lifecycle:** EXPERIMENT · **Default:** off
**Parent:** [Voice Control](voice-control.md)

Turns [Text-to-Speech](text-to-speech.md) into a conversational surface:
the user speaks, the app reads. No fiddling with play/pause buttons.

## Supported intents

| Utterance (examples) | Action |
| --- | --- |
| *"read"*, *"read aloud"*, *"vorlesen"* | `handleToggleTts()` starts a read-session; auto-advances pages |
| *"pause"* | `handleToggleTts()` (pause path) |
| *"continue"* / *"weiter"* (while paused) | `handleToggleTts()` (resume path) |
| *"stop"*, *"anhalten"* | `handleStopTts()` |
| *"faster"*, *"schneller"* | `setRateIdx(min(TTS_RATES.length - 1, rateIdx + 1))` |
| *"slower"*, *"langsamer"* | `setRateIdx(max(0, rateIdx - 1))` |

## Behavior

- The hook reuses `useTextToSpeech` directly — no duplicate state.
- When spoken while the reader is closed, *"read"* falls through to
  [Voice Resume](voice-resume.md) — it opens the last book and begins reading.
- Pairs naturally with [Read-Along](read-along.md) (word highlighting) when that
  feature is present.

## Fallback

If `text-to-speech` is off or `ttsSupported` is false, these intents are ignored
(they are not registered). Users see no stale voice controls.

## `data-testid`

- `voice-mic-toggle` (shared)
- `voice-transcript` (shared)

## Dependencies

Requires [`voice-control`](voice-control.md) **and**
[`text-to-speech`](text-to-speech.md).

## Links

- [Back to Voice Control](voice-control.md)
- [Text-to-Speech](text-to-speech.md)
