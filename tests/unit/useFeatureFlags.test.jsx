import { renderHook, act } from '@testing-library/react';

const mockBoolean = vi.fn();
const mockString = vi.fn();

vi.mock('@openfeature/react-sdk', () => ({
  useBooleanFlagValue: (key, fallback) => mockBoolean(key, fallback),
  useStringFlagValue: (key, fallback) => mockString(key, fallback),
}));

import { useFeatureFlags } from '../../hooks/useFeatureFlags';

const boolDefaults = {
  'word-count': false,
  'reading-duration': false,
  'font-size-controls': true,
  'pinch-font-size': false,
  'eink-flash': true,
  'tap-zones': true,
  'adaption-switcher': true,
  'typography-panel': true,
  'attribution': true,
  'favorites': false,
  'favorites-only-toggle': false,
  'audio-player': false,
  'high-contrast-theme': false,
  'speed-reader': false,
  'speedreader-orp': false,
  'word-blacklist': false,
  'story-directories': false,
  'debug-badges': false,
};

describe('useFeatureFlags', () => {
  beforeEach(() => {
    mockBoolean.mockImplementation((key, fallback) => boolDefaults[key] ?? fallback);
    mockString.mockImplementation((key, fallback) => {
      if (key === 'theme') return 'light';
      if (key === 'big-fonts') return 'off';
      return fallback;
    });
  });

  it('uses raw values when no user override exists', () => {
    const { result } = renderHook(() => useFeatureFlags());
    expect(result.current.showFontSizeControls).toBe(true);
    expect(result.current.showFavorites).toBe(false);
  });

  it('applies user overrides over raw flag values', () => {
    localStorage.setItem('wr-feature-overrides', JSON.stringify({ favorites: true }));
    const { result } = renderHook(() => useFeatureFlags());
    expect(result.current.showFavorites).toBe(true);
  });

  it('persists updated overrides to localStorage', () => {
    const { result } = renderHook(() => useFeatureFlags());
    act(() => {
      result.current.setUserFeatureOverrides({ 'word-count': true });
    });
    const stored = JSON.parse(localStorage.getItem('wr-feature-overrides'));
    expect(stored['word-count']).toBe(true);
  });

  it('derives maxFontSize from big-fonts string flag', () => {
    mockString.mockImplementation((key, fallback) => {
      if (key === 'theme') return 'dark';
      if (key === 'big-fonts') return 'biggest';
      return fallback;
    });
    const { result } = renderHook(() => useFeatureFlags());
    expect(result.current.maxFontSize).toBe(40);
    expect(result.current.flagTheme).toBe('dark');
  });
});
