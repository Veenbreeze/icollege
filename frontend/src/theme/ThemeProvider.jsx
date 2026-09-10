import { createContext, useContext, useMemo, useState } from 'react';
import { useColorScheme } from 'react-native';
import { colors as liveColors, palettes, setActiveMode } from './colors';

/** User preference: follow the OS, or force light/dark. */

const ThemeContext = createContext(null);
export function ThemeProvider({ children }) {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [preference, setPreference] = useState('system');
  const mode = preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  // Point the module-level proxies at the resolved theme *before* children render.
  setActiveMode(mode);
  const value = useMemo(
    () => ({
      colors: palettes[mode],
      mode,
      preference,
      isDark: mode === 'dark',
      setPreference,
      toggle: () => setPreference(mode === 'dark' ? 'light' : 'dark'),
    }),
    [mode, preference],
  );

  // `key={mode}` remounts the subtree when the theme flips so every screen
  // re-reads the themed style/colors proxies.
  return (
    <ThemeContext.Provider value={value} key={mode}>
      {children}
    </ThemeContext.Provider>
  );
}
export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (ctx) return ctx;
  // Fallback (e.g. component rendered outside provider) — use live proxy.
  return {
    colors: liveColors,
    mode: 'light',
    preference: 'system',
    isDark: false,
    setPreference: () => {},
    toggle: () => {},
  };
}
