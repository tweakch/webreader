---
id: "voice-navigation"
name: "Voice Navigation"
type: "app"
flag_key: "voice-navigation"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "advanced-reading"
personas:
  - "09-seniors"
  - "01-pre-readers"
  - "02-parents"
related_features:
  - "voice-control"
  - "favorites"
  - "story-directories"
parent: "voice-control"
children: []
---

# Voice Navigation

**Flag:** `voice-navigation` · **Lifecycle:** EXPERIMENT · **Default:** off
**Parent:** [Voice Control](voice-control.md)

Move through the library and paginate the reader by voice — no taps or sidebar
required. Targets hands-occupied contexts (bedtime with a child on the lap,
cooking) and motor-impaired users.

## Supported intents

| Utterance (examples) | Action |
| --- | --- |
| *"open Rotkäppchen"*, *"lies Hänsel und Gretel"* | `openStory(title)` with fuzzy match against loaded stories |
| *"next page"*, *"weiter"*, *"umblättern"* | `goToPage(currentPage + 1)` |
| *"previous page"*, *"zurück"* | `goToPage(currentPage - 1)` |
| *"page 12"*, *"seite drei"* | `goToPage(n - 1)` with number-word parsing |
| *"home"*, *"library"*, *"zur übersicht"* | close the current story, return to HomeView |
| *"favorites"*, *"favoriten"* | enable `favoritesOnly`, show home list |
| *"close"*, *"schließen"* | `goBack()` — uses the breadcrumb stack |

Ambiguous title matches (>1 story above a similarity threshold) trigger a
spoken follow-up: *"Did you mean … or …?"*

## Behavior

- Command parsing is pure (`src/lib/voiceCommands.js`) so it is unit-testable
  without mocking the Web Speech API.
- Fuzzy title matching uses lowercased substring scoring against the already-loaded
  `stories` index (2- and 3-level layouts both supported).
- Number-words (*"eins, zwei, drei …"* and *"one, two, three …"*) are mapped to
  integers for *"go to page N"*.

## `data-testid`

- `voice-mic-toggle` (shared with other voice features)
- `voice-transcript` (shared)

## Dependencies

Requires [`voice-control`](voice-control.md). Plays nicely with
[`story-directories`](story-directories.md) — directory names are included in
the fuzzy match corpus when the flag is on.

## Links

- [Back to Voice Control](voice-control.md)
