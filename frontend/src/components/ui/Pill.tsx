import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { radii, spacing , themedStyles } from '@/theme';

type Props = {
  label: string;
  color: string;
  soft: string;
  icon?: keyof typeof Ionicons.glyphMap;
  dot?: boolean;
};

/** Soft-background status pill (Completed / Current / Upcoming, etc.). */
export function Pill({ label, color, soft, icon, dot }: Props) {
  return (
    <View style={[styles.pill, { backgroundColor: soft }]}>
      {dot && <View style={[styles.dot, { backgroundColor: color }]} />}
      {icon && <Ionicons name={icon} size={13} color={color} style={{ marginRight: 4 }} />}
      <Text style={[styles.label, { color }]}>{label}</Text>
    </View>
  );
}

const styles = themedStyles((colors) => ({
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: 5,
    borderRadius: radii.pill,
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginRight: 6 },
  label: { fontSize: 12, fontWeight: '600' },
}));
