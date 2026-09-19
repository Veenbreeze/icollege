import { useState } from 'react';
import { View, Text, TextInput, Pressable, Image, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Button } from '@/components/ui/Button';
import { createReel } from '@/lib/api/reels';
import { appendFilePart } from '@/lib/media';
import { VideoPlayer } from '@/components/media/VideoPlayer';

export default function CreateReelScreen() {
  const router = useRouter();
  const [media, setMedia] = useState(null);
  const [caption, setCaption] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function pickMedia() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission needed', 'Allow photo library access to pick a video.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['videos', 'images'], quality: 0.8 });
    if (!result.canceled) setMedia(result.assets[0]);
  }

  async function submit() {
    if (!media) return Alert.alert('Add media', 'Pick a video or photo for your reel.');
    setSubmitting(true);
    try {
      const form = new FormData();
      form.append('caption', caption.trim());
      const isVideo = media.type === 'video';
      await appendFilePart(form, 'media', media, {
        fallbackName: isVideo ? 'reel.mp4' : 'reel.jpg',
        fallbackType: isVideo ? 'video/mp4' : 'image/jpeg',
      });
      await createReel(form);
      if (router.canGoBack()) router.back();
      else router.replace('/reels');
    } catch (e) {
      Alert.alert('Could not post reel', e.message ?? 'Something went wrong');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="New Reel" />
      <View style={styles.content}>
        {media ? (
          <View style={styles.previewWrap}>
            {media.type === 'video' ? (
              <VideoPlayer uri={media.uri} isActive muted loop style={styles.preview} />
            ) : (
              <Image source={{ uri: media.uri }} style={styles.preview} />
            )}
            <Pressable style={styles.removeMedia} onPress={() => setMedia(null)} hitSlop={8}>
              <Ionicons name="close" size={16} color={colors.white} />
            </Pressable>
          </View>
        ) : (
          <Pressable style={styles.pickButton} onPress={pickMedia}>
            <Ionicons name="videocam-outline" size={32} color={colors.red} />
            <Text style={styles.pickLabel}>Choose a video or photo</Text>
          </Pressable>
        )}

        <Text style={styles.label}>Caption</Text>
        <TextInput
          style={styles.captionInput}
          placeholder="Write a caption…"
          placeholderTextColor={colors.textMuted}
          value={caption}
          onChangeText={setCaption}
          multiline
        />

        <Button label={submitting ? 'Posting…' : 'Share Reel'} color={colors.red} onPress={submit} style={{ marginTop: spacing.lg }} />
        {submitting && <ActivityIndicator color={colors.red} style={{ marginTop: spacing.md }} />}
      </View>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { flex: 1, padding: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  pickButton: {
    height: 220, alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    borderWidth: 1.5, borderColor: colors.border, borderStyle: 'dashed', borderRadius: radii.lg,
    backgroundColor: colors.surface, marginBottom: spacing.lg,
  },
  pickLabel: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },
  previewWrap: { borderRadius: radii.lg, overflow: 'hidden', marginBottom: spacing.lg },
  preview: { width: '100%', height: 220, backgroundColor: '#000' },
  removeMedia: { position: 'absolute', top: spacing.sm, right: spacing.sm, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: radii.pill, padding: 6 },
  captionInput: {
    minHeight: 80, textAlignVertical: 'top', padding: spacing.lg, fontSize: 15, color: colors.text,
    backgroundColor: colors.surface, borderWidth: 1.5, borderColor: colors.border, borderRadius: radii.md,
  },
}));
