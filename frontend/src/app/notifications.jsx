import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Avatar } from '@/components/ui/Avatar';
import { resolveAccent } from '@/lib/colorKey';
import { timeAgo } from '@/lib/timeAgo';
import { metaFor } from '@/lib/notifications/meta';
import { useNotifications } from '@/lib/notifications/NotificationsContext';
import { initialsOf } from '@/lib/initials';

function targetRoute(n) {
  if (n.targetType === 'post') return `/post/${n.targetId}`;
  if (n.targetType === 'reel' || n.targetType === 'story') return '/reels';
  return null;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { notifications, unreadCount, markRead, markAllRead, refetch } = useNotifications();
  const isLoading = false;

  const onOpen = async (n) => {
    if (!n.read) await markRead(n.id);
    const route = targetRoute(n);
    if (route) router.push(route);
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Activity"
        subtitle={`${unreadCount} unread`}
        titleSize={22}
        right={
          <Pressable style={styles.markBtn} onPress={markAllRead} disabled={unreadCount === 0}>
            <Ionicons name="checkmark-done-outline" size={18} color={colors.primary} />
          </Pressable>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={undefined}
        contentContainerStyle={{ paddingBottom: 40 }}
        onScrollBeginDrag={refetch}
      >
        {isLoading && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.lg }} />}
        {!isLoading && notifications.length === 0 && (
          <Text style={styles.emptyText}>No activity yet — likes, comments and shares on your posts will show up here.</Text>
        )}
        {notifications.map((n) => (
          <NotificationCard key={n.id} notification={n} onPress={() => onOpen(n)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function NotificationCard({ notification, onPress }) {
  const { icon, colorKey } = metaFor(notification.type);
  const { color, soft } = resolveAccent(colorKey);
  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.card, !notification.read && styles.cardUnread]}>
        <Avatar initials={notification.initials ?? initialsOf(notification.actor ?? '?')} size={40} />
        <View style={{ flex: 1 }}>
          <Text style={styles.cardText}>
            <Text style={styles.actor}>{notification.actor ?? 'Someone'}</Text> {notification.message}
          </Text>
          <Text style={styles.time}>{timeAgo(notification.time)}</Text>
        </View>
        <View style={[styles.icon, { backgroundColor: soft }]}>
          <Ionicons name={icon} size={16} color={color} />
        </View>
        {!notification.read && <View style={styles.unreadDot} />}
      </Card>
    </Pressable>
  );
}

const styles = themedStyles((colors) => ({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  markBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    marginHorizontal: spacing.xl,
    lineHeight: 19,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  cardText: {
    fontSize: 13.5,
    color: colors.text,
    lineHeight: 19,
  },
  actor: {
    fontWeight: '700',
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unreadDot: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
}));
