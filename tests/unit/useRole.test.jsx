import { renderHook, act } from '@testing-library/react';
import { useRole } from '../../hooks/useRole';
import { FEATURES } from '../../features';

describe('useRole', () => {
  it('defaults to guest role', () => {
    const { result } = renderHook(() => useRole());
    expect(result.current.role).toBe('guest');
    expect(result.current.isAdmin).toBe(false);
  });

  it('persists role updates to localStorage', () => {
    const { result } = renderHook(() => useRole());
    act(() => result.current.setRole('tester'));
    expect(localStorage.getItem('wr-role')).toBe('tester');
  });

  it('admin sees all feature keys', () => {
    const { result } = renderHook(() => useRole());
    act(() => result.current.setRole('admin'));
    const expected = FEATURES.map((f) => f.key).sort();
    const actual = [...result.current.visibleFeatureKeys].sort();
    expect(actual).toEqual(expected);
  });

  it('can toggle role feature assignments and query assignment status', () => {
    const { result } = renderHook(() => useRole());
    expect(result.current.isFeatureAssignedToRole('favorites', 'guest')).toBe(false);

    act(() => result.current.toggleFeatureForRole('favorites', 'guest'));
    expect(result.current.isFeatureAssignedToRole('favorites', 'guest')).toBe(true);

    act(() => result.current.toggleFeatureForRole('favorites', 'guest'));
    expect(result.current.isFeatureAssignedToRole('favorites', 'guest')).toBe(false);
  });
});
