# Paper UI design spec

This document captures the "paper" posture of the reader — what it is, what it
is not, and the tokens that encode it. Implementation lives in `index.css`,
`components/ReaderBottomBar.jsx`, `components/AppTopBar.jsx`,
`components/GestureDrawers.jsx`, `components/GestureDrawerViewport.jsx`, and
`hooks/useReader.js`.

## Principles

1. **Paper is the medium, not the effect.** No page curl, no 3D flip, no fold
   simulation. The surface *is* paper; we don't animate as if it were.
2. **Chrome recedes.** During reading, the nav bar and top bar fade away and
   return on intent. Controls never compete with text.
3. **Motion is confidence.** Every user-facing transition finishes within
   `--motion-md` (220ms). Anything longer is decoration; delete it.
4. **Axes are uniform.** All four edges share one gesture grammar and one
   panel renderer. Empty edges swallow the gesture silently.
5. **Typography is the UI.** The reader's voice lives in type, spacing, and
   rhythm — not in buttons, borders, or backgrounds.

## Tokens

Defined in `index.css` and overridden per theme
(`.app-theme-light`, `.app-theme-dark`, `.app-theme-light-hc`,
`.app-theme-dark-hc`).

### Surface

| Token | Light | Dark | Role |
|---|---|---|---|
| `--paper-surface` | `#faf6ee` (cream) | `#15110b` (deep warm) | Primary paper background |
| `--paper-ink` | `#1f1a12` | `#e8dfc9` | Body text, icons |
| `--paper-ink-muted` | `#6b6558` | `#9a9283` | Page counters, secondary labels |
| `--paper-rule` | `#e8e0cf` | `#2a2419` | Hairline dividers only |

High-contrast themes collapse to pure black/white for rules and ink.

### Motion

| Token | Duration | Used for |
|---|---|---|
| `--motion-xs` | 80ms | Paper-settle page-turn pulse |
| `--motion-sm` | 150ms | Chrome fade (nav bar auto-hide/reveal) |
| `--motion-md` | 220ms | Drawer open/close, backdrop fade |
| `--motion-ease-standard` | `cubic-bezier(0.32, 0.72, 0.36, 1)` | All of the above |

The budget is tight on purpose. If a transition wants more than 220ms, it is
decoration and should be removed.

## Slot contract (four-axis drawers)

Panels are registered declaratively:

```jsx
<GestureDrawerContent edge="left" title="Library">
  {node}
</GestureDrawerContent>
```

Or imperatively:

```js
useGestureDrawerSlot('left', { title: 'Library', node, ...overrides });
```

Edges accept the canonical names `top`, `bottom`, `left`, `right`, plus the
legacy aliases `header` (→ `top`) and `footer` (→ `bottom`). Any edge without
a registered slot is silent: swiping from that edge does nothing, renders no
backdrop, no bounce.

Content assignment is a consumer concern. The engine does not prescribe what
lives at any edge.

## What this *isn't*

- A skeuomorphic paper effect. No fiber noise, no paper shadow under the text.
- A "bookshelf" metaphor. Books live inside the app; the app does not pretend
  to be a bookshelf.
- An ornament layer. Existing ornaments (monochrome separators between
  paragraphs, reserved by `ORNAMENT_RESERVE_PX` in `hooks/useReader.js`) are
  content, not chrome — they stay.

## Verification

- `npm run dev` — reader surface uses the paper tokens; chrome fades after
  idle; drawers open/close within budget.
- `npm run test:unit` — testid guideline snapshot still green.
- `npm run test` — `tests/paper-chrome.spec.js`,
  `tests/drawer-uniformity.spec.js`, plus existing specs green.
