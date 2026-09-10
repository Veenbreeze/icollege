import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, shadow, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useApi } from '@/hooks/useApi';
import { fetchStudyCourses, fetchCourseStudy } from '@/lib/api/ai';
import { fetchExams } from '@/lib/api/academic';
import { resolveAccent } from '@/lib/colorKey';
const TOOLS = [
  {
    key: 'summary',
    label: 'Summary',
    icon: 'reader-outline',
  },
  {
    key: 'flashcards',
    label: 'Flashcards',
    icon: 'albums-outline',
  },
  {
    key: 'quiz',
    label: 'Quiz',
    icon: 'help-circle-outline',
  },
  {
    key: 'plan',
    label: 'Study Plan',
    icon: 'calendar-outline',
  },
];
export default function AiStudyScreen() {
  const [courseId, setCourseId] = useState(null);
  const [tool, setTool] = useState('summary');
  const { data: courses } = useApi(fetchStudyCourses);
  const activeCourseId = courseId ?? courses?.find((c) => c.flashcardCount > 0)?.id ?? courses?.[0]?.id ?? null;
  const activeCourse = courses?.find((c) => c.id === activeCourseId);
  const { data: study, isLoading: loadingStudy } = useApi(
    () => (activeCourseId ? fetchCourseStudy(activeCourseId) : Promise.resolve(null)),
    [activeCourseId],
  );
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <ScreenHeader
          title="AI Study Assistant"
          subtitle="Learn from your own courses"
          titleSize={22}
          right={
            <View style={styles.aiBadge}>
              <Ionicons name="sparkles" size={13} color={colors.primary} />
              <Text style={styles.aiBadgeText}>iAI</Text>
            </View>
          }
        />

        {/* Course picker */}
        <Text style={styles.label}>Course</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.materials}>
          {(courses ?? []).map((c) => {
            const active = c.id === activeCourseId;
            const { color, soft } = resolveAccent(c.colorKey);
            return (
              <Pressable
                key={c.id}
                style={[
                  styles.material,
                  active && {
                    borderColor: color,
                    borderWidth: 1.5,
                  },
                ]}
                onPress={() => setCourseId(c.id)}
              >
                <View
                  style={[
                    styles.materialIcon,
                    {
                      backgroundColor: soft,
                    },
                  ]}
                >
                  <Ionicons name={c.icon} size={18} color={color} />
                </View>
                <Text style={styles.materialName} numberOfLines={2}>
                  {c.title}
                </Text>
                <Text style={styles.materialPages}>
                  {c.flashcardCount} flashcards · {c.quizCount} quiz
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Tool tabs */}
        <View style={styles.tools}>
          {TOOLS.map((t) => {
            const active = t.key === tool;
            return (
              <Pressable
                key={t.key}
                style={[
                  styles.tool,
                  active && {
                    backgroundColor: colors.primary,
                  },
                ]}
                onPress={() => setTool(t.key)}
              >
                <Ionicons name={t.icon} size={16} color={active ? colors.white : colors.primary} />
                <Text
                  style={[
                    styles.toolText,
                    {
                      color: active ? colors.white : colors.textSecondary,
                    },
                  ]}
                >
                  {t.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {activeCourse && (
          <View style={styles.generatedRow}>
            <Ionicons name="sparkles" size={13} color={colors.primary} />
            <Text style={styles.generatedText}>From your real "{activeCourse.title}" study material</Text>
          </View>
        )}

        {loadingStudy && (
          <ActivityIndicator
            color={colors.primary}
            style={{
              marginTop: spacing.lg,
            }}
          />
        )}

        {!loadingStudy && study && (
          <>
            {tool === 'summary' && <SummaryView study={study} />}
            {tool === 'flashcards' && <FlashcardsView flashcards={study.flashcards} />}
            {tool === 'quiz' && <QuizView questions={study.quiz} />}
            {tool === 'plan' && <PlanView />}
          </>
        )}
        {!loadingStudy && !study && activeCourseId && (
          <Text style={styles.emptyText}>No study material for this course yet.</Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
function SummaryView({ study }) {
  if (study.summary.keyConcepts.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.emptyText}>No flashcards yet to summarize.</Text>
      </View>
    );
  }
  return (
    <View style={styles.section}>
      <Text style={styles.blockTitle}>Key concepts</Text>
      <View style={styles.chipRow}>
        {study.summary.keyConcepts.map((k) => (
          <View key={k} style={styles.concept}>
            <Text style={styles.conceptText}>{k}</Text>
          </View>
        ))}
      </View>
      <Text
        style={[
          styles.blockTitle,
          {
            marginTop: spacing.lg,
          },
        ]}
      >
        Summary
      </Text>
      <Card>
        {study.summary.points.map((p, i) => (
          <View key={i} style={styles.point}>
            <View style={styles.pointDot}>
              <Text style={styles.pointNum}>{i + 1}</Text>
            </View>
            <Text style={styles.pointText}>{p}</Text>
          </View>
        ))}
      </Card>
    </View>
  );
}
function FlashcardsView({ flashcards }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  if (flashcards.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.emptyText}>No flashcards for this course yet.</Text>
      </View>
    );
  }
  const card = flashcards[idx % flashcards.length];
  const next = () => {
    setFlipped(false);
    setIdx((i) => (i + 1) % flashcards.length);
  };
  const prev = () => {
    setFlipped(false);
    setIdx((i) => (i - 1 + flashcards.length) % flashcards.length);
  };
  return (
    <View style={styles.section}>
      <Text style={styles.counter}>
        Card {idx + 1} of {flashcards.length} · tap to flip
      </Text>
      <Pressable onPress={() => setFlipped((f) => !f)} style={[styles.flashcard, flipped && styles.flashcardBack]}>
        <Text style={styles.flashLabel}>{flipped ? 'ANSWER' : 'QUESTION'}</Text>
        <Text
          style={[
            styles.flashText,
            flipped && {
              color: colors.white,
            },
          ]}
        >
          {flipped ? card.back : card.front}
        </Text>
        <View style={styles.flipHint}>
          <Ionicons name="sync-outline" size={14} color={flipped ? 'rgba(255,255,255,0.8)' : colors.textMuted} />
          <Text
            style={[
              styles.flipHintText,
              flipped && {
                color: 'rgba(255,255,255,0.8)',
              },
            ]}
          >
            Tap to flip
          </Text>
        </View>
      </Pressable>
      <View style={styles.flashNav}>
        <Pressable style={styles.navBtn} onPress={prev}>
          <Ionicons name="chevron-back" size={20} color={colors.primary} />
        </Pressable>
        <Pressable style={styles.navBtnPrimary} onPress={next}>
          <Text style={styles.navBtnText}>Next card</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.white} />
        </Pressable>
      </View>
    </View>
  );
}
function QuizView({ questions }) {
  const [answers, setAnswers] = useState({});
  const answered = Object.keys(answers).length;
  const correct = questions.filter((q) => answers[q.id] === q.answer).length;
  if (questions.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.emptyText}>No quiz for this course yet.</Text>
      </View>
    );
  }
  return (
    <View style={styles.section}>
      {answered === questions.length && (
        <View style={styles.scoreBanner}>
          <Ionicons name="trophy" size={18} color={colors.green} />
          <Text style={styles.scoreText}>
            You scored {correct}/{questions.length}
          </Text>
        </View>
      )}
      {questions.map((q, qi) => {
        const picked = answers[q.id];
        const done = picked !== undefined;
        return (
          <Card key={q.id} style={styles.quizCard}>
            <Text style={styles.quizQ}>
              {qi + 1}. {q.q}
            </Text>
            {q.options.map((opt, oi) => {
              const isPicked = picked === oi;
              const isAnswer = q.answer === oi;
              let state = 'idle';
              if (done && isAnswer) state = 'correct';
              else if (done && isPicked && !isAnswer) state = 'wrong';
              return (
                <Pressable
                  key={oi}
                  style={[
                    styles.option,
                    state === 'correct' && styles.optionCorrect,
                    state === 'wrong' && styles.optionWrong,
                  ]}
                  disabled={done}
                  onPress={() =>
                    setAnswers((a) => ({
                      ...a,
                      [q.id]: oi,
                    }))
                  }
                >
                  <Text
                    style={[
                      styles.optionText,
                      state !== 'idle' && {
                        fontWeight: '700',
                      },
                    ]}
                  >
                    {opt}
                  </Text>
                  {state === 'correct' && <Ionicons name="checkmark-circle" size={18} color={colors.green} />}
                  {state === 'wrong' && <Ionicons name="close-circle" size={18} color={colors.red} />}
                </Pressable>
              );
            })}
          </Card>
        );
      })}
    </View>
  );
}
function PlanView() {
  const { data: exams, isLoading } = useApi(fetchExams);
  const upcoming = (exams ?? []).filter((e) => e.status !== 'done');
  if (isLoading)
    return (
      <ActivityIndicator
        color={colors.primary}
        style={{
          marginTop: spacing.lg,
        }}
      />
    );
  if (upcoming.length === 0) {
    return (
      <View style={styles.section}>
        <Text style={styles.emptyText}>No upcoming exams to build a plan around.</Text>
      </View>
    );
  }
  return (
    <View style={styles.section}>
      <Text style={styles.blockTitle}>Revision plan (from your real exam schedule)</Text>
      {upcoming.map((e) => {
        const { color } = resolveAccent(e.colorKey);
        return (
          <Card key={e.id} style={styles.planRow}>
            <View
              style={[
                styles.planDay,
                {
                  backgroundColor: color,
                },
              ]}
            >
              <Text style={styles.planDayText}>{e.date.slice(0, 3)}</Text>
            </View>
            <View
              style={{
                flex: 1,
              }}
            >
              <Text style={styles.planTask}>{e.title}</Text>
              <Text style={styles.planMeta}>
                {e.date} · {e.time}
              </Text>
            </View>
          </Card>
        );
      })}
    </View>
  );
}
const styles = themedStyles((colors) => ({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  aiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  aiBadgeText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.primary,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textSecondary,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  materials: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    gap: spacing.md,
  },
  material: {
    width: 150,
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    ...shadow.soft,
  },
  materialIcon: {
    width: 36,
    height: 36,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  materialName: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.text,
  },
  materialPages: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  tools: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  tool: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    ...shadow.soft,
  },
  toolText: {
    fontSize: 12,
    fontWeight: '600',
  },
  generatedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
  },
  generatedText: {
    fontSize: 11.5,
    color: colors.textMuted,
    fontStyle: 'italic',
    flex: 1,
  },
  section: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  blockTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  concept: {
    backgroundColor: colors.primarySoft,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radii.pill,
  },
  conceptText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: colors.primary,
  },
  point: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
    alignItems: 'flex-start',
  },
  pointDot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  pointNum: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.primary,
  },
  pointText: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  counter: {
    fontSize: 12,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  flashcard: {
    minHeight: 190,
    backgroundColor: colors.surface,
    borderRadius: radii.xl,
    padding: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.card,
  },
  flashcardBack: {
    backgroundColor: colors.primary,
  },
  flashLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.textMuted,
    letterSpacing: 1,
    marginBottom: spacing.md,
  },
  flashText: {
    fontSize: 17,
    fontWeight: '600',
    color: colors.text,
    textAlign: 'center',
    lineHeight: 25,
  },
  flipHint: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.lg,
  },
  flipHintText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  flashNav: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.lg,
  },
  navBtn: {
    width: 52,
    height: 50,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navBtnPrimary: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 50,
    borderRadius: radii.md,
    backgroundColor: colors.primary,
  },
  navBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.white,
  },
  scoreBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.greenSoft,
    padding: spacing.md,
    borderRadius: radii.md,
    marginBottom: spacing.md,
  },
  scoreText: {
    fontSize: 14,
    fontWeight: '800',
    color: colors.green,
  },
  quizCard: {
    marginBottom: spacing.md,
  },
  quizQ: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.md,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    marginBottom: spacing.sm,
  },
  optionCorrect: {
    borderColor: colors.green,
    backgroundColor: colors.greenSoft,
  },
  optionWrong: {
    borderColor: colors.red,
    backgroundColor: colors.redSoft,
  },
  optionText: {
    fontSize: 14,
    color: colors.text,
  },
  planRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  planDay: {
    width: 46,
    height: 40,
    borderRadius: radii.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planDayText: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.white,
  },
  planTask: {
    flex: 1,
    fontSize: 13.5,
    color: colors.text,
    fontWeight: '500',
  },
  planMeta: {
    fontSize: 11.5,
    color: colors.textMuted,
    marginTop: 1,
  },
}));
