---
id: "voice-resume"
name: "Voice Resume"
type: "app"
flag_key: "voice-resume"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "advanced-reading"
personas:
  - "09-seniors"
  - "01-pre-readers"
  - "07-passive-consumers"
related_features:
  - "voice-control"
  - "favorites"
parent: "voice-control"
children: []
---

# Voice Resume

**Flag:** `voice-resume` · **Lifecycle:** EXPERIMENT · **Default:** off
**Parent:** [Voice Control](voice-control.md)

Opens the last-read story on the last-read page in response to a spoken command
like *"continue"*, *"weiterlesen"*, or *"resume"*. The motivating story for the
whole [Voice Control](voice-control.md) epic.

## Behavior

- Reads `wr-last-story` + `wr-last-page` from localStorage (already written by
  `hooks/usePersistence.js` and `grimm-reader.jsx`).
- Matches commands against a small verb list (`continue`, `resume`, `weiterlesen`,
  *"where was I"*, *"last book"*).
- On match, jumps straight into the reader at the saved page via the existing
  `pendingResumePageRef` flow.
- If no resume session exists, a spoken + visual *"Nothing to resume yet"*
  feedback message is shown.
- Degrades gracefully when the browser does not expose `SpeechRecognition`
  (Safari desktop, some locked-down browsers) — the mic button is hidden.

## `data-testid`

- `voice-mic-toggle` — push-to-talk button in the nav bar / home view.
- `voice-transcript` — transient caption of what was heard (shared across all
  voice features).

## Dependencies

Requires the parent [`voice-control`](voice-control.md) flag to also be on — it
owns the capture hook and UI affordance.

## Links

- [Back to Voice Control](voice-control.md)
- [Favorites](favorites.md) — resume coexists with favorites on the home screen.
