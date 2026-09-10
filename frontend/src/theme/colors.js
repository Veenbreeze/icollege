import { StyleSheet } from 'react-native';

/**
 * iCollege design system — now theme-aware (light + dark).
 *
 * Brand + accent hues stay constant across themes; only the neutrals
 * (backgrounds, surfaces, text, borders) swap. `colors` is a live proxy
 * that resolves to the active theme, and `themedStyles` builds a
 * StyleSheet per theme on demand — so screens stay declarative.
 */

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
  // Bezel-like frame the whole app sits inset within — deliberately the same
  // in both themes so it reads as the "device edge", not a themed surface.
  shell: '#101018',
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
  // Claymorphism: a light-side highlight gradient laid over a surface to
  // fake the dual-tone shadow CSS gets for free — RN only supports one
  // native shadow per view, so the "light" side is painted, not shadowed.
  clayHighlightFrom: 'rgba(255,255,255,0.75)',
  clayHighlightTo: 'rgba(255,255,255,0)',
};
export const darkColors = {
  ...accents,
  // Kept noticeably lighter than a typical near-black dark theme so text
  // and card boundaries stay easy to read.
  bg: '#1E1E27',
  surface: '#2A2A38',
  surfaceMuted: '#353545',
  border: '#47475A',
  text: '#F7F7FC',
  textSecondary: '#D0D0DE',
  textMuted: '#A0A0B5',
  clayHighlightFrom: 'rgba(255,255,255,0.14)',
  clayHighlightTo: 'rgba(255,255,255,0)',
};
/* ---- active theme (module-level, read by the proxies) ------------ */

let activeMode = 'light';
export const palettes = {
  light: lightColors,
  dark: darkColors,
};
export function setActiveMode(mode) {
  activeMode = mode;
}
export function getActiveMode() {
  return activeMode;
}

/** Live palette — `colors.bg` always resolves to the active theme. */
export const colors = new Proxy(lightColors, {
  get(_target, key) {
    return palettes[activeMode][key];
  },
});

/* ---- themed stylesheets ----------------------------------------- */

const styleCache = new WeakMap();

/**
 * Like `StyleSheet.create`, but the factory receives the active theme's
 * colors and results are cached per theme. Returns a proxy so `styles.x`
 * resolves against whichever theme is active at render time.
 */
export function themedStyles(factory) {
  return new Proxy(
    {},
    {
      get(_target, key) {
        let cache = styleCache.get(factory);
        if (!cache) {
          cache = {};
          styleCache.set(factory, cache);
        }
        if (!cache[activeMode]) {
          cache[activeMode] = StyleSheet.create(factory(palettes[activeMode]));
        }
        return cache[activeMode][key];
      },
    },
  );
}

/* ---- static tokens ---------------------------------------------- */

/** Per-chamber theming. Chambers are color-coded (see mockups). */
export const chamberThemes = {
  education: {
    color: '#6C4CE0',
    soft: '#EFEBFB',
  },
  economics: {
    color: '#219653',
    soft: '#E4F6EC',
  },
  finance: {
    color: '#2F80ED',
    soft: '#E7F0FD',
  },
  social: {
    color: '#EB5F8A',
    soft: '#FCE7EE',
  },
  music: {
    color: '#F2994A',
    soft: '#FDEEDF',
  },
  technology: {
    color: '#2D9CDB',
    soft: '#E4F2FB',
  },
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
  xl: 22,
  xxl: 30,
  pill: 999,
};

/** Font sizes/weights only — apply a themed color where used. */
export const typography = {
  h1: {
    fontSize: 26,
    fontWeight: '800',
  },
  h2: {
    fontSize: 20,
    fontWeight: '700',
  },
  h3: {
    fontSize: 17,
    fontWeight: '700',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
  },
  body: {
    fontSize: 14,
    fontWeight: '400',
  },
  caption: {
    fontSize: 12,
    fontWeight: '400',
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
  },
};

/**
 * Claymorphism shadow tokens. `clay` is the puffy "resting" look (larger,
 * softer, more offset than the old flat card shadow); `clayPressed` reads
 * as pushed-in for tactile press feedback. `card`/`soft` stay as the names
 * every existing screen already imports, now aliased onto the clay
 * defaults so the new look applies everywhere with zero per-screen edits.
 */
const clay = {
  shadowColor: '#1A1A2E',
  shadowOffset: {
    width: 0,
    height: 10,
  },
  shadowOpacity: 0.16,
  shadowRadius: 22,
  elevation: 8,
};
const claySoft = {
  shadowColor: '#1A1A2E',
  shadowOffset: {
    width: 0,
    height: 6,
  },
  shadowOpacity: 0.1,
  shadowRadius: 14,
  elevation: 4,
};
const clayPressed = {
  shadowColor: '#1A1A2E',
  shadowOffset: {
    width: 0,
    height: 3,
  },
  shadowOpacity: 0.08,
  shadowRadius: 8,
  elevation: 2,
};
export const shadow = {
  clay,
  claySoft,
  clayPressed,
  card: clay,
  soft: claySoft,
};
