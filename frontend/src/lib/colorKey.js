import { colors } from '@/theme';

/**
 * The backend stores accent hues as portable keys (e.g. "primary", "blue")
 * rather than hex values, so light/dark theming stays a frontend concern.
 * This resolves a key to its { color, soft } pair from the active theme.
 */
export function resolveAccent(colorKey) {
  const key = colorKey ?? 'primary';
  const softKey = `${key}Soft`;
  return {
    color: colors[key] ?? colors.primary,
    soft: colors[softKey] ?? colors.primarySoft,
  };
}
