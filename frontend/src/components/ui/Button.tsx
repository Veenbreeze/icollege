import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing , themedStyles } from '@/theme';

type Props = {
  label: string;
  onPress?: () => void;
  variant?: 'primary' | 'outline' | 'soft';
  icon?: keyof typeof Ionicons.glyphMap;
  color?: string;
  style?: ViewStyle;
};

export function Button({ label, onPress, variant = 'primary', icon, color = colors.primary, style }: Props) {
  const isPrimary = variant === 'primary';
  const isOutline = variant === 'outline';

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary && { backgroundColor: color },
        isOutline && { borderWidth: 1.5, borderColor: colors.border, backgroundColor: colors.surface },
        variant === 'soft' && { backgroundColor: colors.primarySoft },
        pressed && { opacity: 0.85 },
        style,
      ]}
    >
      {icon && (
        <Ionicons
          name={icon}
          size={18}
          color={isPrimary ? colors.white : color}
          style={{ marginRight: 8 }}
        />
      )}
      <Text style={[styles.label, { color: isPrimary ? colors.white : isOutline ? colors.text : color }]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = themedStyles((colors) => ({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    borderRadius: radii.md,
    paddingHorizontal: spacing.lg,
  },
  label: { fontSize: 15, fontWeight: '700' },
}));
