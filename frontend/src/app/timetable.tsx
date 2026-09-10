import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow , themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import {
  todayClasses,
  timetableStats,
  weekDays,
  type ClassItem,
} from '@/data/mock';

const VIEW_TABS = ['Day', 'Week', 'Month', 'Agenda'];

const STATUS: Record<
  ClassItem['status'],
  { label: string; color: string; soft: string; icon?: any; dot?: boolean }
> = {
  completed: { label: 'Completed', color: colors.green, soft: colors.greenSoft, icon: 'checkmark-circle' },
  current: { label: 'Current', color: colors.blue, soft: colors.blueSoft, dot: true },
  upcoming: { label: 'Upcoming', color: colors.orange, soft: colors.orangeSoft },
};

const QUICK = [
  { label: 'Download\nTimetable', icon: 'download-outline', color: colors.primary, soft: colors.primarySoft },
  { label: 'Share\nTimetable', icon: 'share-social-outline', color: colors.blue, soft: colors.blueSoft },
  { label: 'Export to\nCalendar', icon: 'calendar-outline', color: colors.green, soft: colors.greenSoft },
  { label: 'Classroom\nMap', icon: 'location-outline', color: colors.orange, soft: colors.orangeSoft },
];

export default function TimetableScreen() {
  const router = useRouter();
  const [tab, setTab] = useState('Day');

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <Text style={styles.title}>Timetable</Text>
            <Text style={styles.subtitle}>Manage your class schedule</Text>
          </View>
          <View style={styles.headerActions}>
            <View style={styles.headerBtn}>
              <Ionicons name="filter" size={18} color={colors.primary} />
              <Text style={styles.headerBtnLabel}>Filter</Text>
            </View>
            <View style={styles.headerBtn}>
              <Ionicons name="calendar" size={18} color={colors.primary} />
              <Text style={styles.headerBtnLabel}>Calendar</Text>
            </View>
          </View>
        </View>

        {/* View tabs */}
        <View style={styles.segment}>
          {VIEW_TABS.map((t) => {
            const active = t === tab;
            return (
              <Pressable
                key={t}
                style={[styles.segmentItem, active && styles.segmentItemActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{t}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Month + date nav */}
        <View style={styles.monthRow}>
          <View style={styles.monthLeft}>
            <Ionicons name="calendar-outline" size={18} color={colors.primary} />
            <Text style={styles.monthText}>May 2025</Text>
          </View>
          <View style={styles.dateCenter}>
            <Text style={styles.dateText}>Tuesday, 13 May</Text>
            <Ionicons name="chevron-down" size={16} color={colors.text} />
          </View>
          <View style={styles.navArrows}>
            <View style={styles.arrowBtn}>
              <Ionicons name="chevron-back" size={16} color={colors.primary} />
            </View>
            <View style={styles.arrowBtn}>
              <Ionicons name="chevron-forward" size={16} color={colors.primary} />
            </View>
          </View>
        </View>

        {/* Week strip */}
        <View style={styles.weekStrip}>
          {weekDays.map((d) => {
            const selected = d.selected;
            return (
              <View key={d.day} style={styles.weekItem}>
                <Text style={[styles.weekDay, selected && { color: colors.white }]}>{d.day}</Text>
                <View style={[styles.weekDateWrap, selected && styles.weekDateWrapActive]}>
                  <Text style={[styles.weekDate, selected && { color: colors.white }]}>{d.date}</Text>
                </View>
                {selected && <View style={styles.weekDot} />}
              </View>
            );
          })}
        </View>

        {/* Stats */}
        <Card style={styles.statsCard}>
          <Stat icon="book-outline" color={colors.primary} value={String(timetableStats.classesToday)} label="Classes Today" />
          <Divider />
          <Stat icon="time-outline" color={colors.orange} value={timetableStats.totalDuration} label="Total Duration" />
          <Divider />
          <Stat icon="checkmark-circle-outline" color={colors.green} value={String(timetableStats.completed)} label="Completed" />
          <Divider />
          <Stat icon="book-outline" color={colors.blue} value={String(timetableStats.upcoming)} label="Upcoming" />
        </Card>

        {/* Today's classes */}
        <View style={styles.listHeader}>
          <Text style={styles.listTitle}>Today&apos;s Classes</Text>
          <View style={styles.sortRow}>
            <Text style={styles.sortText}>Sort by: Time</Text>
            <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
          </View>
        </View>

        {todayClasses.map((c) => {
          const s = STATUS[c.status];
          return (
            <Card key={c.id} style={styles.classCard}>
              <View style={[styles.accent, { backgroundColor: c.color }]} />
              <View style={styles.timeCol}>
                <Text style={[styles.timeStart, { color: c.color }]}>{c.start}</Text>
                <Text style={styles.timeEnd}>{c.end}</Text>
              </View>
              <View style={[styles.classIcon, { backgroundColor: c.soft }]}>
                <Ionicons name={c.icon as any} size={22} color={c.color} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.className}>{c.title}</Text>
                <Text style={styles.classMeta}>{c.code} • {c.type}</Text>
                <View style={styles.classMetaRow}>
                  <Ionicons name="person-outline" size={12} color={colors.textMuted} />
                  <Text style={styles.classMetaSm}>{c.lecturer}</Text>
                </View>
                <View style={styles.classMetaRow}>
                  <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                  <Text style={styles.classMetaSm}>{c.room}</Text>
                </View>
              </View>
              <View style={styles.statusCol}>
                <Pill label={s.label} color={s.color} soft={s.soft} icon={s.icon} dot={s.dot} />
                {c.note && <Text style={[styles.note, { color: c.color }]}>{c.note}</Text>}
                <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginTop: 6 }} />
              </View>
            </Card>
          );
        })}

        {/* Updates banner */}
        <View style={styles.updates}>
          <View style={styles.updatesIcon}>
            <Ionicons name="notifications" size={22} color={colors.primary} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.updatesTitle}>Timetable Updates</Text>
            <Text style={styles.updatesBody}>
              You will receive a notification when there is any change to your timetable.
            </Text>
          </View>
          <View style={styles.updatesLink}>
            <Text style={styles.updatesLinkText}>Notification Settings</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </View>

        {/* Quick actions */}
        <Text style={styles.quickTitle}>Quick Actions</Text>
        <View style={styles.quickRow}>
          {QUICK.map((q) => (
            <View key={q.label} style={styles.quickItem}>
              <View style={[styles.quickIcon, { backgroundColor: q.soft }]}>
                <Ionicons name={q.icon as any} size={20} color={q.color} />
              </View>
              <Text style={styles.quickLabel}>{q.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function Stat({ icon, color, value, label }: { icon: any; color: string; value: string; label: string }) {
  return (
    <View style={styles.stat}>
      <Ionicons name={icon} size={20} color={color} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function Divider() {
  return <View style={styles.vDivider} />;
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },

  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 13, color: colors.textSecondary, marginTop: 1 },
  headerActions: { flexDirection: 'row', gap: spacing.md },
  headerBtn: {
    alignItems: 'center', backgroundColor: colors.primarySoft, borderRadius: radii.md,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: 2, minWidth: 56,
  },
  headerBtnLabel: { fontSize: 10, color: colors.primary, fontWeight: '600' },

  segment: {
    flexDirection: 'row', backgroundColor: colors.surface, marginHorizontal: spacing.lg, marginTop: spacing.lg,
    borderRadius: radii.pill, padding: 4, ...shadow.soft,
  },
  segmentItem: { flex: 1, alignItems: 'center', paddingVertical: 10, borderRadius: radii.pill },
  segmentItemActive: { backgroundColor: colors.primary },
  segmentText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  segmentTextActive: { color: colors.white },

  monthRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  monthLeft: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 96 },
  monthText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  dateCenter: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  dateText: { fontSize: 16, fontWeight: '700', color: colors.text },
  navArrows: { flexDirection: 'row', gap: 8, width: 96, justifyContent: 'flex-end' },
  arrowBtn: { width: 32, height: 32, borderRadius: 16, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center' },

  weekStrip: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginTop: spacing.lg },
  weekItem: { alignItems: 'center', flex: 1 },
  weekDay: { fontSize: 12, color: colors.textMuted, marginBottom: 6 },
  weekDateWrap: { width: 40, height: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  weekDateWrapActive: { backgroundColor: colors.primary, ...shadow.soft },
  weekDate: { fontSize: 15, fontWeight: '700', color: colors.text },
  weekDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: colors.white, marginTop: -8 },

  statsCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginTop: spacing.xl, paddingVertical: spacing.lg },
  stat: { flex: 1, alignItems: 'center', gap: 3 },
  statValue: { fontSize: 16, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textMuted, textAlign: 'center' },
  vDivider: { width: 1, height: 34, backgroundColor: colors.border },

  listHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  listTitle: { fontSize: 18, fontWeight: '800', color: colors.text },
  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  sortText: { fontSize: 12, color: colors.textMuted },

  classCard: { flexDirection: 'row', alignItems: 'center', marginHorizontal: spacing.lg, marginTop: spacing.md, paddingLeft: spacing.lg + 6, overflow: 'hidden' },
  accent: { position: 'absolute', left: 0, top: 0, bottom: 0, width: 4 },
  timeCol: { width: 62 },
  timeStart: { fontSize: 12, fontWeight: '700' },
  timeEnd: { fontSize: 11, color: colors.textMuted, marginTop: 12 },
  classIcon: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center', marginHorizontal: spacing.sm },
  className: { fontSize: 15, fontWeight: '700', color: colors.text },
  classMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
  classMetaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 3 },
  classMetaSm: { fontSize: 11.5, color: colors.textMuted },
  statusCol: { alignItems: 'flex-end', marginLeft: spacing.sm },
  note: { fontSize: 11, fontWeight: '600', marginTop: 4 },

  updates: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.md, backgroundColor: colors.primarySoft,
    marginHorizontal: spacing.lg, marginTop: spacing.xl, padding: spacing.lg, borderRadius: radii.lg,
  },
  updatesIcon: { width: 42, height: 42, borderRadius: radii.md, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  updatesTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  updatesBody: { fontSize: 12, color: colors.textSecondary, marginTop: 2, lineHeight: 17 },
  updatesLink: { alignItems: 'flex-end', maxWidth: 90 },
  updatesLinkText: { fontSize: 12, fontWeight: '700', color: colors.primary },

  quickTitle: { fontSize: 18, fontWeight: '800', color: colors.text, paddingHorizontal: spacing.lg, marginTop: spacing.xxl },
  quickRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginTop: spacing.md, gap: spacing.md },
  quickItem: {
    flex: 1, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.lg,
    paddingVertical: spacing.lg, gap: spacing.sm, ...shadow.soft,
  },
  quickIcon: { width: 40, height: 40, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 11, color: colors.textSecondary, fontWeight: '600', textAlign: 'center' },
}));
