import { Pressable, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, radii, shadow, spacing, themedStyles } from '@/theme';
import { resolveAccent } from '@/lib/colorKey';
import { metaFor } from '@/lib/notifications/meta';
import { useNotifications } from '@/lib/notifications/NotificationsContext';

/** Slides in a brief popup over the current screen when a new like/comment/share/upload notification arrives. */
export function NotificationToast() {
  const { toast, dismissToast, markRead } = useNotifications();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  if (!toast) return null;

  const { icon, colorKey } = metaFor(toast.type);
  const { color, soft } = resolveAccent(colorKey);

  const onPress = () => {
    markRead(toast.id);
    dismissToast();
    router.push('/notifications');
  };

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { top: insets.top + spacing.sm }]}>
      <Pressable style={styles.toast} onPress={onPress}>
        <View style={[styles.icon, { backgroundColor: soft }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <View style={styles.textWrap}>
          <Text style={styles.title} numberOfLines={1}>
            {toast.actor ?? 'Someone'}
          </Text>
          <Text style={styles.body} numberOfLines={1}>
            {toast.message}
          </Text>
        </View>
        <Pressable hitSlop={8} onPress={dismissToast}>
          <Ionicons name="close" size={16} color={colors.textMuted} />
        </Pressable>
      </Pressable>
    </View>
  );
}

const styles = themedStyles((colors) => ({
  wrap: {
    position: 'absolute',
    left: spacing.lg,
    right: spacing.lg,
    zIndex: 999,
  },
  toast: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    ...shadow.card,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textWrap: {
    flex: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  body: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
}));
