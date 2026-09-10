import { useWindowDimensions } from 'react-native';

const BASE_WIDTH = 375;
const TABLET_BREAKPOINT = 768;

/** Clamped linear scale from a 375pt baseline — keeps text/spacing from
 * over-growing on tablets while still nudging up a little for larger phones. */
function scaleFor(width) {
  const ratio = Math.min(Math.max(width, 320), TABLET_BREAKPOINT) / BASE_WIDTH;
  return (size) => Math.round(size * Math.min(Math.max(ratio, 0.92), 1.15));
}

/** Screen width/height plus a tablet flag and a `scale()` helper for
 * fixed px sizes that would otherwise leave large gutters on wide screens. */
export function useResponsive() {
  const { width, height } = useWindowDimensions();
  const isTablet = width >= TABLET_BREAKPOINT;
  return { width, height, isTablet, scale: scaleFor(width) };
}
