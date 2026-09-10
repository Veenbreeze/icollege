import { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, spacing, themedStyles } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { createEvent } from '@/lib/api/clubs';

export default function CreateEventScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventTime, setEventTime] = useState('');
  const [venue, setVenue] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!title.trim()) return Alert.alert('Title required', 'Give your event a name.');
    if (!eventDate.trim()) return Alert.alert('Date required', 'Enter a date in YYYY-MM-DD format.');
    setSubmitting(true);
    try {
      await createEvent({
        title: title.trim(),
        type: type.trim() || 'Event',
        eventDate: eventDate.trim(),
        eventTime: eventTime.trim(),
        venue: venue.trim(),
      });
      router.back();
    } catch (e) {
      Alert.alert('Could not create event', e.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="New Event" subtitle="Seminar, workshop…" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Field label="Event Title" placeholder="Study Skills Workshop" value={title} onChangeText={setTitle} />
        <Field label="Type" placeholder="Workshop, Seminar, Meetup…" value={type} onChangeText={setType} />
        <Field label="Date" placeholder="2026-10-15" value={eventDate} onChangeText={setEventDate} />
        <Field label="Time" placeholder="4:00 PM" value={eventTime} onChangeText={setEventTime} />
        <Field label="Venue" placeholder="Block C, Room C301" value={venue} onChangeText={setVenue} />

        <Button label={submitting ? 'Creating…' : 'Create Event'} color={colors.green} onPress={submit} style={{ marginTop: spacing.md }} />
        {submitting && <ActivityIndicator color={colors.green} style={{ marginTop: spacing.md }} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 120 },
}));
