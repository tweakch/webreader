# Refactoring targets

Audit of the webreader codebase to identify high-value refactoring work. Findings are scoped to source under the project root, `src/`, `components/`, `hooks/`, `ui/`, and `crawlers/` (test files and `node_modules` excluded).

Scan date: 2026-04-19. Re-run when `git log --since="6 months"` shows substantial change.

## God files (top 5 by LOC)

### `grimm-reader.jsx` (1055 lines)

Root app composition. Owns story-selection state, sidebar/profile/docs/personas modal coordination, theme + typography persistence, breadcrumb wiring, library loading, and feature-flag destructuring for ~40 flags.

Pain:
- Destructures 40+ flags at lines 57–78, creating a maintenance wall when flags are added or renamed.
- Mixes high-level composition with low-level concerns (childAge state, age-filter plumbing, pinch-gesture DOM handlers).
- A/B variant selection scattered in render (`SidebarComponent` at line 778, profile variant pick at lines 863–865).

Extraction candidates:
- `hooks/useChildProfile.js` — childAge state + derived umbrella flags (showSimplifiedUi, showIllustrations, ageFilterActive, maxFontSize).
- `hooks/useAppFeatureFlags.js` — wraps `useFeatureFlags`, exposes a flat object of pre-computed derived flags.
- `hooks/useAppModals.js` — profile/docs/personas/search modal state.
- `components/AppVariantRenderer.jsx` — owns sidebar + profile A/B variant conditionals.

### `FeatureDocs.jsx` (1012 lines, repo root)

In-app German documentation modal. Stores per-feature docs as a single `DOCS` object with `lead`/`on`/`off`/`tip` arrays for ~40 features, plus search and anchor navigation.

Pain:
- Adding a feature requires editing both the registry and this file — easy to drift.
- Per-feature copy and modal logic share one file.
- Component lives at repo root; should sit in `components/` per guideline #2.

Extraction candidates:
- `docs/features/<featureKey>.json` per feature, loaded via Vite glob.
- `components/FeatureDocs.jsx` — keep search/anchor/render logic only (~250 lines).
- Test that asserts every registry key has a matching doc file.

### `src/lib/featureRegistry.jsx` (825 lines)

Unified registry: feature flags, profile toggles, role defaults, release status, expiry dates, group metadata, icons.

Pain:
- Mixes data (declarations) with helpers (`getDefaultRoleFeatures`, `getFeaturesByStatus`).
- `FEATURE_GROUPS` table at line ~89+ duplicates icon definitions.
- Each feature row re-states its `roles` array.

Extraction candidates:
- `src/lib/featureRoleDefaults.js` — role → [keys] map.
- `src/lib/featureGroups.js` — `FEATURE_GROUPS` + helpers.
- Move helpers to a sibling file; keep registry to declarations only (~400 lines).

### `components/SidebarV2.jsx` (869 lines)

A/B variant of the sidebar. Tree navigation, keyboard shortcuts, swipe gestures, collections blade, age-filter picker, drag-follow backdrop.

Status: experiment `sidebar`, expires **2026-07-01**.

Pain:
- Variant awaiting decision; if v2 wins, `Sidebar.jsx` (398 lines) becomes dead code.
- Combines gesture handling, keyboard nav, and tree rendering in one file.

If promoted, extract:
- `components/SidebarTree.jsx`
- `hooks/useKeyboardNavigation.js`, `hooks/useSwipeGestures.js`
- `components/CollectionsPane.jsx`
- `components/AgeFilterModal.jsx`

### `components/ProfilePanelTabbed.jsx` (698 lines)

A/B variant of the profile panel (Profil/Lesen/Einstellungen/Abo/Entwicklung tabs).

Status: experiment `profile-layout`, expires **2026-06-15**. Variants live: `flat` (`ProfilePanel.jsx`, 355), `grouped` / `role-opt` (`ProfilePanelGrouped.jsx`, 540), `tabbed` (this file).

Action: when the experiment resolves, delete the losing variants. ~1500 LOC potentially removable.

## Duplicated variants and dead-code candidates

