# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

Release tags are named `vX.Y.Z`. When a tag is pushed, CI publishes a GitHub
Release populated from the matching section below.

## [Unreleased]

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

[Unreleased]: https://github.com/tweakch/webreader/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/tweakch/webreader/releases/tag/v0.1.1
[0.1.0]: https://github.com/tweakch/webreader/releases/tag/v0.1.0
