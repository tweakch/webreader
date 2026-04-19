import { renderHook } from '@testing-library/react';

const mockBoolean = vi.fn();
const mockString = vi.fn();

vi.mock('@openfeature/react-sdk', () => ({
  useBooleanFlagValue: (key, fallback) => mockBoolean(key, fallback),
  useStringFlagValue: (key, fallback) => mockString(key, fallback),
}));

import { useFeatureFlags } from '../../hooks/useFeatureFlags';

describe('useFeatureFlags release mode', () => {
  beforeEach(() => {
    mockBoolean.mockImplementation((_key, fallback) => {
      if (fallback === true) return true;
      return true;
    });
    mockString.mockImplementation((key, fallback) => {
      if (key === 'theme') return 'light';
      if (key === 'big-fonts') return 'off';
      return fallback;
    });
  });

  it('released-only mode forces non-released flags off for non-privileged roles', () => {
    const { result } = renderHook(() =>
      useFeatureFlags({ releaseMode: 'released-only', role: 'guest' }),
    );
    // speed-reader is beta → gated off
    expect(result.current.showSpeedReader).toBe(false);
    // debug-badges is experimental → gated off
    expect(result.current.showDebugBadges).toBe(false);
    // favorites is released → unaffected
    expect(result.current.showFavorites).toBe(true);
  });

  it('released-only mode lets tester bypass the gate', () => {
    const { result } = renderHook(() =>
      useFeatureFlags({ releaseMode: 'released-only', role: 'tester' }),
    );
    expect(result.current.showSpeedReader).toBe(true);
    expect(result.current.showDebugBadges).toBe(true);
  });

  it('released-only mode lets admin bypass the gate', () => {
    const { result } = renderHook(() =>
      useFeatureFlags({ releaseMode: 'released-only', role: 'admin' }),
    );
    expect(result.current.showSpeedReader).toBe(true);
    expect(result.current.showErrorPageSimulator).toBe(true);
  });

  it('default releaseMode=all leaves raw flags untouched', () => {
    const { result } = renderHook(() => useFeatureFlags());
    // speed-reader raw=true, no gate → stays true
    expect(result.current.showSpeedReader).toBe(true);
    expect(result.current.showDebugBadges).toBe(true);
  });
});
