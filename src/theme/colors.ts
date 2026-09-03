import { StyleSheet } from 'react-native';

/**
 * iCollege design system — now theme-aware (light + dark).
 *
 * Brand + accent hues stay constant across themes; only the neutrals
 * (backgrounds, surfaces, text, borders) swap. `colors` is a live proxy
 * that resolves to the active theme, and `themedStyles` builds a
 * StyleSheet per theme on demand — so screens stay declarative.
 */

export type ThemeMode = 'light' | 'dark';

/* Brand + accents — identical in both themes. */
const accents = {
  primary: '#6C4CE0',
  primaryDark: '#5638C4',
  primaryLight: '#8B6DF0',
  primarySoft: '#EFEBFB',

  blue: '#2F80ED',
  blueSoft: '#E7F0FD',
  green: '#27AE60',
  greenSoft: '#E4F6EC',
  orange: '#F2994A',
  orangeSoft: '#FDEEDF',
  red: '#EB5757',
  redSoft: '#FDE7E7',
  yellow: '#F2C94C',
  yellowSoft: '#FCF4DA',

  white: '#FFFFFF',
};

export const lightColors = {
  ...accents,
  bg: '#F6F6FB',
  surface: '#FFFFFF',
  surfaceMuted: '#F1F1F6',
  border: '#ECECF2',
  text: '#1A1A2E',
  textSecondary: '#5A5A72',
  textMuted: '#9A9AAE',
};

export const darkColors: typeof lightColors = {
  ...accents,
  bg: '#0E0E15',
  surface: '#1A1A24',
  surfaceMuted: '#24242F',
  border: '#2E2E3B',
  text: '#F2F2F7',
  textSecondary: '#B4B4C4',
  textMuted: '#84849A',
};

export type ThemeColors = typeof lightColors;

/* ---- active theme (module-level, read by the proxies) ------------ */

let activeMode: ThemeMode = 'light';

export const palettes: Record<ThemeMode, ThemeColors> = { light: lightColors, dark: darkColors };

export function setActiveMode(mode: ThemeMode) {
  activeMode = mode;
}
export function getActiveMode(): ThemeMode {
  return activeMode;
}

/** Live palette — `colors.bg` always resolves to the active theme. */
export const colors: ThemeColors = new Proxy(lightColors, {
  get(_target, key: string) {
    return (palettes[activeMode] as any)[key];
  },
}) as ThemeColors;

/* ---- themed stylesheets ----------------------------------------- */

const styleCache = new WeakMap<object, Partial<Record<ThemeMode, any>>>();

/**
 * Like `StyleSheet.create`, but the factory receives the active theme's
 * colors and results are cached per theme. Returns a proxy so `styles.x`
 * resolves against whichever theme is active at render time.
 */
export function themedStyles<T extends StyleSheet.NamedStyles<T> | StyleSheet.NamedStyles<any>>(
  factory: (colors: ThemeColors) => T & StyleSheet.NamedStyles<any>,
): T {
  return new Proxy({} as T, {
    get(_target, key: string) {
      let cache = styleCache.get(factory);
      if (!cache) {
        cache = {};
        styleCache.set(factory, cache);
      }
      if (!cache[activeMode]) {
        cache[activeMode] = StyleSheet.create(factory(palettes[activeMode]));
      }
      return (cache[activeMode] as any)[key];
    },
  });
}

/* ---- static tokens ---------------------------------------------- */

/** Per-chamber theming. Chambers are color-coded (see mockups). */
export const chamberThemes: Record<string, { color: string; soft: string }> = {
  education: { color: '#6C4CE0', soft: '#EFEBFB' },
  economics: { color: '#219653', soft: '#E4F6EC' },
  finance: { color: '#2F80ED', soft: '#E7F0FD' },
  social: { color: '#EB5F8A', soft: '#FCE7EE' },
  music: { color: '#F2994A', soft: '#FDEEDF' },
  technology: { color: '#2D9CDB', soft: '#E4F2FB' },
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const radii = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  pill: 999,
};

/** Font sizes/weights only — apply a themed color where used. */
export const typography = {
  h1: { fontSize: 26, fontWeight: '800' as const },
  h2: { fontSize: 20, fontWeight: '700' as const },
  h3: { fontSize: 17, fontWeight: '700' as const },
  title: { fontSize: 16, fontWeight: '700' as const },
  body: { fontSize: 14, fontWeight: '400' as const },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label: { fontSize: 13, fontWeight: '600' as const },
};

export const shadow = {
  card: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 3,
  },
  soft: {
    shadowColor: '#1A1A2E',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
};
