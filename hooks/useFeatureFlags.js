import { useState, useEffect } from 'react';
import { useBooleanFlagValue, useStringFlagValue } from '@openfeature/react-sdk';

/**
 * Feature flag management hook.
 * Owns all 15 boolean flags, 2 string flags, the user override layer, and the override function.
 */
export function useFeatureFlags() {
  // Raw flag reads from OpenFeature
  const _rawWordCount = useBooleanFlagValue('word-count', false);
  const _rawReadingDuration = useBooleanFlagValue('reading-duration', false);
  const _rawFontSizeControls = useBooleanFlagValue('font-size-controls', true);
  const _rawEinkFlash = useBooleanFlagValue('eink-flash', true);
  const _rawTapZones = useBooleanFlagValue('tap-zones', true);
  const _rawAdaptionSwitcher = useBooleanFlagValue('adaption-switcher', true);
  const _rawTypographyPanel = useBooleanFlagValue('typography-panel', true);
  const _rawAttribution = useBooleanFlagValue('attribution', true);
  const _rawFavorites = useBooleanFlagValue('favorites', false);
  const _rawFavoritesOnlyToggle = useBooleanFlagValue('favorites-only-toggle', false);
  const _rawAudioPlayer = useBooleanFlagValue('audio-player', false);
  const _rawHighContrastTheme = useBooleanFlagValue('high-contrast-theme', false);
  const _rawSpeedReader = useBooleanFlagValue('speed-reader', false);
  const _rawSpeedreaderOrp = useBooleanFlagValue('speedreader-orp', false);
  const _rawWordBlacklist = useBooleanFlagValue('word-blacklist', false);
  const _rawStoryDirectories = useBooleanFlagValue('story-directories', false);
  const _rawDebugBadges = useBooleanFlagValue('debug-badges', false);

  // User feature overrides — stored in localStorage, take precedence over flag defaults
  const [userFeatureOverrides, setUserFeatureOverrides] = useState(() =>
    JSON.parse(localStorage.getItem('wr-feature-overrides') ?? '{}')
  );

  useEffect(() => {
    localStorage.setItem('wr-feature-overrides', JSON.stringify(userFeatureOverrides));
  }, [userFeatureOverrides]);

  // Override function: if user has overridden a flag, use that; otherwise use raw flag
  const _o = (key, raw) => Object.hasOwn(userFeatureOverrides, key) ? userFeatureOverrides[key] : raw;

  // Resolved show-flags (after applying overrides)
  const showWordCount = _o('word-count', _rawWordCount);
  const showReadingDuration = _o('reading-duration', _rawReadingDuration);
  const showFontSizeControls = _o('font-size-controls', _rawFontSizeControls);
  const showEinkFlash = _o('eink-flash', _rawEinkFlash);
  const showTapZones = _o('tap-zones', _rawTapZones);
  const showAdaptionSwitcher = _o('adaption-switcher', _rawAdaptionSwitcher);
  const showTypographyPanel = _o('typography-panel', _rawTypographyPanel);
  const showAttribution = _o('attribution', _rawAttribution);
  const showFavorites = _o('favorites', _rawFavorites);
  const showFavoritesOnlyToggle = _o('favorites-only-toggle', _rawFavoritesOnlyToggle);
  const showAudioPlayer = _o('audio-player', _rawAudioPlayer);
  const showHighContrastTheme = _o('high-contrast-theme', _rawHighContrastTheme);
  const showSpeedReader = _o('speed-reader', _rawSpeedReader);
  const showSpeedreaderOrp = _o('speedreader-orp', _rawSpeedreaderOrp);
  const showWordBlacklist = _o('word-blacklist', _rawWordBlacklist);
  const showStoryDirectories = _o('story-directories', _rawStoryDirectories);
  const showDebugBadges = _o('debug-badges', _rawDebugBadges);

  // Raw values keyed by feature key — used in profile feature toggles
  const _rawFlagValues = {
    'word-count': _rawWordCount,
    'reading-duration': _rawReadingDuration,
    'font-size-controls': _rawFontSizeControls,
    'eink-flash': _rawEinkFlash,
    'tap-zones': _rawTapZones,
    'adaption-switcher': _rawAdaptionSwitcher,
    'typography-panel': _rawTypographyPanel,
    'attribution': _rawAttribution,
    'favorites': _rawFavorites,
    'favorites-only-toggle': _rawFavoritesOnlyToggle,
    'audio-player': _rawAudioPlayer,
    'high-contrast-theme': _rawHighContrastTheme,
    'speed-reader': _rawSpeedReader,
    'speedreader-orp': _rawSpeedreaderOrp,
    'word-blacklist': _rawWordBlacklist,
    'story-directories': _rawStoryDirectories,
    'debug-badges': _rawDebugBadges,
  };

  // String flags
  const flagTheme = useStringFlagValue('theme', 'light');
  const bigFontsVariant = useStringFlagValue('big-fonts', 'off');
  const maxFontSize = { off: 28, big: 28, bigger: 34, biggest: 40 }[bigFontsVariant] ?? 28;

  return {
    showWordCount,
    showReadingDuration,
    showFontSizeControls,
    showEinkFlash,
    showTapZones,
    showAdaptionSwitcher,
    showTypographyPanel,
    showAttribution,
    showFavorites,
    showFavoritesOnlyToggle,
    showAudioPlayer,
    showHighContrastTheme,
    showSpeedReader,
    showSpeedreaderOrp,
    showWordBlacklist,
    showStoryDirectories,
    showDebugBadges,
    _rawFlagValues,
    userFeatureOverrides,
    setUserFeatureOverrides,
    _o,
    flagTheme,
    bigFontsVariant,
    maxFontSize,
  };
}
