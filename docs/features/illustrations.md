---
id: "illustrations"
name: "Illustrations"
type: "app"
flag_key: "illustrations"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "gen-alpha"
personas:
  - "01-pre-readers"
  - "02-parents"
related_features:
  - "read-along"
  - "child-profile"
parent: null
children: []
---

# Illustrations

**Flag:** `illustrations` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Pre-Readers](../personas/01-pre-readers.md) · [Parents](../personas/02-parents.md)

Displays story-appropriate illustrations when available, shown alongside or between text.

## Behavior

- Illustration files stored in `stories/{source}/{slug}/` alongside `content.md`
- Images rendered at natural breakpoints (between paragraphs or at page boundaries)
- Responsive sizing — fills reading column width

## Links

- [Back to Feature Matrix](../personas.md)
- [Read-Along](read-along.md) — pairs with narration for immersive experience
- [Child Profile](child-profile.md) — illustrations always on in child mode
