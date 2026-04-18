---
id: "voice-hands-free"
name: "Voice Hands-Free"
type: "app"
flag_key: "voice-hands-free"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "advanced-reading"
personas:
  - "09-seniors"
  - "01-pre-readers"
  - "07-passive-consumers"
related_features:
  - "voice-control"
  - "voice-reading-control"
  - "text-to-speech"
parent: "voice-control"
children: []
---

# Voice Hands-Free

**Flag:** `voice-hands-free` · **Lifecycle:** EXPERIMENT · **Default:** off
**Parent:** [Voice Control](voice-control.md)

Keeps the microphone listening continuously (instead of push-to-talk) so the
user never has to tap anything. Accessibility capstone for seniors, pre-readers
at bedtime, and hands-busy contexts.

## Behavior

- When enabled, the mic button becomes a toggle rather than a push-hold.
- Uses `SpeechRecognition.continuous = true` and restarts the session on
  `onend` so a single pause does not drop the listener.
- Commands work exactly as in the push-to-talk modes — the only difference is
  the capture lifecycle.
- Auto-sleep: after N seconds (default 120) without a recognised intent, the
  listener stops and shows a *"Say 'wake up' to resume"* hint.

## Privacy & UX guardrails

- Mic state is visible at all times: a persistent indicator in the nav bar plus
  a transcript toast when audio is actually received.
- Destructive intents (*"mark completed"*, *"clear favorites"*) require a
  spoken confirmation (*"yes, mark it read"*).
- A single *"stop listening"* intent turns the continuous mode off without
  needing to find the button.

## Dependencies

Requires [`voice-control`](voice-control.md). Composes with every other voice
feature — hands-free is not a new intent set, just a different capture mode.

## `data-testid`

- `voice-mic-toggle` (shared — in hands-free mode acts as on/off)
- `voice-hands-free-indicator` — persistent listening dot

## Links

- [Back to Voice Control](voice-control.md)
- [Voice Reading Control](voice-reading-control.md)
