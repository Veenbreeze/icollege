import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radii, spacing, shadow, themedStyles } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import { fetchChambers, createPost, joinChamber } from '@/lib/api/community';
import { appendFilePart } from '@/lib/media';

export default function CreatePostScreen() {
  const router = useRouter();
  const { tag: requestedTag } = useLocalSearchParams();
  const isDiscussion = requestedTag === 'question';
  const { data: chambers, isLoading: loadingChambers, error: chambersError, refetch } = useApi(fetchChambers);
  const [chamberSlug, setChamberSlug] = useState(null);
  const [joinedSlug, setJoinedSlug] = useState(null);
  const [joining, setJoining] = useState(false);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const activeSlug = chamberSlug ?? chambers?.find((chamber) => chamber.joined)?.id ?? null;
  const activeChamber = chambers?.find((chamber) => chamber.id === activeSlug);
  const activeChamberJoined = Boolean(activeChamber?.joined || joinedSlug === activeSlug);

  async function joinSelectedChamber() {
    if (!activeSlug || joining) return;
    setJoining(true);
    try {
      const result = await joinChamber(activeSlug);
      if (!result.joined) throw new Error('Could not join this chamber. Please try again.');
      setJoinedSlug(activeSlug);
      refetch();
    } catch (e) {
      Alert.alert('Could not join chamber', e.message ?? 'Please try again.');
    } finally {
      setJoining(false);
    }
  }

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission needed', 'Allow photo library access to attach an image.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0]);
  }

  async function submit() {
    if (!activeSlug) return Alert.alert('Choose a chamber', 'Select a chamber to share your post.');
    if (!activeChamberJoined) return Alert.alert('Join this chamber', 'Join the selected chamber before posting.');
    if (!title.trim()) return Alert.alert('Title required', 'Give your post a title.');
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('title', title.trim());
      form.append('body', body.trim());
      if (isDiscussion) form.append('tag', 'question');
      if (image) await appendFilePart(form, 'image', image, { fallbackName: 'photo.jpg', fallbackType: 'image/jpeg' });
      await createPost(activeSlug, form);
      router.replace(`/chamber/${activeSlug}`);
    } catch (e) {
      Alert.alert('Could not post', e.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title={isDiscussion ? 'New Discussion' : 'New Post'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Choose a chamber</Text>
        {loadingChambers && <ActivityIndicator color={colors.primary} style={{ marginBottom: spacing.md }} />}
        {chambersError && <Text style={styles.helper}>{chambersError}</Text>}
        {!loadingChambers && !chambersError && chambers?.length === 0 && (
          <Text style={styles.helper}>No chambers are available for your university yet.</Text>
        )}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chamberRow}>
          {(chambers ?? []).map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setChamberSlug(c.id)}
              style={[styles.chamberChip, activeSlug === c.id && styles.chamberChipActive]}
            >
              <Text style={styles.chamberEmoji}>{c.emoji}</Text>
              <View>
                <Text style={[styles.chamberLabel, activeSlug === c.id && styles.chamberLabelActive]}>{c.name}</Text>
                <Text style={styles.chamberHint}>{c.joined || joinedSlug === c.id ? 'Joined' : 'Recommended'}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {activeChamber && !activeChamberJoined && (
          <Pressable style={styles.joinButton} onPress={joinSelectedChamber} disabled={joining}>
            {joining ? <ActivityIndicator color={colors.primary} size="small" /> : <Ionicons name="people-outline" size={17} color={colors.primary} />}
            <Text style={styles.joinText}>{joining ? 'Joining…' : `Join ${activeChamber.name}`}</Text>
          </Pressable>
        )}

        <Field label={isDiscussion ? 'Question or topic' : 'Title'} placeholder={isDiscussion ? 'What would you like to discuss?' : "What's on your mind?"} value={title} onChangeText={setTitle} />

        <Text style={styles.label}>Details</Text>
        <TextInput
          style={styles.bodyInput}
          placeholder="Add more context (optional)"
          placeholderTextColor={colors.textMuted}
          value={body}
          onChangeText={setBody}
          multiline
          textAlignVertical="top"
        />

        {image ? (
          <View style={styles.imagePreviewWrap}>
            <Image source={{ uri: image.uri }} style={styles.imagePreview} />
            <Pressable style={styles.removeImage} onPress={() => setImage(null)} hitSlop={8}>
              <Ionicons name="close" size={16} color={colors.white} />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.attachButton} onPress={pickImage}>
            <Ionicons name="image-outline" size={20} color={colors.primary} />
            <Text style={styles.attachLabel}>Add a photo</Text>
          </Pressable>
        )}

        <Button label={submitting ? 'Posting…' : isDiscussion ? 'Start Discussion' : 'Post'} onPress={submit} style={{ marginTop: spacing.lg }} disabled={!activeChamberJoined || submitting} />
        {submitting && <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.md }} />}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 120 },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  chamberRow: { marginBottom: spacing.lg },
  chamberChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill, marginRight: spacing.sm,
  },
  chamberChipActive: { backgroundColor: colors.primarySoft, borderColor: colors.primary },
  chamberEmoji: { fontSize: 15 },
  chamberLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  chamberLabelActive: { color: colors.primary },
  chamberHint: { fontSize: 10, color: colors.textMuted, marginTop: 2 },
  helper: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.md },
  joinButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, borderWidth: 1, borderColor: colors.primary, borderRadius: radii.md, paddingVertical: spacing.md, marginTop: -spacing.md, marginBottom: spacing.lg },
  joinText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  bodyInput: {
    height: 100, textAlignVertical: 'top', padding: spacing.lg, fontSize: 15, color: colors.text,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: radii.md,
    marginBottom: spacing.lg,
  },
  attachButton: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radii.md,
    paddingVertical: spacing.lg, backgroundColor: colors.surface,
  },
  attachLabel: { fontSize: 14, fontWeight: '600', color: colors.primary },
  imagePreviewWrap: { borderRadius: radii.lg, overflow: 'hidden', ...shadow.soft },
  imagePreview: { width: '100%', height: 200, backgroundColor: colors.surfaceMuted },
  removeImage: {
    position: 'absolute', top: spacing.sm, right: spacing.sm, backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: radii.pill, padding: 6,
  },
}));
