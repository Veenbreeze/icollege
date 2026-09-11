import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { Avatar } from '@/components/ui/Avatar';
import { ClaySurface } from '@/components/ui/ClaySurface';
import { useAuth } from '@/lib/auth/AuthContext';
import { resolveMediaUrl, ApiError } from '@/lib/api/client';
import { initialsOf } from '@/lib/initials';
import { appendFilePart } from '@/lib/media';

export default function EditProfileScreen() {
  const router = useRouter();
  const { user, updateProfile, uploadAvatar } = useAuth();
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [error, setError] = useState(null);
  const [savingAvatar, setSavingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!user) return null;

  async function pickAvatar() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) return Alert.alert('Permission needed', 'Allow photo library access to change your photo.');
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8 });
    if (result.canceled) return;
    const asset = result.assets[0];
    setSavingAvatar(true);
    try {
      const form = new FormData();
      await appendFilePart(form, 'avatar', asset, { fallbackName: 'avatar.jpg', fallbackType: 'image/jpeg' });
      await uploadAvatar(form);
    } catch (e) {
      Alert.alert('Could not update photo', e.message ?? 'Something went wrong');
    } finally {
      setSavingAvatar(false);
    }
  }

  async function submit() {
    setError(null);
    setSaving(true);
    try {
      await updateProfile({ fullName: fullName.trim(), username: username.trim(), email: email.trim(), phone: phone.trim() });
      if (router.canGoBack()) router.back();
      else router.replace('/profile');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Edit Profile" />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.avatarSection}>
          <Pressable onPress={pickAvatar} style={styles.avatarWrap}>
            <Avatar initials={initialsOf(user.fullName)} uri={resolveMediaUrl(user.avatarUrl)} size={100} ring />
            <ClaySurface radius={18} style={styles.cameraBadge}>
              {savingAvatar ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Ionicons name="camera" size={17} color={colors.primary} />
              )}
            </ClaySurface>
          </Pressable>
          <Text style={styles.avatarHint}>Tap to change photo</Text>
        </View>

        <Field label="Username" icon="at-outline" placeholder="e.g. danielm" autoCapitalize="none" value={username} onChangeText={setUsername} />
        <Field label="Full Name" icon="person-outline" placeholder="Your full name" value={fullName} onChangeText={setFullName} />
        <Field label="Email" icon="mail-outline" placeholder="you@icu.ac.tz" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
        <Field label="Phone" icon="call-outline" placeholder="+255 7xx xxx xxx" keyboardType="phone-pad" value={phone} onChangeText={setPhone} />

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={15} color={colors.red} />
            <Text style={styles.error}>{error}</Text>
          </View>
        )}

        {saving ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.sm }} />
        ) : (
          <Button label="Save Changes" icon="checkmark-outline" onPress={submit} style={{ marginTop: spacing.sm }} />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.xl, paddingBottom: spacing.xxxl },
  avatarSection: { alignItems: 'center', marginBottom: spacing.xl },
  avatarWrap: { position: 'relative' },
  cameraBadge: {
    position: 'absolute', bottom: -4, right: -4, width: 36, height: 36,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },
  avatarHint: { fontSize: 12.5, color: colors.textMuted, marginTop: spacing.md },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.redSoft, borderRadius: radii.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.md,
  },
  error: { flex: 1, fontSize: 12.5, color: colors.red, fontWeight: '600' },
}));
