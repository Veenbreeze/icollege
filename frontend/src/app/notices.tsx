import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow , themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { noticeCategories, notices, type Notice, type Priority } from '@/data/mock';

const PRIORITY: Record<Priority, { color: string; soft: string }> = {
  Critical: { color: colors.red, soft: colors.redSoft },
  Important: { color: colors.orange, soft: colors.orangeSoft },
  Normal: { color: colors.blue, soft: colors.blueSoft },
};

export default function NoticesScreen() {
  const router = useRouter();
  const [cat, setCat] = useState('All');

  const filtered = useMemo(
    () => (cat === 'All' ? notices : notices.filter((n) => n.category === cat)),
    [cat],
  );
  const unread = notices.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <View style={{ flex: 1, marginLeft: spacing.md }}>
          <Text style={styles.title}>Notices & Alerts</Text>
          <Text style={styles.subtitle}>{unread} unread notifications</Text>
        </View>
        <Pressable style={styles.markBtn}>
          <Ionicons name="checkmark-done-outline" size={18} color={colors.primary} />
        </Pressable>
      </View>

      {/* Category chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {noticeCategories.map((c) => {
          const active = c === cat;
          return (
            <Pressable key={c} style={[styles.chip, active ? styles.chipOn : styles.chipOff]} onPress={() => setCat(c)}>
              <Text style={[styles.chipText, { color: active ? colors.white : colors.textSecondary }]}>{c}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {filtered.map((n) => (
          <NoticeCard key={n.id} notice={n} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function NoticeCard({ notice }: { notice: Notice }) {
  const p = PRIORITY[notice.priority];
  return (
    <Card style={[styles.card, !notice.read && styles.cardUnread]}>
      <View style={[styles.icon, { backgroundColor: notice.soft }]}>
        <Ionicons name={notice.icon as any} size={22} color={notice.color} />
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.cardTop}>
          <View style={[styles.priorityPill, { backgroundColor: p.soft }]}>
            {notice.priority === 'Critical' && <Ionicons name="alert-circle" size={11} color={p.color} />}
            <Text style={[styles.priorityText, { color: p.color }]}>{notice.priority}</Text>
          </View>
          <Text style={styles.time}>{notice.time}</Text>
        </View>
        <Text style={styles.cardTitle}>{notice.title}</Text>
        <Text style={styles.cardBody} numberOfLines={2}>{notice.body}</Text>
        <View style={styles.cardFooter}>
          <View style={styles.catTag}>
            <Text style={styles.catText}>{notice.category}</Text>
          </View>
          {!notice.read && <View style={styles.unreadDot} />}
        </View>
      </View>
    </Card>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  title: { fontSize: 22, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  markBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },

  chips: { paddingHorizontal: spacing.lg, paddingVertical: spacing.lg, gap: spacing.sm },
  chip: { paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, borderRadius: radii.pill },
  chipOn: { backgroundColor: colors.primary },
  chipOff: { backgroundColor: colors.surface, ...shadow.soft },
  chipText: { fontSize: 13, fontWeight: '600' },

  card: { flexDirection: 'row', gap: spacing.md, marginHorizontal: spacing.lg, marginBottom: spacing.md },
  cardUnread: { borderLeftWidth: 3, borderLeftColor: colors.primary },
  icon: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  cardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 },
  priorityPill: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 8, paddingVertical: 2, borderRadius: radii.pill },
  priorityText: { fontSize: 10, fontWeight: '700' },
  time: { fontSize: 11, color: colors.textMuted },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  cardBody: { fontSize: 12.5, color: colors.textSecondary, marginTop: 3, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: spacing.sm },
  catTag: { backgroundColor: colors.surfaceMuted, paddingHorizontal: spacing.sm, paddingVertical: 3, borderRadius: radii.sm },
  catText: { fontSize: 10.5, color: colors.textSecondary, fontWeight: '600' },
  unreadDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.primary },
}));
