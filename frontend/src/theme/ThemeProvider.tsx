import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import {
  colors as liveColors,
  palettes,
  setActiveMode,
  type ThemeColors,
  type ThemeMode,
} from './colors';

/** User preference: follow the OS, or force light/dark. */
export type ThemePreference = 'system' | 'light' | 'dark';

type ThemeContextValue = {
  colors: ThemeColors;
  mode: ThemeMode; // resolved (light | dark)
  preference: ThemePreference; // system | light | dark
  isDark: boolean;
  setPreference: (p: ThemePreference) => void;
  toggle: () => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const system = useColorScheme(); // 'light' | 'dark' | null
  const [preference, setPreference] = useState<ThemePreference>('system');

  const mode: ThemeMode =
    preference === 'system' ? (system === 'dark' ? 'dark' : 'light') : preference;

  // Point the module-level proxies at the resolved theme *before* children render.
  setActiveMode(mode);

  const value = useMemo<ThemeContextValue>(
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

export function useTheme(): ThemeContextValue {
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
