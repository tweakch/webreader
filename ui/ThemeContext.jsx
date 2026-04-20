import { createContext, useCallback, useContext, useMemo } from 'react';

export const ThemeContext = createContext({ dark: false, hc: false });

export const useTheme = () => {
  const { dark, hc } = useContext(ThemeContext);
  /**
   * Pick a class string for the current theme.
   * Fallback chain: hcDark → dark, hcLight → light.
   * Omit a key to inherit the fallback automatically.
   *
   * `tc` is memoized per `{dark, hc}` so consumers can safely use it as a
   * useMemo/useCallback dependency without triggering render loops.
   */
  const tc = useCallback(({ light, dark: d, hcLight, hcDark } = {}) => {
    if (hc && dark) return hcDark ?? d ?? light;
    if (hc)         return hcLight ?? light;
    if (dark)       return d ?? light;
    return light;
  }, [dark, hc]);
  return useMemo(() => ({ dark, hc, tc }), [dark, hc, tc]);
};
