import { View, ViewProps, StyleSheet } from 'react-native';
import { colors, radii, shadow, spacing , themedStyles } from '@/theme';

export function Card({ style, children, ...rest }: ViewProps) {
  return (
    <View style={[styles.card, style]} {...rest}>
      {children}
    </View>
  );
}

const styles = themedStyles((colors) => ({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadow.card,
  },
}));
