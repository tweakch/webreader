import { useFeatureFlags } from './useFeatureFlags';

const CHILD_PROFILE_MIN_MAX_FONT_SIZE = 34;

/**
 * App-level feature-flag view. Wraps `useFeatureFlags` and applies the
 * child-profile umbrella: when `show-child-profile` is on it forces
 * simplified UI, illustrations, the age filter, and a larger minimum
 * for `maxFontSize` on top of whatever the individual flags resolve to.
 *
 * Returns the same shape as `useFeatureFlags` with `showSimplifiedUi`,
 * `showIllustrations`, and `maxFontSize` overridden, plus a derived
 * `ageFilterActive` boolean.
 *
 * @param {object} [opts] forwarded to `useFeatureFlags`
 * @returns {object} feature-flag snapshot with umbrella applied
 */
export function useAppFeatureFlags(opts) {
  const flags = useFeatureFlags(opts);
  const {
    showChildProfile,
    showSimplifiedUi: rawShowSimplifiedUi,
    showIllustrations: rawShowIllustrations,
    showAgeFilter,
    maxFontSize: rawMaxFontSize,
  } = flags;

  return {
    ...flags,
    showSimplifiedUi: rawShowSimplifiedUi || showChildProfile,
    showIllustrations: rawShowIllustrations || showChildProfile,
    ageFilterActive: showAgeFilter || showChildProfile,
    maxFontSize:
      showChildProfile && rawMaxFontSize < CHILD_PROFILE_MIN_MAX_FONT_SIZE
        ? CHILD_PROFILE_MIN_MAX_FONT_SIZE
        : rawMaxFontSize,
  };
}
