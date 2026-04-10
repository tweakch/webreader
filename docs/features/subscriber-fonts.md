---
id: "subscriber-fonts"
name: "Subscriber Fonts"
type: "app"
flag_key: "subscriber-fonts"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "typography"
personas:
  - "05-therapeutic"
  - "06-creatives"
related_features:
  - "typography-panel"
parent: "typography-panel"
children: []
---

# Subscriber Fonts

**Flag:** `subscriber-fonts` · **Lifecycle:** EXPERIMENT · **Default:** off
**Personas:** [Therapeutic](../personas/05-therapeutic.md) · [Creatives](../personas/06-creatives.md)

Expands the Typography Panel with additional font choices: more variants per family (Serif, Sans, Cursive) and a new Mono family.

## Behavior

- When enabled, `FONT_FAMILIES` in `TypographyPanel` includes extended options
- `maxFontSize` ceiling may adjust to accommodate different font metrics
- Mono family supports code-style reading for [Developers](../personas/08-developers.md)

## Links

- [Back to Feature Matrix](../personas.md)
- [Typography Panel](typography-panel.md) — parent feature