| File | Lines | Experiment | Expires | Action on resolution |
|------|-------|------------|---------|----------------------|
| `components/Sidebar.jsx` | 398 | `sidebar` (control) | 2026-07-01 | Delete if v2 wins |
| `components/SidebarV2.jsx` | 869 | `sidebar` (v2) | 2026-07-01 | Delete if control wins, else extract sub-modules |
| `components/ProfilePanel.jsx` | 355 | `profile-layout` (`flat`) | 2026-06-15 | Delete if not selected |
| `components/ProfilePanelGrouped.jsx` | 540 | `profile-layout` (`grouped`/`role-opt`) | 2026-06-15 | Delete if not selected |
| `components/ProfilePanelTabbed.jsx` | 698 | `profile-layout` (`tabbed`) | 2026-06-15 | Delete if not selected |

Variant selection lives in `grimm-reader.jsx` lines 778 and 863–865.

No code is dead today, but both experiments have hard expiry dates. Failing to resolve them on time is the highest-value refactoring opportunity in the codebase.

## Root-level files

| File | Verdict |
|------|---------|
| `grimm-reader.jsx` | Lazy-imported by `src/layouts/AppLayout.jsx`. Position is intentional — leave. |
| `FeatureDocs.jsx` | UI component, should move to `components/FeatureDocs.jsx` for consistency. |
| `features.jsx` | Barrel re-export from `src/lib/featureRegistry`. Intentional — leave. |

## Misplaced concerns

- `components/PersonasDocsView.jsx:369` — direct `fetch(RAW_BASE + path)` for markdown. Extract to `src/lib/personasLoader.js` so the component is pure and the loader is mockable.
- `src/lib/featureRegistry.jsx` — contains lucide-react JSX. Acceptable: icons are metadata, the file is config-as-code.
- `hooks/*.js` — all checked are pure (no JSX returned).

## Test coverage gaps

| File | Lines | Unit | E2E |
|------|-------|------|-----|
| `grimm-reader.jsx` | 1055 | none | yes (core-navigation, animation-navigation) |
| `FeatureDocs.jsx` | 1012 | none | indirect via profile-story-navigation |
| `src/lib/featureRegistry.jsx` | 825 | yes (schema test) | n/a |
| `components/SidebarV2.jsx` | 869 | none | yes (enhanced-gestures.spec.js) |
| `components/ProfilePanelTabbed.jsx` | 698 | none | indirect |
| `hooks/useReader.js` | 257 | yes | yes (pagination-invariants) |

The variant-selection conditionals in `grimm-reader.jsx` lines 778 and 863–865 are untested at the unit level — easy place for a regression to slip in during cleanup.

## Quick wins (≤1 hour each)

1. Move `FeatureDocs.jsx` → `components/FeatureDocs.jsx`. One import to update.
2. Extract `fetch` from `PersonasDocsView.jsx` into `src/lib/personasLoader.js`.
3. Add unit tests around the variant conditionals at `grimm-reader.jsx:778` and `:863-865`.
4. Wrap the 40-flag destructure (`grimm-reader.jsx:57-78`) in `hooks/useAppFeatureFlags.js`.

## Recommended order of attack

**Phase 1 — safe refactors (no decisions required)**

1. Extract A/B variant selection into `components/AppVariantRenderer.jsx` (~2 h). Centralizes experiment wiring; trims ~30 lines from `grimm-reader.jsx`; makes variant logic testable.
2. Extract feature-flag destructuring into `hooks/useAppFeatureFlags.js` (~1.5 h). Clarifies derived flags; eases onboarding.
3. Move `FeatureDocs.jsx` to `components/` (~30 min). Aligns with guideline #2.

**Phase 2 — experiment resolution (blocked on product decision)**

4. Resolve `sidebar` A/B before 2026-07-01. Removes 400+ lines either way.
5. Resolve `profile-layout` A/B before 2026-06-15. Removes ~1500 lines either way.

**Phase 3 — larger refactors (post-experiments)**

6. Split `featureRegistry.jsx` into declarations + role defaults + groups (~2 h). Drops file from 825 → ~400.
7. Modularise `FeatureDocs.jsx` per-feature via Vite glob (~3 h). Drops file from 1012 → ~250 and removes the dual-edit hazard.
8. Extract `useChildProfile` hook (~1.5 h). Makes age/illustration/simplified-UI logic testable.
