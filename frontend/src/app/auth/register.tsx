import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing , themedStyles } from '@/theme';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export default function RegisterScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Create your account</Text>
        <Text style={styles.subtitle}>Join your campus community on iCollege</Text>

        {/* Steps indicator */}
        <View style={styles.steps}>
          <View style={[styles.step, styles.stepActive]} />
          <View style={styles.step} />
          <View style={styles.step} />
        </View>

        <View style={{ marginTop: spacing.lg }}>
          <Field label="University / College" icon="school-outline" placeholder="Select your institution" />
          <Field label="Student Registration Number" icon="id-card-outline" placeholder="ICU/2024/00458" autoCapitalize="characters" />
          <Field label="Full Name" icon="person-outline" placeholder="Daniel Mwakideu" />
          <Field label="Institutional Email" icon="mail-outline" placeholder="daniel@student.icu.ac.ke" keyboardType="email-address" autoCapitalize="none" />
          <Field label="Phone Number" icon="call-outline" placeholder="+254 7xx xxx xxx" keyboardType="phone-pad" />
          <Field label="Password" icon="lock-closed-outline" placeholder="Create a strong password" password />

          <View style={styles.terms}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textMuted} />
            <Text style={styles.termsText}>
              We verify your identity with your university. By continuing you agree to the Terms & Privacy Policy.
            </Text>
          </View>

          <Button label="Continue" icon="arrow-forward" onPress={() => router.push('/auth/verify')} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Pressable onPress={() => router.replace('/auth/login')} hitSlop={8}>
            <Text style={styles.link}>Log in</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  backBtn: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface,
    alignItems: 'center', justifyContent: 'center',
  },
  content: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: spacing.xxl },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 4 },

  steps: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  step: { flex: 1, height: 5, borderRadius: 3, backgroundColor: colors.border },
  stepActive: { backgroundColor: colors.primary },

  terms: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.lg, paddingRight: spacing.sm },
  termsText: { flex: 1, fontSize: 12, color: colors.textMuted, lineHeight: 17 },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontSize: 14, color: colors.textSecondary },
  link: { fontSize: 14, fontWeight: '700', color: colors.primary },
}));
