import { createContext, useContext } from 'react';

export const ThemeContext = createContext({ dark: false, hc: false });
export const useTheme = () => useContext(ThemeContext);
