import { useMemo, useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Share, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApi } from '@/hooks/useApi';
import { fetchTodayTimetable, fetchWeekTimetable } from '@/lib/api/academic';
import { resolveAccent } from '@/lib/colorKey';
const VIEW_TABS = ['Day', 'Week', 'Agenda'];
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const STATUS = {
  completed: {
    label: 'Completed',
    color: colors.green,
    soft: colors.greenSoft,
    icon: 'checkmark-circle',
  },
  current: {
    label: 'Current',
    color: colors.blue,
    soft: colors.blueSoft,
    dot: true,
  },
  upcoming: {
    label: 'Upcoming',
    color: colors.orange,
    soft: colors.orangeSoft,
  },
};
function startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay());
  return d;
}
function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}
function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

/** Parses a "08:00 AM" label back into minutes-since-midnight, the inverse
 * of the backend's `to12Hour` — needed because week-view rows don't carry
 * the raw minutes the "today" endpoint provides. */
function parseClockLabel(label) {
  const [time, period] = label.split(' ');
  const [hStr, mStr] = time.split(':');
  let h = Number(hStr);
  if (period === 'PM' && h !== 12) h += 12;
  if (period === 'AM' && h === 12) h = 0;
  return h * 60 + Number(mStr);
}
export default function TimetableScreen() {
  const router = useRouter();
  const [tab, setTab] = useState('Day');
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const { data: today, isLoading: loadingToday } = useApi(fetchTodayTimetable);
  const { data: week, isLoading: loadingWeek } = useApi(fetchWeekTimetable);
  const now = new Date();
  const isSelectedToday = isSameDay(selectedDate, now);
  const weekDates = useMemo(() => {
    const start = startOfWeek(selectedDate);
    return Array.from(
      {
        length: 7,
      },
      (_, i) => addDays(start, i),
    );
  }, [selectedDate]);
  const weekSorted = useMemo(
    () =>
      [...(week ?? [])].sort(
        (a, b) => a.dayOfWeek - b.dayOfWeek || parseClockLabel(a.start) - parseClockLabel(b.start),
      ),
    [week],
  );
  const dayClasses = isSelectedToday
    ? (today?.classes ?? [])
    : weekSorted
        .filter((c) => c.dayOfWeek === selectedDate.getDay())
        .map((c) => ({
          ...c,
          durationMinutes: parseClockLabel(c.end) - parseClockLabel(c.start),
          status: 'upcoming',
        }));
  const isLoading = isSelectedToday ? loadingToday : loadingWeek;
  const stats = {
    classesToday: dayClasses.length,
    totalDuration: formatDuration(dayClasses.reduce((sum, c) => sum + c.durationMinutes, 0)),
    completed: dayClasses.filter((c) => c.status === 'completed').length,
    upcoming: dayClasses.filter((c) => c.status !== 'completed').length,
  };
  const onShare = () => {
    const list = tab === 'Day' ? dayClasses : weekSorted;
    if (list.length === 0) {
      Alert.alert('Nothing to share', 'There are no classes scheduled yet.');
      return;
    }
    const header = tab === 'Day' ? selectedDate.toDateString() : 'This week';
    const lines = list.map((c) =>
      'day' in c
        ? `${c.day} ${c.start}–${c.end}  ${c.title} (${c.code}) · ${c.room}`
        : `${c.start}–${c.end}  ${c.title} (${c.code}) · ${c.room}`,
    );
    Share.share({
      message: `${header}\n\n${lines.join('\n')}`,
    });
  };
  const onOpenMap = () => {
    const next = dayClasses.find((c) => c.status !== 'completed') ?? dayClasses[0];
    if (!next) {
      Alert.alert('No classes', 'There is no class scheduled to locate on the map.');
      return;
    }
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(next.room)}`);
  };
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <ScreenHeader title="Timetable" subtitle="Manage your class schedule" />

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

        {tab === 'Day' && (
          <>
            {/* Month + date nav */}
            <View style={styles.monthRow}>
              <View style={styles.monthLeft}>
                <Ionicons name="calendar-outline" size={18} color={colors.primary} />
                <Text style={styles.monthText}>
                  {selectedDate.toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </Text>
              </View>
              <View style={styles.dateCenter}>
                <Text style={styles.dateText}>
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'short',
                  })}
                </Text>
              </View>
              <View style={styles.navArrows}>
                <Pressable style={styles.arrowBtn} onPress={() => setSelectedDate((d) => addDays(d, -1))} hitSlop={6}>
                  <Ionicons name="chevron-back" size={16} color={colors.primary} />
                </Pressable>
                <Pressable style={styles.arrowBtn} onPress={() => setSelectedDate((d) => addDays(d, 1))} hitSlop={6}>
                  <Ionicons name="chevron-forward" size={16} color={colors.primary} />
                </Pressable>
              </View>
            </View>

            {/* Week strip */}
            <View style={styles.weekStrip}>
              {weekDates.map((d) => {
                const selected = isSameDay(d, selectedDate);
                return (
                  <Pressable key={d.toISOString()} style={styles.weekItem} onPress={() => setSelectedDate(d)}>
                    <Text
                      style={[
                        styles.weekDay,
                        selected && {
                          color: colors.white,
                        },
                      ]}
                    >
                      {DAY_NAMES[d.getDay()]}
                    </Text>
                    <View style={[styles.weekDateWrap, selected && styles.weekDateWrapActive]}>
                      <Text
                        style={[
                          styles.weekDate,
                          selected && {
                            color: colors.white,
                          },
                        ]}
                      >
                        {d.getDate()}
                      </Text>
                    </View>
                    {isSameDay(d, now) && <View style={styles.weekDot} />}
                  </Pressable>
                );
              })}
            </View>

            {/* Stats */}
            <Card style={styles.statsCard}>
              <Stat icon="book-outline" color={colors.primary} value={String(stats.classesToday)} label="Classes" />
              <Divider />
              <Stat icon="time-outline" color={colors.orange} value={stats.totalDuration} label="Total Duration" />
              <Divider />
              <Stat
                icon="checkmark-circle-outline"
                color={colors.green}
                value={String(stats.completed)}
                label="Completed"
              />
              <Divider />
              <Stat icon="book-outline" color={colors.blue} value={String(stats.upcoming)} label="Upcoming" />
            </Card>

            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                {isSelectedToday ? "Today's Classes" : `${DAY_NAMES[selectedDate.getDay()]} Classes`}
              </Text>
            </View>

            {isLoading && (
              <ActivityIndicator
                color={colors.primary}
                style={{
                  marginTop: spacing.lg,
                }}
              />
            )}
            {!isLoading && dayClasses.length === 0 && (
              <Text style={styles.emptyText}>No classes scheduled for this day. Enjoy the break!</Text>
            )}
            {dayClasses.map((c) => (
              <ClassRow key={c.id} c={c} showStatus={isSelectedToday} />
            ))}
          </>
        )}

        {tab === 'Week' && (
          <View
            style={{
              marginTop: spacing.lg,
            }}
          >
            {loadingWeek && (
              <ActivityIndicator
                color={colors.primary}
                style={{
                  marginTop: spacing.lg,
                }}
              />
            )}
            {!loadingWeek && weekSorted.length === 0 && (
              <Text style={styles.emptyText}>No classes scheduled this week.</Text>
            )}
            {DAY_NAMES.map((dayName, idx) => {
              const dayItems = weekSorted.filter((c) => c.dayOfWeek === idx);
              if (dayItems.length === 0) return null;
              return (
                <View key={dayName}>
                  <Text style={styles.dayGroupTitle}>{dayName}</Text>
                  {dayItems.map((c) => (
                    <ClassRow key={c.id} c={c} showStatus={false} />
                  ))}
                </View>
              );
            })}
          </View>
        )}

        {tab === 'Agenda' && (
          <View
            style={{
              marginTop: spacing.lg,
            }}
          >
            {loadingWeek && (
              <ActivityIndicator
                color={colors.primary}
                style={{
                  marginTop: spacing.lg,
                }}
              />
            )}
            {!loadingWeek && weekSorted.length === 0 && (
              <Text style={styles.emptyText}>No classes scheduled this week.</Text>
            )}
            {weekSorted.map((c) => (
              <ClassRow key={c.id} c={c} showStatus={false} dayLabel={c.day} />
            ))}
          </View>
        )}

        {/* Updates banner */}
        <Pressable style={styles.updates} onPress={() => router.push('/settings')}>
          <View style={styles.updatesIcon}>
            <Ionicons name="notifications" size={22} color={colors.primary} />
          </View>
          <View
            style={{
              flex: 1,
            }}
          >
            <Text style={styles.updatesTitle}>Timetable Updates</Text>
            <Text style={styles.updatesBody}>
              You will receive a notification when there is any change to your timetable.
            </Text>
          </View>
          <View style={styles.updatesLink}>
            <Text style={styles.updatesLinkText}>Notification Settings</Text>
            <Ionicons name="chevron-forward" size={14} color={colors.primary} />
          </View>
        </Pressable>

        {/* Quick actions */}
        <Text style={styles.quickTitle}>Quick Actions</Text>
        <View style={styles.quickRow}>
          <Pressable style={styles.quickItem} onPress={onShare}>
            <View
              style={[
                styles.quickIcon,
                {
                  backgroundColor: colors.blueSoft,
                },
              ]}
            >
              <Ionicons name="share-social-outline" size={20} color={colors.blue} />
            </View>
            <Text style={styles.quickLabel}>Share{'\n'}Timetable</Text>
          </Pressable>
          <Pressable style={styles.quickItem} onPress={onOpenMap}>
            <View
              style={[
                styles.quickIcon,
                {
                  backgroundColor: colors.orangeSoft,
                },
              ]}
            >
              <Ionicons name="location-outline" size={20} color={colors.orange} />
            </View>
            <Text style={styles.quickLabel}>Classroom{'\n'}Map</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
function ClassRow({ c, showStatus, dayLabel }) {
  const { color, soft } = resolveAccent(c.colorKey);
  const status = showStatus && 'status' in c ? STATUS[c.status] : null;
  return (
    <Card style={styles.classCard}>
      <View
        style={[
          styles.accent,
          {
            backgroundColor: color,
          },
        ]}
      />
      <View style={styles.timeCol}>
        <Text
          style={[
            styles.timeStart,
            {
              color,
            },
          ]}
        >
          {c.start}
        </Text>
        <Text style={styles.timeEnd}>{c.end}</Text>
      </View>
      <View
        style={[
          styles.classIcon,
          {
            backgroundColor: soft,
          },
        ]}
      >
        <Ionicons name={c.icon} size={22} color={color} />
      </View>
      <View
        style={{
          flex: 1,
        }}
      >
        <Text style={styles.className}>{c.title}</Text>
        <Text style={styles.classMeta}>
          {c.code} • {c.type}
        </Text>
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
        {status && (
          <Pill label={status.label} color={status.color} soft={status.soft} icon={status.icon} dot={status.dot} />
        )}
        {!status && dayLabel && (
          <View style={styles.dayPill}>
            <Text style={styles.dayPillText}>{dayLabel}</Text>
          </View>
        )}
        {status && 'note' in c && c.note && (
          <Text
            style={[
              styles.note,
              {
                color,
              },
            ]}
          >
            {c.note}
          </Text>
        )}
      </View>
    </Card>
  );
}
function Stat({ icon, color, value, label }) {
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
function formatDuration(totalMinutes) {
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
const styles = themedStyles((colors) => ({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  segment: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    borderRadius: radii.pill,
    padding: 4,
    ...shadow.soft,
  },
  segmentItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: radii.pill,
  },
  segmentItemActive: {
    backgroundColor: colors.primary,
  },
  segmentText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  segmentTextActive: {
    color: colors.white,
  },
  monthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  monthLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: 96,
  },
  monthText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  dateCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  navArrows: {
    flexDirection: 'row',
    gap: 8,
    width: 96,
    justifyContent: 'flex-end',
  },
  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  weekItem: {
    alignItems: 'center',
    flex: 1,
  },
  weekDay: {
    fontSize: 12,
    color: colors.textMuted,
    marginBottom: 6,
  },
  weekDateWrap: {
    width: 40,
    height: 48,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weekDateWrapActive: {
    backgroundColor: colors.primary,
    ...shadow.soft,
  },
  weekDate: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  weekDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.primary,
    marginTop: 4,
  },
  statsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    paddingVertical: spacing.lg,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statValue: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
  },
  vDivider: {
    width: 1,
    height: 34,
    backgroundColor: colors.border,
  },
  listHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  listTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  dayGroupTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  classCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingLeft: spacing.lg + 6,
    overflow: 'hidden',
  },
  accent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  timeCol: {
    width: 62,
  },
  timeStart: {
    fontSize: 12,
    fontWeight: '700',
  },
  timeEnd: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 12,
  },
  classIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: spacing.sm,
  },
  className: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  classMeta: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  classMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },
  classMetaSm: {
    fontSize: 11.5,
    color: colors.textMuted,
  },
  statusCol: {
    alignItems: 'flex-end',
    marginLeft: spacing.sm,
  },
  note: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4,
  },
  dayPill: {
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  dayPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textSecondary,
  },
  updates: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
  },
  updatesIcon: {
    width: 42,
    height: 42,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updatesTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  updatesBody: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    lineHeight: 17,
  },
  updatesLink: {
    alignItems: 'flex-end',
    maxWidth: 90,
  },
  updatesLinkText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primary,
  },
  quickTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xxl,
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
    gap: spacing.md,
  },
  quickItem: {
    flex: 1,
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
    ...shadow.soft,
  },
  quickIcon: {
    width: 40,
    height: 40,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickLabel: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
    textAlign: 'center',
  },
}));
