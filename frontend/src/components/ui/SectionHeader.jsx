import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography, themedStyles } from '@/theme';
export function SectionHeader({ title, action, actionColor = colors.primary, onAction }) {
  return (
    <View style={styles.row}>
      <Text
        style={[
          typography.h3,
          {
            color: colors.text,
          },
        ]}
      >
        {title}
      </Text>
      {action && (
        <Pressable style={styles.action} onPress={onAction} hitSlop={8}>
          <Text
            style={[
              styles.actionText,
              {
                color: actionColor,
              },
            ]}
          >
            {action}
          </Text>
          <Ionicons name="chevron-forward" size={15} color={actionColor} />
        </Pressable>
      )}
    </View>
  );
}
const styles = themedStyles((colors) => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  action: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionText: {
    fontSize: 13,
    fontWeight: '600',
    marginRight: 2,
  },
}));
