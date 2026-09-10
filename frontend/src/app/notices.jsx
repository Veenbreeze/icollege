import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { FilterChips } from '@/components/ui/FilterChips';
import { useApi } from '@/hooks/useApi';
import { fetchNotices, markNoticeRead } from '@/lib/api/academic';
import { resolveAccent } from '@/lib/colorKey';
import { timeAgo } from '@/lib/timeAgo';
import { noticeCategories } from '@/data/mock';
const PRIORITY = {
  Critical: {
    color: colors.red,
    soft: colors.redSoft,
  },
  Important: {
    color: colors.orange,
    soft: colors.orangeSoft,
  },
  Normal: {
    color: colors.blue,
    soft: colors.blueSoft,
  },
};
export default function NoticesScreen() {
  const [cat, setCat] = useState('All');
  const { data: notices, isLoading, refetch } = useApi(fetchNotices);
  const filtered = useMemo(
    () => (cat === 'All' ? (notices ?? []) : (notices ?? []).filter((n) => n.category === cat)),
    [cat, notices],
  );
  const unread = (notices ?? []).filter((n) => !n.read);
  const onMarkAllRead = async () => {
    await Promise.all(unread.map((n) => markNoticeRead(n.id)));
    refetch();
  };
  const onOpenNotice = async (n) => {
    if (!n.read) {
      await markNoticeRead(n.id);
      refetch();
    }
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader
        title="Notices & Alerts"
        subtitle={`${unread.length} unread notifications`}
        titleSize={22}
        right={
          <Pressable style={styles.markBtn} onPress={onMarkAllRead} disabled={unread.length === 0}>
            <Ionicons name="checkmark-done-outline" size={18} color={colors.primary} />
          </Pressable>
        }
      />

      <FilterChips options={noticeCategories} value={cat} onChange={setCat} />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {isLoading && (
          <ActivityIndicator
            color={colors.primary}
            style={{
              marginTop: spacing.lg,
            }}
          />
        )}
        {!isLoading && filtered.length === 0 && <Text style={styles.emptyText}>No notices in this category.</Text>}
        {filtered.map((n) => (
          <NoticeCard key={n.id} notice={n} onPress={() => onOpenNotice(n)} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
function NoticeCard({ notice, onPress }) {
  const p = PRIORITY[notice.priority];
  const { color, soft } = resolveAccent(notice.colorKey);
  return (
    <Pressable onPress={onPress}>
      <Card style={[styles.card, !notice.read && styles.cardUnread]}>
        <View
          style={[
            styles.icon,
            {
              backgroundColor: soft,
            },
          ]}
        >
          <Ionicons name={notice.icon} size={22} color={color} />
        </View>
        <View
          style={{
            flex: 1,
          }}
        >
          <View style={styles.cardTop}>
            <View
              style={[
                styles.priorityPill,
                {
                  backgroundColor: p.soft,
                },
              ]}
            >
              {notice.priority === 'Critical' && <Ionicons name="alert-circle" size={11} color={p.color} />}
              <Text
                style={[
                  styles.priorityText,
                  {
                    color: p.color,
                  },
                ]}
              >
                {notice.priority}
              </Text>
            </View>
            <Text style={styles.time}>{timeAgo(notice.time)}</Text>
          </View>
          <Text style={styles.cardTitle}>{notice.title}</Text>
          <Text style={styles.cardBody} numberOfLines={2}>
            {notice.body}
          </Text>
          <View style={styles.cardFooter}>
            <View style={styles.catTag}>
              <Text style={styles.catText}>{notice.category}</Text>
            </View>
            {!notice.read && <View style={styles.unreadDot} />}
          </View>
        </View>
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
  },
  card: {
    flexDirection: 'row',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  cardUnread: {
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  priorityPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  priorityText: {
    fontSize: 10,
    fontWeight: '700',
  },
  time: {
    fontSize: 11,
    color: colors.textMuted,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  cardBody: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 3,
    lineHeight: 18,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.sm,
  },
  catTag: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.sm,
  },
  catText: {
    fontSize: 10.5,
    color: colors.textSecondary,
    fontWeight: '600',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
  },
}));
