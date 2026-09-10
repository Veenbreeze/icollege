import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ClaySurface } from '@/components/ui/ClaySurface';
import { forgotPassword } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

export default function ForgotScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [studentId, setStudentId] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (!studentId) {
      setError('Enter your student / registration number.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const { devCode } = await forgotPassword(studentId.trim());
      router.push({
        pathname: '/auth/verify',
        params: {
          studentId: studentId.trim(),
          devCode: devCode ?? '',
        },
      });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <LinearGradient
          colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
          start={{ x: 0.1, y: 0 }}
          end={{ x: 0.9, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.lg }]}
        >
          <View style={styles.heroGlowA} />
          <View style={styles.heroGlowB} />
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.white} />
          </Pressable>
          <ClaySurface radius={radii.xl} style={styles.logoBadge}>
            <Ionicons name="lock-open" size={26} color={colors.primary} />
          </ClaySurface>
          <Text style={styles.heroTitle}>Reset password</Text>
          <Text style={styles.heroSubtitle}>We will send a one-time code to verify it is you</Text>
        </LinearGradient>

        <View style={styles.sheetWrap}>
          <ClaySurface radius={radii.xxl} style={styles.sheet}>
            <Field
              label="Student / Registration Number"
              icon="id-card-outline"
              placeholder="ICU/2024/00458"
              autoCapitalize="characters"
              value={studentId}
              onChangeText={setStudentId}
            />

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={15} color={colors.red} />
                <Text style={styles.error}>{error}</Text>
              </View>
            )}

            {submitting ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.sm }} />
            ) : (
              <Button label="Send Reset Code" icon="paper-plane-outline" onPress={onSubmit} style={{ marginTop: spacing.sm }} />
            )}
          </ClaySurface>

          <Pressable onPress={() => router.replace('/auth/login')} hitSlop={8} style={styles.loginRow}>
            <Text style={styles.footerText}>Remembered it? </Text>
            <Text style={styles.link}>Back to log in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingBottom: spacing.xxl },
  hero: {
    alignItems: 'center',
    paddingBottom: spacing.xxl,
    paddingHorizontal: spacing.xl,
    overflow: 'hidden',
  },
  heroGlowA: {
    position: 'absolute', top: -60, right: -40, width: 180, height: 180, borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroGlowB: {
    position: 'absolute', bottom: -30, left: -50, width: 140, height: 140, borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  backBtn: {
    position: 'absolute', left: spacing.lg, top: spacing.lg,
    width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  logoBadge: {
    width: 60, height: 60, backgroundColor: colors.white,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md, marginTop: spacing.lg,
  },
  heroTitle: { fontSize: 22, fontWeight: '800', color: colors.white },
  heroSubtitle: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: '600', textAlign: 'center', paddingHorizontal: spacing.lg },
  sheetWrap: { marginTop: -spacing.xl, paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.surface, padding: spacing.xl },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.redSoft, borderRadius: radii.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.md,
  },
  error: { flex: 1, fontSize: 12.5, color: colors.red, fontWeight: '600' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontSize: 14, color: colors.textSecondary },
  link: { fontSize: 14, fontWeight: '700', color: colors.primary },
}));
