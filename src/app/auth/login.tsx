import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing , themedStyles } from '@/theme';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export default function LoginScreen() {
  const router = useRouter();
  const [remember, setRemember] = useState(true);

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Brand */}
        <View style={styles.brand}>
          <View style={styles.logoBadge}>
            <Ionicons name="school" size={30} color={colors.white} />
          </View>
          <Text style={styles.logoText}>iCollege</Text>
          <Text style={styles.tagline}>Your Campus. Your Community. Your Future.</Text>
        </View>

        <Text style={styles.title}>Welcome back 👋</Text>
        <Text style={styles.subtitle}>Sign in to continue to your campus</Text>

        <View style={{ marginTop: spacing.xl }}>
          <Field label="Student ID / Email / Phone" icon="person-outline" placeholder="ICU/2024/00458" autoCapitalize="none" />
          <Field label="Password" icon="lock-closed-outline" placeholder="Enter your password" password />

          <View style={styles.row}>
            <Pressable style={styles.remember} onPress={() => setRemember((r) => !r)}>
              <View style={[styles.checkbox, remember && styles.checkboxOn]}>
                {remember && <Ionicons name="checkmark" size={13} color={colors.white} />}
              </View>
              <Text style={styles.rememberText}>Remember me</Text>
            </Pressable>
            <Pressable onPress={() => router.push('/auth/forgot')} hitSlop={8}>
              <Text style={styles.link}>Forgot password?</Text>
            </Pressable>
          </View>

          <Button label="Log In" icon="log-in-outline" style={{ marginTop: spacing.sm }} onPress={() => router.replace('/(tabs)')} />

          <Pressable style={styles.biometric} onPress={() => router.replace('/(tabs)')}>
            <Ionicons name="finger-print-outline" size={22} color={colors.primary} />
            <Text style={styles.biometricText}>Sign in with biometrics</Text>
          </Pressable>

          <View style={styles.divider}>
            <View style={styles.line} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.line} />
          </View>

          <View style={styles.socialRow}>
            {['logo-google', 'logo-apple', 'mail-outline'].map((ic) => (
              <Pressable key={ic} style={styles.social}>
                <Ionicons name={ic as any} size={22} color={colors.text} />
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>New to iCollege? </Text>
          <Pressable onPress={() => router.push('/auth/register')} hitSlop={8}>
            <Text style={styles.link}>Create account</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.xl, paddingBottom: spacing.xxl },

  brand: { alignItems: 'center', marginBottom: spacing.xxl },
  logoBadge: {
    width: 68, height: 68, borderRadius: radii.xl, backgroundColor: colors.primary,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md,
  },
  logoText: { fontSize: 26, fontWeight: '800', color: colors.primary },
  tagline: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },

  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },

  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  remember: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  checkbox: {
    width: 20, height: 20, borderRadius: 6, borderWidth: 1.5, borderColor: colors.border,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn: { backgroundColor: colors.primary, borderColor: colors.primary },
  rememberText: { fontSize: 13, color: colors.textSecondary },
  link: { fontSize: 13, fontWeight: '700', color: colors.primary },

  biometric: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    marginTop: spacing.lg, paddingVertical: spacing.md, borderRadius: radii.md,
    borderWidth: 1.5, borderColor: colors.primarySoft, backgroundColor: colors.primarySoft,
  },
  biometricText: { fontSize: 14, fontWeight: '700', color: colors.primary },

  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginVertical: spacing.xl },
  line: { flex: 1, height: 1, backgroundColor: colors.border },
  dividerText: { fontSize: 12, color: colors.textMuted },

  socialRow: { flexDirection: 'row', justifyContent: 'center', gap: spacing.lg },
  social: {
    width: 56, height: 52, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center',
  },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xxl },
  footerText: { fontSize: 14, color: colors.textSecondary },
}));
