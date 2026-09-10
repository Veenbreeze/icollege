import { View, Text, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, spacing, themedStyles } from '@/theme';
/** Back arrow + title/subtitle + optional right-side action(s) — the header
 * shape shared by nearly every secondary screen in the app. */
export function ScreenHeader({ title, subtitle, onBack, right, titleSize = 24 }) {
  const router = useRouter();
  return (
    <View style={styles.header}>
      <Pressable onPress={onBack ?? (() => router.back())} hitSlop={8}>
        <Ionicons name="arrow-back" size={24} color={colors.text} />
      </Pressable>
      <View
        style={{
          flex: 1,
          marginLeft: spacing.md,
        }}
      >
        <Text
          style={[
            styles.title,
            {
              fontSize: titleSize,
            },
          ]}
        >
          {title}
        </Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {right}
    </View>
  );
}
const styles = themedStyles((colors) => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  title: {
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 1,
  },
}));
