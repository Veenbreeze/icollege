import { radii, spacing, themedStyles } from '@/theme';
import { ClaySurface } from './ClaySurface';
export function Card({ style, children, ...rest }) {
  return (
    <ClaySurface radius={radii.xl} style={[styles.card, style]} {...rest}>
      {children}
    </ClaySurface>
  );
}
const styles = themedStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
  },
}));
