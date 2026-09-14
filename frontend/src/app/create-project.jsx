import { useState } from 'react';
import { View, Text, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { createProject } from '@/lib/api/career';

export default function CreateProjectScreen() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [skills, setSkills] = useState('');
  const [neededCount, setNeededCount] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function submit() {
    if (!title.trim()) return Alert.alert('Title required', 'Give your project a name.');
    setSubmitting(true);
    try {
      await createProject({
        title: title.trim(),
        tagline: tagline.trim(),
        skills: skills.split(',').map((s) => s.trim()).filter(Boolean),
        neededCount: Number(neededCount) || 0,
      });
      if (router.canGoBack()) router.back();
      else router.replace('/career');
    } catch (e) {
      Alert.alert('Could not create project', e.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="New Project" subtitle="Recruit teammates" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <Field label="Project Title" placeholder="Campus Ride-Share App" value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Tagline</Text>
        <TextInput
          style={styles.textarea}
          placeholder="What is this project about?"
          placeholderTextColor={colors.textMuted}
          value={tagline}
          onChangeText={setTagline}
          multiline
        />

        <Field label="Skills needed (comma separated)" placeholder="React Native, Firebase, UI/UX" value={skills} onChangeText={setSkills} />
        <Field label="Teammates needed" placeholder="4" keyboardType="number-pad" value={neededCount} onChangeText={setNeededCount} />

        <Button label={submitting ? 'Creating…' : 'Create Project'} color={colors.blue} onPress={submit} style={{ marginTop: spacing.md }} />
        {submitting && <ActivityIndicator color={colors.blue} style={{ marginTop: spacing.md }} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 120 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  textarea: {
    minHeight: 80, textAlignVertical: 'top', padding: spacing.lg, fontSize: 15, color: colors.text,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
}));
