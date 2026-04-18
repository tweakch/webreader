# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Release tags are named `vX.Y.Z`. When a tag is pushed, CI publishes a GitHub
Release populated from the matching section below.

## [Unreleased]

## [1.2.0] - 2026-04-18
### Added
- **Voice control epic** ([PR #21](https://github.com/tweakch/webreader/pull/21)).
  Parent `voice-control` flag plus five child flags
  (`voice-resume`, `voice-navigation`, `voice-reading-control`,
  `voice-discovery`, `voice-hands-free`), all default `off`. Adds
  `useVoiceControl` (Web Speech API capture, push-to-talk + continuous),
  `src/lib/voiceCommands.js` (36 DE/EN intents), `VoiceControl.jsx`
  orchestrator, per-feature docs under `docs/features/voice-*.md`,
  and unit coverage for parser and capture hook.
- **Senior-targeted features** ([PR #17](https://github.com/tweakch/webreader/pull/17)).
  - `text-to-speech`: Web Speech API narration with NavBar controls,
    auto page-advance, voice and rate pickers, persisted via
    `useTextToSpeech` (`wr-tts-voice`, `wr-tts-rate`). `data-testid`:
    `tts-toggle`, `tts-stop`, `tts-rate-*`, `tts-voice-select`.
  - `simplified-ui`: larger tap targets across NavBar, sidebar, story
    list, source list, directory list, profile shortcut; hides
    experimental/debug toggles in the profile panel.
- **A/B testing framework** ([PR #14](https://github.com/tweakch/webreader/pull/14)).
  Flags `ab-testing` and `ab-testing-admin`, experiment registry at
  `src/lib/abExperiments.js`, `useABTesting` hook, and `ABTestingPanel`
  in the profile. Admin can activate/revoke variants and grant
  per-role access; ships `sidebar-v2` as the inaugural experiment with
  a tree-view variant and `j`/`k` keyboard navigation.
- **Sidebar V2 usability pass** ([PR #15](https://github.com/tweakch/webreader/pull/15)).
  Sticky search/toolbar, expand-all/collapse-all with open/total
  counter, shortcut cheat-sheet (`/` focus, `Esc` clear, `[`/`]`
  collapse/expand), auto-scroll to the active story, auto-expand
  source/directory of the active story, favorites shelf (first 6
  inline + overflow link), empty-state hint.
- **Subscription tiers + Sales role** ([PR #18](https://github.com/tweakch/webreader/pull/18)).
  Five-tier model (Free, Plus, Pro, Family, Edu) documented in
  `docs/sales/`. New internal Sales role with an enumerable feature
  list. Ten commerce feature flags (`tier-badge`, `paywall`,
  `upgrade-cta`, `trial-banner`, `pricing-page`, `promo-code`,
  `referral-program`, `sales-mode`, `conversion-analytics`,
  `billing-portal-stub`) plus five sales-gated experiments.
- **Breadcrumb back navigation** ([PR #19](https://github.com/tweakch/webreader/pull/19)).
  New `useBreadcrumbNavigation` hook registers an undo for every forward
  nav (source, directory, story, profile, docs, personas, speed
  reader) and mirrors it onto `history.pushState`; device-back walks
  the stack instead of dropping the user on the landing page. When the
  stack is empty, surfaces `LeaveAppDialog` before leaving `/app`.
- **Grouped profile layout** ([PR #20](https://github.com/tweakch/webreader/pull/20)).
  New `profile-layout` experiment (`flat`/`grouped`/`role-opt`) and a
  grouped `ProfilePanelGrouped` with five collapsible sections;
  `role-opt` pre-opens the most relevant section per role.
- **Thumb-friendly profile access** ([PR #15](https://github.com/tweakch/webreader/pull/15))
  on tablet/mobile.
- **CTC audit** ([PR #22](https://github.com/tweakch/webreader/pull/22)):
  "Call-To-Claude" TODO comments at each unimplemented documented
  feature's integration anchor. Gaps: MVP (`age-filter`,
  `bedtime-mode`, `sleep-timer`), near-term (`audio-narration`,
  `achievements`, `cultural-annotations`, `discussion-questions`,
  `journaling-prompts`, `parallel-texts`), orphan (`big-fonts`).
- **CI: path-based PR labeler** (`1baeeda`).

### Changed
- `SearchInput` forwards refs to its underlying `<input>` so consumers
  can focus programmatically.

### Fixed
- **Viewport scrollbars on mobile** ([PR #16](https://github.com/tweakch/webreader/pull/16)).
  Switch the animation wrapper to `fixed inset-0` and drop `h-screen`
  from `AppLayout`, so mobile's 100vh-with-no-URL-bar no longer grows
  the document beyond the visible area. Added
  `tests/viewport-no-scroll.spec.js` covering mobile/tablet/desktop/
  tiny sizes, with and without the lock-screen flag.
- **App-animation wrapper** now always renders and stops mutating the
  DOM on unmount (`3d0cde6`).
- **CI**: use the full 40-char SHA for `actions/upload-artifact`
  (`e4f6ed5`).

## [0.1.1] - 2026-04-18
### Fixed
- `useFeatureFlags`: restore `maxFontSize` mapping to `{off:28, big:28,
  bigger:34, biggest:40}` so the unit-test contract for the `big-fonts`
  string flag holds ([7092b17](https://github.com/tweakch/webreader/commit/7092b17)).

## [0.1.0] - 2026-04-18

### Added
- Initial changelog and SemVer release tagging.
- GitHub Release automation (`.github/workflows/release.yml`) that publishes a
  release for every `v*` tag using the matching CHANGELOG section as the body.
- Vercel Flags discovery endpoint (`api/.well-known/vercel/flags.js`) that
  surfaces the local `flags.json` to the Vercel Toolbar Flags feature, gated by
  the `FLAGS_SECRET` environment variable.
- `npm run release` / `release:minor` / `release:major` scripts that bump
  `package.json`, move `[Unreleased]` into a dated section, and create a tag.
- Expanded debug overlay: a toggleable control panel (enabled by the
  `debug-badges` flag) with sub-features:
  - `data-testid` badges (existing behaviour)
  - FPS meter
  - Viewport size indicator
  - 8 pt layout grid overlay
  - Live feature-flag inspector
  - Build/version info pill
- `data-testid` hooks for the new debug sub-features: `debug-panel`,
  `debug-panel-toggle`, `debug-sub-badges`, `debug-sub-fps`,
  `debug-sub-viewport`, `debug-sub-grid`, `debug-sub-flags`, `debug-sub-version`.

### Changed
- `DebugOverlay` now reads feature flag values and build metadata and persists
  its sub-feature preferences to `localStorage` under `wr-debug-subfeatures`.

[Unreleased]: https://github.com/tweakch/webreader/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/tweakch/webreader/releases/tag/v1.2.0
[0.1.1]: https://github.com/tweakch/webreader/releases/tag/v0.1.1
[0.1.0]: https://github.com/tweakch/webreader/releases/tag/v0.1.0
