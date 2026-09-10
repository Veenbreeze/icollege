import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { colors, radii, spacing, shadow, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApi } from '@/hooks/useApi';
import { fetchExamSeating } from '@/lib/api/academic';
import { useAuth } from '@/lib/auth/AuthContext';

/** Room map is a fixed visual grid — the schema only tracks each student's
 * assigned seat, not full per-exam venue capacity. */
const ROWS = 6;
const COLS = 8;
export default function ExamSeatingScreen() {
  const { user } = useAuth();
  const { examId } = useLocalSearchParams();
  const { data: s, isLoading } = useApi(() => {
    if (!examId) return Promise.resolve(null);
    return fetchExamSeating(examId);
  }, [examId]);
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <ScreenHeader title="Exam Seating" subtitle="Find your seat" />

        {isLoading && (
          <ActivityIndicator
            color={colors.primary}
            style={{
              marginTop: spacing.xl,
            }}
          />
        )}

        {!isLoading && !examId && (
          <Text style={styles.emptyText}>Open an exam from Examinations to view its seating.</Text>
        )}

        {!isLoading && examId && !s && <Text style={styles.emptyText}>Couldn&apos;t find that exam.</Text>}

        {s && (
          <>
            {/* Exam info */}
            <Card style={styles.infoCard}>
              <View style={styles.infoTop}>
                <View>
                  <Text style={styles.examName}>{s.exam}</Text>
                  <Text style={styles.examCode}>
                    {s.code} · {s.date}
                  </Text>
                </View>
                <View style={styles.regBadge}>
                  <Text style={styles.regText}>{user?.studentId}</Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Detail icon="business-outline" label="Venue" value={s.venue} />
                <Detail icon="location-outline" label="Room / Hall" value={s.room} />
              </View>
              <View style={styles.detailRow}>
                <Detail icon="albums-outline" label="Row" value={s.seatRow != null ? `Row ${s.seatRow}` : 'Not yet assigned'} />
                <Detail icon="grid-outline" label="Seat" value={s.seat ?? 'Not yet assigned'} />
              </View>
            </Card>

            {/* Seat map */}
            {s.seatRow != null && s.seatCol != null && (
              <>
                <Text style={styles.sectionTitle}>Seating Map</Text>
                <Card style={styles.mapCard}>
                  <View style={styles.podium}>
                    <Ionicons name="easel-outline" size={16} color={colors.textSecondary} />
                    <Text style={styles.podiumText}>Front · Invigilator</Text>
                  </View>

                  <View style={styles.grid}>
                    {Array.from({
                      length: ROWS,
                    }).map((_, r) => (
                      <View key={r} style={styles.gridRow}>
                        <Text style={styles.rowLabel}>R{r + 1}</Text>
                        {Array.from({
                          length: COLS,
                        }).map((_, c) => {
                          const mine = r + 1 === s.seatRow && c + 1 === s.seatCol;
                          const occupied = (r * COLS + c) % 3 === 0 && !mine;
                          return (
                            <View
                              key={c}
                              style={[styles.seat, occupied && styles.seatOccupied, mine && styles.seatMine]}
                            >
                              {mine && <Ionicons name="person" size={13} color={colors.white} />}
                            </View>
                          );
                        })}
                      </View>
                    ))}
                  </View>

                  <View style={styles.legend}>
                    <Legend color={colors.primary} label="Your seat" />
                    <Legend color={colors.surfaceMuted} label="Available" border />
                    <Legend color={colors.border} label="Occupied" />
                  </View>
                </Card>
              </>
            )}

            <View style={styles.tip}>
              <Ionicons name="information-circle-outline" size={18} color={colors.primary} />
              <Text style={styles.tipText}>
                Arrive 30 minutes early. Bring your student ID and exam card. Your seat is highlighted above.
              </Text>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
function Detail({ icon, label, value }) {
  return (
    <View style={styles.detail}>
      <View style={styles.detailIcon}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View>
        <Text style={styles.detailLabel}>{label}</Text>
        <Text style={styles.detailValue}>{value}</Text>
      </View>
    </View>
  );
}
function Legend({ color, label, border }) {
  return (
    <View style={styles.legendItem}>
      <View
        style={[
          styles.legendDot,
          {
            backgroundColor: color,
          },
          border && {
            borderWidth: 1,
            borderColor: colors.border,
          },
        ]}
      />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}
const styles = themedStyles((colors) => ({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.xl,
  },
  infoCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  infoTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.lg,
  },
  examName: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.text,
  },
  examCode: {
    fontSize: 12.5,
    color: colors.textSecondary,
    marginTop: 2,
  },
  regBadge: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  regText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  detailRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  detail: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailIcon: {
    width: 34,
    height: 34,
    borderRadius: radii.sm,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 11,
    color: colors.textMuted,
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  mapCard: {
    marginHorizontal: spacing.lg,
  },
  podium: {
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surfaceMuted,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radii.pill,
    marginBottom: spacing.lg,
  },
  podiumText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  grid: {
    gap: spacing.sm,
  },
  gridRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    justifyContent: 'center',
  },
  rowLabel: {
    width: 22,
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '600',
  },
  seat: {
    flex: 1,
    aspectRatio: 1,
    maxWidth: 34,
    borderRadius: 7,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  seatOccupied: {
    backgroundColor: colors.border,
  },
  seatMine: {
    backgroundColor: colors.primary,
    ...shadow.soft,
    shadowColor: colors.primary,
  },
  legend: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 12,
    color: colors.textSecondary,
  },
  tip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primarySoft,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radii.lg,
  },
  tipText: {
    flex: 1,
    fontSize: 12.5,
    color: colors.textSecondary,
    lineHeight: 18,
  },
}));
