import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';
import { ClaySurface } from '@/components/ui/ClaySurface';
import { useAuth } from '@/lib/auth/AuthContext';
import { ApiError } from '@/lib/api/client';
export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { login } = useAuth();
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const onSubmit = async () => {
    if (!studentId || !password) {
      setError('Enter your student ID and password.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      await login(studentId.trim(), password);
      router.replace('/(tabs)');
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };
  return (
    <SafeAreaView style={styles.safe} edges={['bottom']}>
      <StatusBar style="light" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {/* Brand hero */}
        <LinearGradient
          colors={[colors.primaryLight, colors.primary, colors.primaryDark]}
          start={{
            x: 0.1,
            y: 0,
          }}
          end={{
            x: 0.9,
            y: 1,
          }}
          style={[
            styles.hero,
            {
              paddingTop: insets.top + spacing.xxl,
            },
          ]}
        >
          <View style={styles.heroGlowA} />
          <View style={styles.heroGlowB} />
          <ClaySurface radius={radii.xxl} style={styles.logoBadge}>
            <Ionicons name="school" size={32} color={colors.primary} />
          </ClaySurface>
          <Text style={styles.logoText}>iCollege</Text>
          <Text style={styles.tagline}>Your Campus. Your Community. Your Future.</Text>
        </LinearGradient>

        {/* Form sheet, floated up to overlap the hero */}
        <View style={styles.sheetWrap}>
          <ClaySurface radius={radii.xxl} style={styles.sheet}>
            <Text style={styles.title}>Welcome back</Text>
            <Text style={styles.subtitle}>Sign in with your university credentials</Text>

            <View
              style={{
                marginTop: spacing.xl,
              }}
            >
              <Field
                label="Student / Registration Number"
                icon="person-outline"
                placeholder="ICU/2024/00458"
                autoCapitalize="characters"
                value={studentId}
                onChangeText={setStudentId}
              />
              <Field
                label="Password"
                icon="lock-closed-outline"
                placeholder="Enter your password"
                password
                value={password}
                onChangeText={setPassword}
              />

              {error && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={15} color={colors.red} />
                  <Text style={styles.error}>{error}</Text>
                </View>
              )}

              <View style={styles.row}>
                <Pressable style={styles.remember} onPress={() => setRemember((r) => !r)} hitSlop={6}>
                  <View style={[styles.checkbox, remember && styles.checkboxOn]}>
                    {remember && <Ionicons name="checkmark" size={13} color={colors.white} />}
                  </View>
                  <Text style={styles.rememberText}>Remember me</Text>
                </Pressable>
                <Pressable onPress={() => router.push('/auth/forgot')} hitSlop={8}>
                  <Text style={styles.link}>Forgot password?</Text>
                </Pressable>
              </View>

              {submitting ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={{
                    marginTop: spacing.sm,
                  }}
                />
              ) : (
                <Button
                  label="Log In"
                  icon="log-in-outline"
                  style={{
                    marginTop: spacing.sm,
                  }}
                  onPress={onSubmit}
                />
              )}
            </View>
          </ClaySurface>

          <Pressable onPress={() => router.push('/auth/signup')} hitSlop={8} style={styles.signupRow}>
            <Text style={styles.footerText}>New here? </Text>
            <Text style={styles.link}>Create an account</Text>
          </Pressable>

          <View style={styles.footer}>
            <Text style={styles.footerText}>Having trouble signing in? Contact your registrar's office.</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = themedStyles((colors) => ({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  content: {
    paddingBottom: spacing.xxl,
  },
  hero: {
    alignItems: 'center',
    paddingBottom: spacing.xxxl + spacing.xxl,
    paddingHorizontal: spacing.xl,
    overflow: 'hidden',
  },
  heroGlowA: {
    position: 'absolute',
    top: -60,
    right: -40,
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: 'rgba(255,255,255,0.10)',
  },
  heroGlowB: {
    position: 'absolute',
    bottom: -30,
    left: -50,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  logoBadge: {
    width: 72,
    height: 72,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.white,
    letterSpacing: 0.2,
  },
  tagline: {
    fontSize: 12.5,
    color: 'rgba(255,255,255,0.85)',
    marginTop: 4,
    fontWeight: '600',
  },
  sheetWrap: {
    marginTop: -spacing.xxl - spacing.md,
    paddingHorizontal: spacing.xl,
  },
  sheet: {
    backgroundColor: colors.surface,
    padding: spacing.xl,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13.5,
    color: colors.textSecondary,
    marginTop: 4,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.redSoft,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginTop: -spacing.sm,
    marginBottom: spacing.md,
  },
  error: {
    flex: 1,
    fontSize: 12.5,
    color: colors.red,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  remember: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 1.5,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxOn: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  rememberText: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  link: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primary,
  },
  signupRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
  footer: {
    alignItems: 'center',
    marginTop: spacing.xxl,
    paddingHorizontal: spacing.lg,
  },
  footerText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
  },
}));
