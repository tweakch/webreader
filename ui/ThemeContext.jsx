import { createContext, useContext } from 'react';

export const ThemeContext = createContext({ dark: false, hc: false });

export const useTheme = () => {
  const { dark, hc } = useContext(ThemeContext);
  /**
   * Pick a class string for the current theme.
   * Fallback chain: hcDark → dark, hcLight → light.
   * Omit a key to inherit the fallback automatically.
   */
  const tc = ({ light, dark: d, hcLight, hcDark } = {}) => {
    if (hc && dark) return hcDark ?? d ?? light;
    if (hc)         return hcLight ?? light;
    if (dark)       return d ?? light;
    return light;
  };
  return { dark, hc, tc };
};
