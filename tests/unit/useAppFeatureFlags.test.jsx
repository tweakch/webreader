import { renderHook } from '@testing-library/react';

const mockBoolean = vi.fn();
const mockString = vi.fn();

vi.mock('@openfeature/react-sdk', () => ({
  useBooleanFlagValue: (key, fallback) => mockBoolean(key, fallback),
  useStringFlagValue: (key, fallback) => mockString(key, fallback),
}));

import { useAppFeatureFlags } from '../../hooks/useAppFeatureFlags';

function mockFlags({ childProfile = false, simplifiedUi = false, illustrations = false, ageFilter = false, bigFonts = 'off' } = {}) {
  mockBoolean.mockImplementation((key, fallback) => {
    if (key === 'child-profile') return childProfile;
    if (key === 'simplified-ui') return simplifiedUi;
    if (key === 'illustrations') return illustrations;
    if (key === 'age-filter') return ageFilter;
    return fallback;
  });
  mockString.mockImplementation((key, fallback) => {
    if (key === 'theme') return 'light';
    if (key === 'big-fonts') return bigFonts;
    return fallback;
  });
}

describe('useAppFeatureFlags child-profile umbrella', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('passes through raw values when the umbrella is off', () => {
    mockFlags({ childProfile: false, simplifiedUi: true, illustrations: false, ageFilter: false });
    const { result } = renderHook(() => useAppFeatureFlags());
    expect(result.current.showSimplifiedUi).toBe(true);
    expect(result.current.showIllustrations).toBe(false);
    expect(result.current.ageFilterActive).toBe(false);
  });

  it('forces simplified UI, illustrations and age filter on when the umbrella is on', () => {
    mockFlags({ childProfile: true, simplifiedUi: false, illustrations: false, ageFilter: false });
    const { result } = renderHook(() => useAppFeatureFlags());
    expect(result.current.showSimplifiedUi).toBe(true);
    expect(result.current.showIllustrations).toBe(true);
    expect(result.current.ageFilterActive).toBe(true);
  });

  it('leaves individual flags on when they are already on and the umbrella is off', () => {
    mockFlags({ childProfile: false, simplifiedUi: true, illustrations: true, ageFilter: true });
    const { result } = renderHook(() => useAppFeatureFlags());
    expect(result.current.showSimplifiedUi).toBe(true);
    expect(result.current.showIllustrations).toBe(true);
    expect(result.current.ageFilterActive).toBe(true);
  });

  it('raises maxFontSize to 34 when the umbrella is on and big-fonts would give less', () => {
    mockFlags({ childProfile: true, bigFonts: 'off' });
    const { result } = renderHook(() => useAppFeatureFlags());
    expect(result.current.maxFontSize).toBe(34);
  });

  it('keeps a higher big-fonts maxFontSize when the umbrella is on', () => {
    mockFlags({ childProfile: true, bigFonts: 'biggest' });
    const { result } = renderHook(() => useAppFeatureFlags());
    expect(result.current.maxFontSize).toBe(40);
  });

  it('leaves maxFontSize alone when the umbrella is off', () => {
    mockFlags({ childProfile: false, bigFonts: 'off' });
    const { result } = renderHook(() => useAppFeatureFlags());
    expect(result.current.maxFontSize).toBe(28);
  });
});
