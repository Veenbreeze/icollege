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
import { useAuth } from '@/lib/auth/AuthContext';
import { ApiError } from '@/lib/api/client';

const ROLES = [
  { key: 'lecturer', label: 'Lecturer', icon: 'easel-outline' },
  { key: 'university_admin', label: 'University Admin', icon: 'business-outline' },
  { key: 'club_admin', label: 'Club / Org Admin', icon: 'people-outline' },
  { key: 'employer', label: 'Employer', icon: 'briefcase-outline' },
  { key: 'platform_admin', label: 'Platform Admin', icon: 'shield-checkmark-outline' },
];

export default function SignupScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { signup } = useAuth();
  const [role, setRole] = useState(ROLES[0].key);
  const [fullName, setFullName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [pendingMessage, setPendingMessage] = useState(null);

  const onSubmit = async () => {
    if (!fullName || !studentId || !password) {
      setError('Fill in your name, ID and password.');
      return;
    }
    setError(null);
    setSubmitting(true);
    try {
      const result = await signup({ fullName, studentId: studentId.trim(), email, password, role, companyName: role === 'employer' ? companyName : undefined });
      if (result.pending) {
        setPendingMessage(result.message);
      } else {
        router.replace('/(tabs)');
      }
    } catch (e) {
      setError(e instanceof ApiError ? e.message : 'Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (pendingMessage) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.pendingWrap}>
          <ClaySurface radius={radii.xxl} style={styles.pendingIcon}>
            <Ionicons name="time-outline" size={36} color={colors.primary} />
          </ClaySurface>
          <Text style={styles.pendingTitle}>Account created</Text>
          <Text style={styles.pendingBody}>{pendingMessage}</Text>
          <Button label="Back to Login" onPress={() => router.replace('/auth/login')} style={{ marginTop: spacing.xl }} />
        </View>
      </SafeAreaView>
    );
  }

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
            <Ionicons name="person-add" size={26} color={colors.primary} />
          </ClaySurface>
          <Text style={styles.heroTitle}>Create your account</Text>
          <Text style={styles.heroSubtitle}>Join as staff, club or partner</Text>
        </LinearGradient>

        <View style={styles.sheetWrap}>
          <ClaySurface radius={radii.xxl} style={styles.sheet}>
            <Text style={styles.label}>Role</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.roleRow}>
              {ROLES.map((r) => (
                <Pressable key={r.key} onPress={() => setRole(r.key)} style={[styles.roleChip, role === r.key && styles.roleChipActive]}>
                  <Ionicons name={r.icon} size={16} color={role === r.key ? colors.white : colors.textSecondary} />
                  <Text style={[styles.roleLabel, role === r.key && styles.roleLabelActive]}>{r.label}</Text>
                </Pressable>
              ))}
            </ScrollView>

            <View style={styles.noticeBox}>
              <Ionicons name="information-circle-outline" size={16} color={colors.orange} />
              <Text style={styles.noticeText}>New accounts require admin approval before you can log in.</Text>
            </View>

            <Field label="Full Name" icon="person-outline" placeholder="Jane Doe" value={fullName} onChangeText={setFullName} />
            <Field label="Staff / Reference ID" icon="card-outline" placeholder="STAFF/00019" autoCapitalize="characters" value={studentId} onChangeText={setStudentId} />
            <Field label="Email" icon="mail-outline" placeholder="you@icu.ac.tz" keyboardType="email-address" autoCapitalize="none" value={email} onChangeText={setEmail} />
            {role === 'employer' && (
              <Field label="Company Name" icon="business-outline" placeholder="Acme Inc." value={companyName} onChangeText={setCompanyName} />
            )}
            <Field label="Password" icon="lock-closed-outline" placeholder="At least 8 characters" password value={password} onChangeText={setPassword} />

            {error && (
              <View style={styles.errorBox}>
                <Ionicons name="alert-circle" size={15} color={colors.red} />
                <Text style={styles.error}>{error}</Text>
              </View>
            )}

            {submitting ? (
              <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.sm }} />
            ) : (
              <Button label="Create Account" icon="person-add-outline" onPress={onSubmit} style={{ marginTop: spacing.sm }} />
            )}
          </ClaySurface>

          <Pressable onPress={() => router.replace('/auth/login')} hitSlop={8} style={styles.loginRow}>
            <Text style={styles.footerText}>Already have an account? </Text>
            <Text style={styles.link}>Log in</Text>
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
  heroSubtitle: { fontSize: 12.5, color: 'rgba(255,255,255,0.85)', marginTop: 4, fontWeight: '600' },
  sheetWrap: { marginTop: -spacing.xl, paddingHorizontal: spacing.xl },
  sheet: { backgroundColor: colors.surface, padding: spacing.xl },
  label: { fontSize: 13, fontWeight: '600', color: colors.textSecondary, marginBottom: spacing.sm },
  roleRow: { marginBottom: spacing.lg },
  roleChip: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: colors.surfaceMuted, borderWidth: 1.5, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill, marginRight: spacing.sm,
  },
  roleChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  roleLabel: { fontSize: 13, fontWeight: '600', color: colors.textSecondary },
  roleLabelActive: { color: colors.white },
  noticeBox: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.orangeSoft,
    borderRadius: radii.sm, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.lg,
  },
  noticeText: { flex: 1, fontSize: 12, color: colors.orange, fontWeight: '600' },
  errorBox: {
    flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.redSoft, borderRadius: radii.sm,
    paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginBottom: spacing.md,
  },
  error: { flex: 1, fontSize: 12.5, color: colors.red, fontWeight: '600' },
  loginRow: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontSize: 14, color: colors.textSecondary },
  link: { fontSize: 14, fontWeight: '700', color: colors.primary },
  pendingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xxl },
  pendingIcon: { width: 76, height: 76, backgroundColor: colors.primarySoft, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg },
  pendingTitle: { fontSize: 20, fontWeight: '800', color: colors.text },
  pendingBody: { fontSize: 14, color: colors.textSecondary, textAlign: 'center', marginTop: spacing.sm, lineHeight: 20 },
}));
