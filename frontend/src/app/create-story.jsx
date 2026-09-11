import { useState } from 'react';
import { View, Text, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { createStory } from '@/lib/api/reels';
import { appendFilePart } from '@/lib/media';

export default function CreateStoryScreen() {
  const router = useRouter();
  const [media, setMedia] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  async function pickMedia() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission needed', 'Allow photo library access to pick a story.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images', 'videos'], quality: 0.8 });
    if (!result.canceled) setMedia(result.assets[0]);
  }

  async function submit() {
    if (!media) return Alert.alert('Add media', 'Pick a photo or video for your story.');
    setSubmitting(true);
    try {
      const form = new FormData();
      const isVideo = media.type === 'video';
      await appendFilePart(form, 'media', media, {
        fallbackName: isVideo ? 'story.mp4' : 'story.jpg',
        fallbackType: isVideo ? 'video/mp4' : 'image/jpeg',
      });
      await createStory(form);
      if (router.canGoBack()) router.back();
      else router.replace('/reels');
    } catch (e) {
      Alert.alert('Could not post story', e.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="New Story" subtitle="Visible for 24 hours" />
      <View style={styles.content}>
        {media ? (
          <View style={styles.previewWrap}>
            {media.type === 'video' ? (
              <View style={[styles.preview, styles.videoPlaceholder]}>
                <Ionicons name="play-circle" size={48} color={colors.white} />
                <Text style={styles.videoPlaceholderLabel}>{media.fileName ?? 'Video selected'}</Text>
              </View>
            ) : (
              <Image source={{ uri: media.uri }} style={styles.preview} />
            )}
            <Pressable style={styles.removeMedia} onPress={() => setMedia(null)} hitSlop={8}>
              <Ionicons name="close" size={16} color={colors.white} />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.pickButton} onPress={pickMedia}>
            <Ionicons name="aperture-outline" size={32} color={colors.orange} />
            <Text style={styles.pickLabel}>Choose a photo or video</Text>
          </Pressable>
        )}

        <Button label={submitting ? 'Posting…' : 'Share to Story'} color={colors.orange} onPress={submit} style={{ marginTop: spacing.lg }} />
        {submitting && <ActivityIndicator color={colors.orange} style={{ marginTop: spacing.md }} />}
      </View>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg },
  pickButton: {
    height: 320, alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  pickLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  previewWrap: { borderRadius: radii.lg, overflow: 'hidden' },
  preview: { width: '100%', height: 320, backgroundColor: '#000' },
  videoPlaceholder: { alignItems: 'center', justifyContent: 'center', gap: spacing.sm },
  videoPlaceholderLabel: { fontSize: 13, color: colors.white, fontWeight: '600' },
  removeMedia: { position: 'absolute', top: spacing.sm, right: spacing.sm, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radii.pill, padding: 6 },
}));
