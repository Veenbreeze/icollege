import { useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator } from 'react-native';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import {
  fetchCourses,
  createCourse,
  createNotice,
  createExam,
  createTimetableSlot,
} from '@/lib/api/admin';

const SUB = [
  { key: 'notice', label: 'Notice' },
  { key: 'exam', label: 'Exam' },
  { key: 'timetable', label: 'Timetable' },
  { key: 'course', label: 'Course' },
];

const CATEGORIES = ['Academic', 'Exams', 'Timetable', 'Events', 'Career'];
const PRIORITIES = ['Normal', 'Important', 'Critical'];
const EXAM_TYPES = ['Final', 'Mid-Semester', 'CAT / Test', 'Supplementary'];
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

/** Chip row for picking one value from a list. */
function ChipRow({ options, value, onChange, getValue }) {
  return (
    <View style={styles.chipRow}>
      {options.map((opt, i) => {
        const v = getValue ? getValue(opt, i) : opt;
        const active = value === v;
        return (
          <Pressable key={String(v)} style={[styles.chip, active && styles.chipActive]} onPress={() => onChange(v)}>
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Admin data-creation panel — create Notices, Exams, Timetable slots, Courses. */
export function ManagePanel() {
  const [sub, setSub] = useState('notice');
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(null); // { ok: boolean, msg: string }
  const { data: courses, isLoading: loadingCourses, refetch: refetchCourses } = useApi(fetchCourses);
  const courseList = courses ?? [];

  // form state (shared object keeps it simple)
  const [f, setF] = useState({
    // notice
    title: '', body: '', category: 'Academic', priority: 'Normal',
    // exam / timetable shared
    courseId: null, examType: 'Final', examDate: '', examTime: '', duration: '', venue: '', room: '',
    dayOfWeek: 1, startTime: '', endTime: '', slotType: 'Lecture',
    // course
    code: '', courseTitle: '', lecturerName: '',
  });
  const set = (k, v) => setF((prev) => ({ ...prev, [k]: v }));

  async function run(fn, successMsg) {
    setBusy(true);
    setStatus(null);
    try {
      await fn();
      setStatus({ ok: true, msg: successMsg });
    } catch (e) {
      setStatus({ ok: false, msg: e?.message ?? 'Something went wrong' });
    } finally {
      setBusy(false);
    }
  }

  const submitNotice = () => {
    if (!f.title.trim() || !f.body.trim()) return setStatus({ ok: false, msg: 'Title and body are required.' });
    return run(
      () => createNotice({ title: f.title.trim(), body: f.body.trim(), category: f.category, priority: f.priority }),
      'Notice published.',
    ).then(() => set('title', '') || set('body', ''));
  };

  const submitCourse = () => {
    if (!f.code.trim() || !f.courseTitle.trim()) return setStatus({ ok: false, msg: 'Course code and title are required.' });
    return run(
      () => createCourse({ code: f.code.trim(), title: f.courseTitle.trim(), lecturerName: f.lecturerName.trim() || undefined }),
      'Course created.',
    ).then(() => {
      set('code', ''); set('courseTitle', ''); set('lecturerName', '');
      refetchCourses();
    });
  };

  const submitExam = () => {
    if (!f.courseId) return setStatus({ ok: false, msg: 'Pick a course first.' });
    if (!f.examDate.trim() || !f.examTime.trim()) return setStatus({ ok: false, msg: 'Exam date and time are required.' });
    return run(
      () => createExam({
        courseId: f.courseId, type: f.examType, examDate: f.examDate.trim(), examTime: f.examTime.trim(),
        duration: f.duration.trim() || undefined, venue: f.venue.trim() || undefined, room: f.room.trim() || undefined,
      }),
      'Exam scheduled.',
    );
  };

  const submitSlot = () => {
    if (!f.courseId) return setStatus({ ok: false, msg: 'Pick a course first.' });
    if (!f.startTime.trim() || !f.endTime.trim()) return setStatus({ ok: false, msg: 'Start and end time are required.' });
    return run(
      () => createTimetableSlot({
        courseId: f.courseId, dayOfWeek: f.dayOfWeek, startTime: f.startTime.trim(), endTime: f.endTime.trim(),
        room: f.room.trim() || undefined, type: f.slotType.trim() || 'Lecture',
      }),
      'Timetable slot added.',
    );
  };

  const CoursePicker = () => (
    <>
      <Text style={styles.label}>Course</Text>
      {loadingCourses ? (
        <ActivityIndicator color={colors.primary} />
      ) : courseList.length === 0 ? (
        <Text style={styles.hint}>No courses yet — add one in the “Course” tab first.</Text>
      ) : (
        <ChipRow
          options={courseList.map((c) => c.code)}
          value={f.courseId}
          getValue={(_, i) => courseList[i].id}
          onChange={(v) => set('courseId', v)}
        />
      )}
    </>
  );

  return (
    <View>
      {/* sub-tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.subRow}>
        {SUB.map((s) => (
          <Pressable key={s.key} onPress={() => { setSub(s.key); setStatus(null); }} style={[styles.subTab, sub === s.key && styles.subTabActive]}>
            <Text style={[styles.subLabel, sub === s.key && styles.subLabelActive]}>{s.label}</Text>
          </Pressable>
        ))}
      </ScrollView>

      {status && (
        <View style={[styles.status, status.ok ? styles.statusOk : styles.statusErr]}>
          <Text style={[styles.statusText, { color: status.ok ? colors.green : colors.red }]}>{status.msg}</Text>
        </View>
      )}

      <Card style={styles.card}>
        {sub === 'notice' && (
          <>
            <Field label="Title" placeholder="e.g. Exam timetable released" value={f.title} onChangeText={(v) => set('title', v)} />
            <Field label="Body" placeholder="Notice details" value={f.body} onChangeText={(v) => set('body', v)} multiline />
            <Text style={styles.label}>Category</Text>
            <ChipRow options={CATEGORIES} value={f.category} onChange={(v) => set('category', v)} />
            <Text style={styles.label}>Priority</Text>
            <ChipRow options={PRIORITIES} value={f.priority} onChange={(v) => set('priority', v)} />
            <Button label={busy ? 'Publishing…' : 'Publish Notice'} onPress={submitNotice} style={styles.submit} />
          </>
        )}

        {sub === 'exam' && (
          <>
            <CoursePicker />
            <Text style={styles.label}>Type</Text>
            <ChipRow options={EXAM_TYPES} value={f.examType} onChange={(v) => set('examType', v)} />
            <Field label="Date (YYYY-MM-DD)" placeholder="2026-05-19" value={f.examDate} onChangeText={(v) => set('examDate', v)} />
            <Field label="Time" placeholder="09:00 AM" value={f.examTime} onChangeText={(v) => set('examTime', v)} />
            <Field label="Duration" placeholder="2h" value={f.duration} onChangeText={(v) => set('duration', v)} />
            <Field label="Venue" placeholder="Main Exam Hall" value={f.venue} onChangeText={(v) => set('venue', v)} />
            <Field label="Room" placeholder="Hall A" value={f.room} onChangeText={(v) => set('room', v)} />
            <Button label={busy ? 'Scheduling…' : 'Schedule Exam'} onPress={submitExam} style={styles.submit} />
          </>
        )}

        {sub === 'timetable' && (
          <>
            <CoursePicker />
            <Text style={styles.label}>Day</Text>
            <ChipRow options={DAYS} value={f.dayOfWeek} getValue={(_, i) => i} onChange={(v) => set('dayOfWeek', v)} />
            <Field label="Start time" placeholder="08:00" value={f.startTime} onChangeText={(v) => set('startTime', v)} />
            <Field label="End time" placeholder="10:00" value={f.endTime} onChangeText={(v) => set('endTime', v)} />
            <Field label="Room" placeholder="Block C, Room C301" value={f.room} onChangeText={(v) => set('room', v)} />
            <Field label="Type" placeholder="Lecture" value={f.slotType} onChangeText={(v) => set('slotType', v)} />
            <Button label={busy ? 'Adding…' : 'Add Timetable Slot'} onPress={submitSlot} style={styles.submit} />
          </>
        )}

        {sub === 'course' && (
          <>
            <Field label="Course code" placeholder="CSC 203" value={f.code} onChangeText={(v) => set('code', v)} autoCapitalize="characters" />
            <Field label="Course title" placeholder="Database Systems" value={f.courseTitle} onChangeText={(v) => set('courseTitle', v)} />
            <Field label="Lecturer name (optional)" placeholder="Dr. Rehema Salum" value={f.lecturerName} onChangeText={(v) => set('lecturerName', v)} />
            <Button label={busy ? 'Creating…' : 'Create Course'} onPress={submitCourse} style={styles.submit} />
          </>
        )}
      </Card>
    </View>
  );
}

const styles = themedStyles((colors) => ({
  subRow: { gap: spacing.sm, paddingBottom: spacing.md },
  subTab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill, backgroundColor: colors.surfaceMuted },
  subTabActive: { backgroundColor: colors.primary },
  subLabel: { fontSize: 12.5, fontWeight: '600', color: colors.textSecondary },
  subLabelActive: { color: colors.white },

  status: { padding: spacing.md, borderRadius: radii.md, marginBottom: spacing.md },
  statusOk: { backgroundColor: colors.greenSoft },
  statusErr: { backgroundColor: colors.redSoft },
  statusText: { fontSize: 13, fontWeight: '600' },

  card: { gap: spacing.xs },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm, marginTop: spacing.sm },
  hint: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm, marginBottom: spacing.sm },
  chip: { paddingHorizontal: spacing.md, paddingVertical: 7, borderRadius: radii.pill, backgroundColor: colors.surfaceMuted },
  chipActive: { backgroundColor: colors.primary },
  chipText: { fontSize: 12.5, fontWeight: '600', color: colors.textSecondary },
  chipTextActive: { color: colors.white },
  submit: { marginTop: spacing.md },
}));
