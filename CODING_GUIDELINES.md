# Coding guidelines

Conventions that make this codebase pleasant for humans and tractable for
agents. Every rule here is enforced by a test under
`tests/unit/guidelines/` — if the rule drifts from reality, the test fails.
That way the document cannot silently rot.

Exceptions are allowed, but they must be registered in
[`guidelines.config.json`](./guidelines.config.json) with a reason and, where
applicable, an expiry date. An exception without an owner is a broken window.

| # | Rule                                                            | Test                                                  |
|---|-----------------------------------------------------------------|-------------------------------------------------------|
| 1 | [File-size budget](#1-file-size-budget)                         | `tests/unit/guidelines/file-size.test.js`             |
| 2 | [One canonical home per component name](#2-one-canonical-home-per-component-name) | `tests/unit/guidelines/component-placement.test.js` |
| 3 | [A/B variants have an expiry date](#3-ab-variants-have-an-expiry-date) | `tests/unit/guidelines/ab-variant-expiry.test.js`  |
| 4 | [Released flags declare a retirement date](#4-released-flags-declare-a-retirement-date) | `tests/unit/guidelines/flag-retirement.test.js` |
| 5 | [`data-testid` naming + drift check](#5-data-testid-naming--drift-check) | `tests/unit/guidelines/data-testid.test.js`         |
| 6 | [Hook public APIs carry JSDoc](#6-hook-public-apis-carry-jsdoc) | `tests/unit/guidelines/hook-jsdoc.test.js`            |

Run `npm run test:unit -- guidelines` to check just these.

---

## 1. File-size budget

No source file grows past **400 lines** without an explicit entry in
`guidelines.config.json#fileSizeAllowlist`. Each allowlisted file states a
target size and a reason (typically: extract into smaller modules by a
specific date).

**Why:** long files are the single biggest drag on agent navigation and
human review. Agents can grep, but a 1000-line god component forces a full
read to understand local context; reviewers miss subtle changes in big
diffs. Splitting modules is the cheapest AX upgrade available.

**How to split:** prefer extracting cohesive subtrees (a section of the
render, or a related cluster of handlers+state) into a sibling component or
a custom hook. Do not split mechanically by line count — if you can't name
what you extracted, don't extract it.

## 2. One canonical home per component name

A given component file name appears in exactly **one** of:

- `components/` — feature-specific React components owned by `grimm-reader.jsx`
- `ui/` — reusable, presentation-only primitives (no app-state coupling)
- `src/components/` — new home for components migrated to the Vite `src/` tree

Duplicate basenames across roots are banned. When moving a file, delete the
old copy in the same commit.

**Why:** today the three roots coexist and agents/humans can't tell where a
new component should live. Forcing uniqueness surfaces the drift and makes
"where does this go?" a solvable question.

## 3. A/B variants have an expiry date

Every `AB_EXPERIMENTS` entry must declare a `startedAt` ISO date and an
`expiresBy` ISO date. When `expiresBy` is in the past, the test fails,
forcing a decision: promote the winning variant and delete the losers, or
extend the experiment with a written reason.

**Why:** the repo has accumulated `SidebarV2`, `ProfilePanelTabbed`, and
`ProfilePanelGrouped` because variants live forever. An expiry date turns
"we'll clean this up later" into a test failure.

## 4. Released flags declare a retirement date

Every `FEATURE_REGISTRY` entry with `status: 'released'` must declare a
`retireBy` ISO date — the date by which the flag (not the feature) should
be removed from the registry and any `if (flag)` branches collapsed. Past
dates fail the test.

**Why:** released flags that linger are dead code paths that confuse agents
(which branch is the "real" one?) and accumulate into the `show*` wall of
destructuring at the top of `grimm-reader.jsx`.

## 5. `data-testid` naming + drift check

All `data-testid` values in `components/`, `ui/`, `src/`, and the root
`*.jsx` files must match `^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$` (kebab-case). A
single script scans the codebase and emits the list; the test asserts that
the extracted list equals the list in
`tests/unit/guidelines/__fixtures__/data-testids.txt`. Drift = review the
diff, re-snapshot intentionally.

**Why:** the `data-testid` list in `CLAUDE.md` is useful for agents but
drifts from code. An auto-generated snapshot is load-bearing without human
maintenance.

## 6. Hook public APIs carry JSDoc

Every named or default export in `hooks/*.js` begins with a JSDoc block
that documents at minimum the return shape (or parameters, if any). A
one-line `@returns` is enough; the goal is to give agents a type contract
without adopting TypeScript.

**Why:** `grimm-reader.jsx` destructures ~30 values from `useFeatureFlags`
alone. Without docs, agents guess at the shape by reading the hook body.

---

## Exceptions (`guidelines.config.json`)

```json
{
  "fileSizeAllowlist": [
    { "file": "grimm-reader.jsx", "limit": 1100, "reason": "Top-level composition; split tracked in TODO" }
  ],
  "componentPlacementDuplicateAllowlist": [],
  "flagRetirementAllowlist": [],
  "dataTestidAllowlist": [],
  "hookJsdocAllowlist": []
}
```

Every allowlist entry should carry a `reason`. Entries without a reason
fail the config-sanity test.
