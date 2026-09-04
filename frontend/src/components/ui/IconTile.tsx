import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing , themedStyles } from '@/theme';

type Props = {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  color: string;
  soft: string;
  badge?: boolean;
  onPress?: () => void;
};

/** Rounded-square tinted icon with a label underneath (quick-action grid). */
export function IconTile({ label, icon, color, soft, badge, onPress }: Props) {
  return (
    <Pressable style={styles.wrap} onPress={onPress} hitSlop={6}>
      <View style={[styles.tile, { backgroundColor: soft }]}>
        <Ionicons name={icon} size={24} color={color} />
        {badge && <View style={styles.badge} />}
      </View>
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = themedStyles((colors) => ({
  wrap: { alignItems: 'center', width: 64 },
  tile: {
    width: 54,
    height: 54,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xs,
  },
  badge: {
    position: 'absolute',
    top: 6,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.red,
  },
  label: { fontSize: 11.5, color: colors.textSecondary, fontWeight: '500' },
}));
