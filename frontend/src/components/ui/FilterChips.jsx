import { ScrollView, Text, Pressable } from 'react-native';
import { colors, radii, spacing, shadow, themedStyles } from '@/theme';
/** Horizontal row of active/inactive text chips — used by every screen with
 * a category or type filter (exams, notices, career, ...). */
export function FilterChips({ options, value, onChange, style }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[styles.row, style]}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <Pressable
            key={opt}
            style={[styles.chip, active ? styles.chipOn : styles.chipOff]}
            onPress={() => onChange(opt)}
          >
            <Text
              style={[
                styles.chipText,
                active && {
                  color: colors.white,
                },
              ]}
            >
              {opt}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
const styles = themedStyles((colors) => ({
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
  },
  chipOn: {
    backgroundColor: colors.primary,
  },
  chipOff: {
    backgroundColor: colors.surface,
    ...shadow.soft,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
}));
