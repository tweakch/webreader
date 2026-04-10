---
id: "word-blacklist"
name: "Word Blacklist"
type: "app"
flag_key: "word-blacklist"
lifecycle: "EXPERIMENT"
flag_default: "off"
category: "text-processing"
personas: []
related_features:
  - "deep-search"
  - "child-profile"
parent: null
children: []
---

# Word Blacklist

**Flag:** `word-blacklist` · **Lifecycle:** EXPERIMENT · **Default:** off

Enter words you don't want to encounter — stories containing those words are hidden in the sidebar.

## Behavior

- Input and list management in `ProfilePanel`
- Blacklist stored in `localStorage` via `usePersistence`
- Stories are filtered at display time: any story whose content includes a blacklisted word is excluded
- Useful for content sensitivity, classroom filtering, or personal preferences

## Notes

Not mapped to a primary persona — this is a power-user / content-control feature that spans multiple contexts (parental control, classroom management, personal preferences).

## Links

- [Back to Feature Matrix](../personas.md)
- [Child Profile](child-profile.md) — parental control companion
