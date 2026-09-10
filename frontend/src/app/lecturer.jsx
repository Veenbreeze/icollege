import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import { fetchMyCourses, postNotice, postLectureUpdate, requestTimetableChange } from '@/lib/api/lecturer';

export default function LecturerConsoleScreen() {
  const { data: courses, isLoading, refetch } = useApi(fetchMyCourses);
  const [activeCourseId, setActiveCourseId] = useState(null);
  const [noticeTitle, setNoticeTitle] = useState('');
  const [noticeBody, setNoticeBody] = useState('');
  const [changeMessage, setChangeMessage] = useState('');
  const [busy, setBusy] = useState(false);

  const activeCourse = (courses ?? []).find((c) => c.id === activeCourseId) ?? courses?.[0];

  async function sendNotice() {
    if (!noticeTitle.trim() || !noticeBody.trim()) return Alert.alert('Missing info', 'Add a title and body.');
    setBusy(true);
    try {
      await postNotice({ title: noticeTitle.trim(), body: noticeBody.trim(), courseId: activeCourse?.id });
      setNoticeTitle('');
      setNoticeBody('');
      Alert.alert('Announcement posted');
    } catch (e) {
      Alert.alert('Could not post', e.message);
    } finally {
      setBusy(false);
    }
  }

  async function markCancelled() {
    if (!activeCourse) return;
    setBusy(true);
    try {
      const slot = activeCourse.timetable_slot_id;
      if (!slot) return Alert.alert('No timetable slot found for this course');
      await postLectureUpdate({ timetableSlotId: slot, date: new Date().toISOString().slice(0, 10), status: 'cancelled', note: 'Cancelled by lecturer' });
      Alert.alert('Lecture marked as cancelled');
    } catch (e) {
      Alert.alert('Could not update', e.message);
    } finally {
      setBusy(false);
    }
  }

  async function sendChangeRequest() {
    if (!activeCourse || !changeMessage.trim()) return Alert.alert('Missing info', 'Describe the change you need.');
    setBusy(true);
    try {
      await requestTimetableChange({ courseId: activeCourse.id, message: changeMessage.trim() });
      setChangeMessage('');
      Alert.alert('Request sent to admin');
    } catch (e) {
      Alert.alert('Could not send request', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Lecturer Console" subtitle="Manage your classes" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? <ActivityIndicator color={colors.primary} /> : (
          <>
            <Text style={styles.label}>My Courses</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.courseRow}>
              {(courses ?? []).map((c) => (
                <Pressable key={c.id} onPress={() => setActiveCourseId(c.id)} style={[styles.courseChip, activeCourse?.id === c.id && styles.courseChipActive]}>
                  <Text style={[styles.courseLabel, activeCourse?.id === c.id && styles.courseLabelActive]}>{c.code}</Text>
                </Pressable>
              ))}
              {(courses ?? []).length === 0 && <Text style={styles.empty}>No courses assigned yet.</Text>}
            </ScrollView>

            {activeCourse && (
              <Card style={styles.card}>
                <Text style={styles.courseTitle}>{activeCourse.title}</Text>
                <Button label="Mark Today's Lecture Cancelled" variant="outline" onPress={markCancelled} style={{ marginTop: spacing.md }} />
              </Card>
            )}

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Post Announcement</Text>
              <TextInput style={styles.input} placeholder="Title" placeholderTextColor={colors.textMuted} value={noticeTitle} onChangeText={setNoticeTitle} />
              <TextInput style={[styles.input, styles.textarea]} placeholder="Message" placeholderTextColor={colors.textMuted} value={noticeBody} onChangeText={setNoticeBody} multiline />
              <Button label={busy ? 'Posting…' : 'Post to Students'} onPress={sendNotice} style={{ marginTop: spacing.md }} />
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Request Timetable Change</Text>
              <TextInput style={[styles.input, styles.textarea]} placeholder="Describe the change you need…" placeholderTextColor={colors.textMuted} value={changeMessage} onChangeText={setChangeMessage} multiline />
              <Button label={busy ? 'Sending…' : 'Send Request'} variant="outline" onPress={sendChangeRequest} style={{ marginTop: spacing.md }} />
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 120 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  courseRow: { marginBottom: spacing.lg },
  courseChip: { backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill, marginRight: spacing.sm },
  courseChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  courseLabel: { fontSize: 13, fontWeight: '700', color: colors.textSecondary },
  courseLabelActive: { color: colors.primary },
  courseTitle: { fontSize: 15, fontWeight: '700', color: colors.text },
  card: { marginBottom: spacing.lg },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: 14, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.sm,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  empty: { color: colors.textMuted, fontSize: 13 },
}));
