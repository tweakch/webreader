---
id: "story-quiz"
name: "Story Quiz"
type: "app"
flag_key: "story-quiz"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "gen-alpha"
personas:
  - "01-pre-readers"
  - "03-teachers"
related_features:
  - "discussion-questions"
  - "achievements"
  - "child-profile"
parent: null
children: []
---

# Story Quiz

**Flag:** `story-quiz` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Pre-Readers](../personas/01-pre-readers.md) · [Teachers](../personas/03-teachers.md)

Simple comprehension questions displayed at the end of a story — making reading interactive.

## Behavior

- 3–5 multiple-choice or true/false questions per story
- Shown on the end-of-story screen via `EndOfStoryButtons` area
- Questions stored as `quiz.json` in the story directory
- Score tracked per story; contributes to [Achievements](achievements.md)
- Simpler variant of [Discussion Questions](discussion-questions.md) — no AI generation required

## Links

- [Back to Feature Matrix](../personas.md)
- [Discussion Questions](discussion-questions.md) — strategic extension
- [Achievements](achievements.md) — quiz scores feed achievements
