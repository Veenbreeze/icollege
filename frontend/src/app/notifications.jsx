import { useRouter } from 'expo-router';
import { View, Text, ScrollView, Pressable, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApi } from '@/hooks/useApi';
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '@/lib/api/notifications';
import { timeAgo } from '@/lib/timeAgo';

const TYPE_META = {
  notice: { icon: 'megaphone', color: colors.primary, soft: colors.primarySoft },
  lecture: { icon: 'calendar', color: colors.orange, soft: colors.orangeSoft },
  general: { icon: 'notifications', color: colors.blue, soft: colors.blueSoft },
};

function metaFor(type) {
  return TYPE_META[type] ?? TYPE_META.general;
}

export default function NotificationsScreen() {
  const router = useRouter();
  const { data, isLoading, refetch } = useApi(fetchNotifications);
  const items = Array.isArray(data) ? data : [];
  const unread = items.filter((n) => !n.read);

  async function onOpen(n) {
    if (!n.read) {
      await markNotificationRead(n.id).catch(() => {});
      refetch();
    }
    if (n.deepLink) router.push(n.deepLink);
  }

  async function onMarkAll() {
    if (unread.length === 0) return;
    await markAllNotificationsRead().catch(() => {});
    refetch();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Notifications"
        subtitle={unread.length > 0 ? `${unread.length} unread` : 'All caught up'}
        titleSize={22}
        right={
          <Pressable style={styles.markBtn} onPress={onMarkAll} disabled={unread.length === 0} hitSlop={6}>
            <Ionicons name="checkmark-done-outline" size={18} color={unread.length ? colors.primary : colors.textMuted} />
          </Pressable>
        }
      />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={false} onRefresh={refetch} tintColor={colors.primary} />}
      >
        {isLoading ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : items.length === 0 ? (
          <View style={styles.emptyWrap}>
            <View style={styles.emptyIcon}>
              <Ionicons name="notifications-off-outline" size={30} color={colors.primary} />
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptyBody}>
              Alerts about notices, cancelled lectures and campus updates will show up here.
            </Text>
          </View>
        ) : (
          items.map((n) => {
            const meta = metaFor(n.type);
            return (
              <Pressable key={n.id} onPress={() => onOpen(n)}>
                <Card style={[styles.row, !n.read && styles.rowUnread]}>
                  <View style={[styles.iconWrap, { backgroundColor: meta.soft }]}>
                    <Ionicons name={meta.icon} size={20} color={meta.color} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.rowTitle} numberOfLines={2}>{n.title}</Text>
                    {n.body ? <Text style={styles.rowBody} numberOfLines={3}>{n.body}</Text> : null}
                    <Text style={styles.rowTime}>{timeAgo(n.createdAt)}</Text>
                  </View>
                  {!n.read && <View style={styles.unreadDot} />}
                </Card>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 120 },
  markBtn: {
    width: 38, height: 38, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center',
    backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border,
  },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md, marginBottom: spacing.md },
  rowUnread: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  iconWrap: { width: 42, height: 42, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  rowTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  rowBody: { fontSize: 12.5, color: colors.textSecondary, marginTop: 2, lineHeight: 18 },
  rowTime: { fontSize: 11.5, color: colors.textMuted, marginTop: 6 },
  unreadDot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary, marginTop: 4 },

  emptyWrap: { alignItems: 'center', marginTop: spacing.xxl, paddingHorizontal: spacing.xl },
  emptyIcon: { width: 64, height: 64, borderRadius: radii.xl, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  emptyTitle: { fontSize: 17, fontWeight: '800', color: colors.text, marginBottom: spacing.xs },
  emptyBody: { fontSize: 13.5, color: colors.textSecondary, textAlign: 'center', lineHeight: 20 },
}));
