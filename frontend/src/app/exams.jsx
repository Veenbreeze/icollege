import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { FilterChips } from '@/components/ui/FilterChips';
import { useApi } from '@/hooks/useApi';
import { fetchExams } from '@/lib/api/academic';
import { resolveAccent } from '@/lib/colorKey';
import { examTypes } from '@/data/mock';
export default function ExamsScreen() {
  const router = useRouter();
  const [type, setType] = useState('Final');
  const { data: exams, isLoading } = useApi(fetchExams);
  const next = (exams ?? []).find((e) => e.status === 'next');
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <ScreenHeader
          title="Examinations"
          subtitle="Timetable, venues & seating"
          right={
            <Pressable style={styles.headerBtn} onPress={() => router.push('/exam-seating')}>
              <Ionicons name="grid-outline" size={18} color={colors.primary} />
              <Text style={styles.headerBtnLabel}>Seating</Text>
            </Pressable>
          }
        />

        {/* Countdown to next exam */}
        {next && (
          <View style={styles.countdown}>
            <View style={styles.countIcon}>
              <Ionicons name="alarm-outline" size={22} color={colors.white} />
            </View>
            <View
              style={{
                flex: 1,
              }}
            >
              <Text style={styles.countLabel}>NEXT EXAM · IN 3 DAYS</Text>
              <Text style={styles.countTitle}>{next.title}</Text>
              <Text style={styles.countMeta}>
                {next.date} · {next.time} · {next.room}
              </Text>
            </View>
            <Pressable
              onPress={() =>
                router.push({
                  pathname: '/exam-seating',
                  params: {
                    examId: next.id,
                  },
                })
              }
            >
              <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.9)" />
            </Pressable>
          </View>
        )}

        <FilterChips options={examTypes} value={type} onChange={setType} style={styles.tabsSpacing} />

        <Text style={styles.sectionTitle}>{type} Examinations</Text>

        {isLoading && (
          <ActivityIndicator
            color={colors.primary}
            style={{
              marginTop: spacing.lg,
            }}
          />
        )}

        {(exams ?? []).map((e) => (
          <ExamCard
            key={e.id}
            exam={e}
            onSeat={() =>
              router.push({
                pathname: '/exam-seating',
                params: {
                  examId: e.id,
                },
              })
            }
          />
        ))}

        {/* Notify banner */}
        <View style={styles.notify}>
          <Ionicons name="notifications-outline" size={20} color={colors.primary} />
          <Text style={styles.notifyText}>
            You&apos;ll be notified instantly if any exam date, time or venue changes.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
function ExamCard({ exam, onSeat }) {
  const { color, soft } = resolveAccent(exam.colorKey);
  return (
    <Card style={styles.examCard}>
      <View style={styles.examTop}>
        <View
          style={[
            styles.examIcon,
            {
              backgroundColor: soft,
            },
          ]}
        >
          <Ionicons name={exam.icon} size={22} color={color} />
        </View>
        <View
          style={{
            flex: 1,
          }}
        >
          <Text style={styles.examTitle}>{exam.title}</Text>
          <Text style={styles.examCode}>
            {exam.code} · {exam.type}
          </Text>
        </View>
        {exam.status === 'next' && <Pill label="Next" color={colors.blue} soft={colors.blueSoft} dot />}
      </View>

      <View style={styles.examGrid}>
        <ExamMeta icon="calendar-outline" label={exam.date} />
        <ExamMeta icon="time-outline" label={`${exam.time} · ${exam.duration}`} />
        <ExamMeta icon="location-outline" label={`${exam.venue} · ${exam.room}`} />
        <ExamMeta icon="grid-outline" label={exam.seat ? `Seat ${exam.seat}` : 'Seat not yet assigned'} />
      </View>

      <Pressable style={styles.seatBtn} onPress={onSeat}>
        <Ionicons name="map-outline" size={16} color={colors.primary} />
        <Text style={styles.seatBtnText}>View Seating</Text>
      </Pressable>
    </Card>
  );
}
function ExamMeta({ icon, label }) {
  return (
    <View style={styles.meta}>
      <Ionicons name={icon} size={14} color={colors.textMuted} />
      <Text style={styles.metaText}>{label}</Text>
    </View>
  );
}
const styles = themedStyles((colors) => ({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  headerBtn: {
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: 2,
  },
  headerBtnLabel: {
    fontSize: 10,
    color: colors.primary,
    fontWeight: '600',
  },
  countdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.xl,
    ...shadow.card,
  },
  countIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  countLabel: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  countTitle: {
    color: colors.white,
    fontSize: 17,
    fontWeight: '800',
    marginTop: 2,
  },
  countMeta: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 12,
    marginTop: 2,
  },
  tabsSpacing: {
    marginTop: spacing.xl,
    paddingVertical: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  examCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  examTop: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  examIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  examCode: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  examGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: spacing.md,
    rowGap: spacing.sm,
  },
  meta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    width: '50%',
  },
  metaText: {
    fontSize: 12.5,
    color: colors.textSecondary,
  },
  seatBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
  },
  seatBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  notify: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
  },
  notifyText: {
    flex: 1,
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
  },
}));
