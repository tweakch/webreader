---
id: "voice-control"
name: "Voice Control"
type: "epic"
flag_key: "voice-control"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "advanced-reading"
personas:
  - "09-seniors"
  - "01-pre-readers"
  - "07-passive-consumers"
  - "02-parents"
related_features:
  - "text-to-speech"
  - "audio-player"
  - "favorites"
  - "deep-search"
  - "bedtime-mode"
parent: null
children:
  - "voice-resume"
  - "voice-navigation"
  - "voice-reading-control"
  - "voice-discovery"
  - "voice-hands-free"
---

# Voice Control

**Flag:** `voice-control` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Seniors](../personas/09-seniors.md) · [Pre-Readers](../personas/01-pre-readers.md) · [Passive Consumers](../personas/07-passive-consumers.md) · [Parents](../personas/02-parents.md)

Epic for talking to the app instead of tapping. The motivating story — *"as a user I want to talk to the app so it opens my book where I left off"* — drives a broader opportunity: hands-free reading for users who can't (pre-readers), shouldn't (driving / cooking / bedtime with a child on the lap), or struggle to (seniors, motor-impairment) operate the UI.

## Why it matters

- **Pre-readers** can't tap a story title but can say *"Rotkäppchen"*.
- **Seniors** benefit from a conversational surface that hides UI chrome.
- **Passive consumers** get a true hands-free loop (mic → TTS → mic).
- **Parents** at bedtime can keep the room dark and hands free while a child nestles in.

## Shared foundation

All children depend on a single capture + parse layer, so building it once unlocks every feature below.

- Capture: Web Speech API (`SpeechRecognition` / `webkitSpeechRecognition`) with push-to-talk as the default and optional always-on wake word (e.g. *"Hey Märchen"*).
- Parse: small grammar of verbs (*open, resume, next, stop, find, bookmark*) + story-title fuzzy match against the already-loaded `stories` list.
- Feedback: visible mic indicator in the nav bar, a transient caption of what was heard, and an audible confirmation cue (reuses `useTextToSpeech`).
- Fallbacks: mic unavailable (Safari iOS in some modes, no HTTPS, permission denied) → the mic button is hidden and features degrade to keyboard/tap.
- Privacy: audio is processed in-browser via the Web Speech API; no server upload. Wake word is opt-in.
- i18n: the corpus is DE/EN/FR (Grimm/Andersen/Swiss) — command grammar must be per-locale.

## Identified features (children)

### 1. Voice Resume — *"continue where I left off"*
The motivating story. Reads `wr-last-story` + `wr-last-page` (already persisted in `hooks/usePersistence.js:82-91`) and jumps straight into the reader. Highest-value, smallest surface: a single intent that needs no disambiguation.
- Example utterances: *"continue"*, *"weiterlesen"*, *"last book"*, *"where was I"*.
- Success metric: time-from-open to first word read on returning sessions.

### 2. Voice Navigation — library & pagination
Lets the user move through the app without the sidebar or tap zones.
- *"Open Hansel and Gretel"* → fuzzy match on story titles, disambiguation prompt if >1 hit.
- *"Next page" / "previous page" / "go to page 12"* → hooks into existing pagination (`useReader`).
- *"Back to library" / "go home" / "show favorites"*.
- Success metric: % of sessions with ≥1 successful navigation command.

### 3. Voice Reading Control — TTS in conversation
Turns the existing `text-to-speech` flag into a spoken dialogue.
- *"Read this"*, *"stop"*, *"pause"*, *"faster"*, *"slower"*, *"change voice to German"*.
- Lets the user hand off between eyes-on and ears-on without touching the screen.
- Depends on the `text-to-speech` feature and extends the same hook.

### 4. Voice Discovery — intent-based story lookup
Goes beyond exact title matching into the deep-search territory already flagged (`deep-search`).
- *"Find a short bedtime story"* → filters by reading-duration + bedtime tag.
- *"Read me something with a wolf"* → content search.
- *"Surprise me"* → random pick weighted by favorites / completion.
- Success metric: stories discovered via voice vs. sidebar.

### 5. Voice Hands-Free Mode — continuous loop
The accessibility capstone that stitches the others together.
- Wake word toggles a session that listens between pages, auto-plays TTS, advances on *"next"*, and sleeps after N seconds of silence.
- Directly serves seniors, pre-readers at bedtime, and driving/cooking passive consumers.
- Highest UX risk (false positives, battery, privacy) — ship last, gated on the four above being stable.

## Rollout sketch

1. Voice Resume alone (no wake word, push-to-talk mic button in the nav bar).
2. Add Voice Navigation once the grammar + fuzzy matcher are in place.
3. Layer Voice Reading Control on top of `text-to-speech`.
4. Voice Discovery piggybacking on `deep-search`.
5. Hands-Free mode once command recognition is measurably reliable.

## Open questions

- Wake-word engine: browser-only (no wake word) vs. bundled model (Picovoice-style) vs. server round-trip. Each has cost/privacy trade-offs.
- Child-safe mic UX: pre-readers may trigger accidental commands — confirmation prompts for destructive actions (mark completed, clear favorites).
- Locale detection: follow the active story's language or the browser locale?

## Links

- [Back to Feature Matrix](../personas.md)
- [Text-to-Speech](text-to-speech.md) — paired output side
- [Deep Search](deep-search.md) — powers voice discovery
- [Favorites](favorites.md) — target for voice bookmarking
