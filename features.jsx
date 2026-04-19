/**
 * Re-export from the unified registry.
 *
 * Adding a new feature? Edit `src/lib/featureRegistry.jsx` instead — that's
 * the single source of truth for flags.json, role defaults, and the profile
 * toggle UI. Consistency tests in tests/unit/registryConsistency.test.js
 * catch drift.
 */
export { FEATURES, FEATURE_REGISTRY } from './src/lib/featureRegistry';

// =============================================================================
// FEATURE GAPS — registry audit
// =============================================================================
// The features below are documented in docs/features/ but NOT yet registered.
// Each CTC describes what to add to ship the feature end-to-end.
//
// CTC convention:
//   - "CTC:" marks a Call-To-Claude action item.
//   - Once the feature is implemented (registry entry in
//     src/lib/featureRegistry.jsx + wiring at the listed anchor file), DELETE
//     the corresponding CTC block.
//   - The matching anchor-site CTC comments in the integration files must be
//     removed in the same change. Search for "CTC:" across the repo.
//
// --- MVP -------------------------------------------------------------------
// CTC: Implement `age-filter` — see docs/features/age-filter.md
// CTC: Implement `bedtime-mode` — see docs/features/bedtime-mode.md
// CTC: Implement `sleep-timer` — see docs/features/sleep-timer.md
// --- Near-term -------------------------------------------------------------
// CTC: Implement `audio-narration` — see docs/features/audio-narration.md
// CTC: Implement `achievements` — see docs/features/achievements.md
// CTC: Implement `cultural-annotations` — see docs/features/cultural-annotations.md
// CTC: Implement `discussion-questions` — see docs/features/discussion-questions.md
// CTC: Implement `journaling-prompts` — see docs/features/journaling-prompts.md
// CTC: Implement `parallel-texts` — see docs/features/parallel-texts.md
// --- Vision (do not implement yet) -----------------------------------------
// choice-narratives, mood-recommendations, story-map, story-remix,
// symbol-analysis, word-highlighting, story-api — see docs/features/.
// =============================================================================
