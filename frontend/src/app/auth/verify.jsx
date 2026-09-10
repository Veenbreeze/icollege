import { useRef, useState } from 'react';
import { View, Text, ScrollView, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ClaySurface } from '@/components/ui/ClaySurface';
import { forgotPassword, resetPassword } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';
const LEN = 6;
export default function VerifyScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { studentId, devCode } = useLocalSearchParams();
  const [code, setCode] = useState(Array(LEN).fill(''));
  const inputs = useRef([]);
  const [newPassword, setNewPassword] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);
  const setDigit = (i, v) => {
    const d = v.replace(/[^0-9]/g, '').slice(-1);
    const next = [...code];
    next[i] = d;
    setCode(next);
    if (d && i < LEN - 1) inputs.current[i + 1]?.focus();
  };
  const onKey = (i, key) => {
    if (key === 'Backspace' && !code[i] && i > 0) inputs.current[i - 1]?.focus();
  };
  const filled = code.every((c) => c !== '');
  const onSubmit = async () => {
    if (!filled || newPassword.length < 8) {
      setError('Enter the 6-digit code and a password with at least 8 characters.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await resetPassword(studentId, code.join(''), newPassword);
      router.replace('/auth/login');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  const onResend = async () => {
    setResending(true);
    try {
      await forgotPassword(studentId);
    } finally {
      setResending(false);
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
            <Ionicons name="shield-checkmark" size={26} color={colors.primary} />
          </ClaySurface>
          <Text style={styles.heroTitle}>Enter reset code</Text>
          <Text style={styles.heroSubtitle}>We emailed a 6-digit code for {studentId}</Text>
        </LinearGradient>

        <View style={styles.sheetWrap}>
          <ClaySurface radius={radii.xxl} style={styles.sheet}>
            {!!devCode && (
              <View style={styles.devBanner}>
                <Ionicons name="construct-outline" size={14} color={colors.orange} />
                <Text style={styles.devBannerText}>Email isn&apos;t configured yet, so your code is shown here for testing: {devCode}.</Text>
              </View>
            )}

            <View style={styles.otpRow}>
              {code.map((d, i) => (
                <TextInput
                  key={i}
                  ref={(r) => {
                    inputs.current[i] = r;
                  }}
                  style={[styles.otpBox, d && styles.otpBoxFilled]}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={d}
                  onChangeText={(v) => setDigit(i, v)}
                  onKeyPress={({ nativeEvent }) => onKey(i, nativeEvent.key)}
                />
              ))}
            </View>

            {filled && (
              <View style={{ marginTop: spacing.lg }}>
                <Field
                  label="New password"
                  icon="lock-closed-outline"
                  placeholder="At least 8 characters"
                  password
                  value={newPassword}
                  onChangeText={setNewPassword}
                />
              </View>
            )}

            {error && <Text style={styles.error}>{error}</Text>}

            {submitting ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
            ) : (
              <Button
                label="Reset Password"
                icon="checkmark-circle-outline"
                onPress={onSubmit}
                style={{ opacity: filled && newPassword.length >= 8 ? 1 : 0.6, marginTop: spacing.xl }}
              />
            )}

            <View style={styles.resend}>
              <Text style={styles.resendText}>Didn&apos;t get the code? </Text>
              <Pressable hitSlop={8} onPress={onResend} disabled={resending}>
                <Text style={styles.link}>{resending ? 'Sending…' : 'Resend'}</Text>
              </Pressable>
            </View>
          </ClaySurface>
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
  devBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.orangeSoft,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.lg,
  },
  devBannerText: {
    flex: 1,
    fontSize: 12,
    color: colors.orange,
    fontWeight: '600',
  },
  error: {
    fontSize: 13,
    color: colors.red,
    marginTop: spacing.md,
    fontWeight: '600',
  },
  otpRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  otpBox: {
    width: 48,
    height: 58,
    borderRadius: radii.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  otpBoxFilled: {
    borderColor: colors.primary,
    backgroundColor: colors.surfaceMuted,
  },
  resend: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  resendText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  link: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
}));
