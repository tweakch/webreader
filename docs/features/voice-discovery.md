---
id: "voice-discovery"
name: "Voice Discovery"
type: "app"
flag_key: "voice-discovery"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "advanced-reading"
personas:
  - "07-passive-consumers"
  - "02-parents"
  - "04-culture-explorers"
related_features:
  - "voice-control"
  - "deep-search"
  - "favorites"
parent: "voice-control"
children: []
---

# Voice Discovery

**Flag:** `voice-discovery` · **Lifecycle:** EXPERIMENT · **Default:** off
**Parent:** [Voice Control](voice-control.md)

Open-ended lookup by spoken intent, beyond exact title matching.
Targets parents at bedtime (*"read me something short"*) and passive consumers
(*"surprise me"*).

## Supported intents

| Utterance (examples) | Action |
| --- | --- |
| *"surprise me"*, *"überrasch mich"* | pick a random story, prefer unread favorites |
| *"find a story about a wolf"*, *"such mir etwas mit einem Wolf"* | routes the keyword through the search box (uses `deep-search` when on) |
| *"short story"*, *"kurze geschichte"* | picks a story with the smallest `wordCount` among unread |
| *"long story"*, *"lange geschichte"* | inverse — largest wordCount |

## Behavior

- Routes through the existing `searchTerm` state so the sidebar reflects the
  voice query visually.
- Random pick is deterministic per session so *"surprise me"* → *"another one"*
  does not return the same story twice in a row.

## Dependencies

Requires [`voice-control`](voice-control.md). Keyword search respects whether
[`deep-search`](deep-search.md) is enabled: if it is, content is searched too;
if not, only titles.

## `data-testid`

- `voice-mic-toggle` (shared)
- `voice-transcript` (shared)

## Links

- [Back to Voice Control](voice-control.md)
- [Deep Search](deep-search.md)
