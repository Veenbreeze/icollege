import { useState } from 'react';
import { View, Text, ScrollView, Pressable, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow, themedStyles } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import { fetchChambers, createPost } from '@/lib/api/community';
import { appendFilePart } from '@/lib/media';

export default function CreatePostScreen() {
  const router = useRouter();
  const { data: chambers } = useApi(fetchChambers);
  const [chamberSlug, setChamberSlug] = useState(null);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [image, setImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const activeSlug = chamberSlug ?? chambers?.[0]?.id ?? null;

  async function pickImage() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission needed', 'Allow photo library access to attach an image.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 });
    if (!result.canceled) setImage(result.assets[0]);
  }

  async function submit() {
    if (!activeSlug) return Alert.alert('Pick a chamber', 'Choose which chamber to post in.');
    if (!title.trim()) return Alert.alert('Title required', 'Give your post a title.');
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('title', title.trim());
      form.append('body', body.trim());
      if (image) await appendFilePart(form, 'image', image, { fallbackName: 'photo.jpg', fallbackType: 'image/jpeg' });
      await createPost(activeSlug, form);
      // Go back if we came from somewhere; otherwise land on the chamber so the new post is visible.
      if (router.canGoBack()) router.back();
      else router.replace(`/chamber/${activeSlug}`);
    } catch (e) {
      Alert.alert('Could not post', e.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="New Post" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Chamber</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chamberRow}>
          {(chambers ?? []).map((c) => (
            <Pressable
              key={c.id}
              onPress={() => setChamberSlug(c.id)}
              style={[styles.chamberChip, activeSlug === c.id && styles.chamberChipActive]}
            >
              <Text style={styles.chamberEmoji}>{c.emoji}</Text>
              <Text style={[styles.chamberLabel, activeSlug === c.id && styles.chamberLabelActive]}>{c.name}</Text>
            </Pressable>
          ))}
        </ScrollView>

        <Field label="Title" placeholder="What's on your mind?" value={title} onChangeText={setTitle} />

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

        <Button label={submitting ? 'Posting…' : 'Post'} onPress={submit} style={{ marginTop: spacing.lg }} />
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
