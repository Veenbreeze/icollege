import { useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing , themedStyles } from '@/theme';
import { Field } from '@/components/ui/Field';
import { Button } from '@/components/ui/Button';

export default function ForgotScreen() {
  const router = useRouter();
  const [method, setMethod] = useState<'email' | 'phone'>('email');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="lock-open-outline" size={32} color={colors.primary} />
        </View>
        <Text style={styles.title}>Reset password</Text>
        <Text style={styles.subtitle}>
          Choose how you&apos;d like to receive your reset code. We&apos;ll send a one-time code to verify it&apos;s you.
        </Text>

        <View style={styles.toggle}>
          {(['email', 'phone'] as const).map((m) => (
            <Pressable
              key={m}
              style={[styles.toggleItem, method === m && styles.toggleItemOn]}
              onPress={() => setMethod(m)}
            >
              <Ionicons
                name={m === 'email' ? 'mail-outline' : 'call-outline'}
                size={16}
                color={method === m ? colors.white : colors.textSecondary}
              />
              <Text style={[styles.toggleText, method === m && { color: colors.white }]}>
                {m === 'email' ? 'Email' : 'Phone'}
              </Text>
            </Pressable>
          ))}
        </View>

        {method === 'email' ? (
          <Field label="Institutional Email" icon="mail-outline" placeholder="daniel@student.icu.ac.ke" keyboardType="email-address" autoCapitalize="none" />
        ) : (
          <Field label="Phone Number" icon="call-outline" placeholder="+254 7xx xxx xxx" keyboardType="phone-pad" />
        )}

        <Button label="Send Reset Code" icon="paper-plane-outline" onPress={() => router.push('/auth/verify')} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Remembered it? </Text>
          <Pressable onPress={() => router.replace('/auth/login')} hitSlop={8}>
            <Text style={styles.link}>Back to log in</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { paddingHorizontal: spacing.xl, paddingTop: spacing.sm },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.surface, alignItems: 'center', justifyContent: 'center' },
  content: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },

  iconWrap: {
    width: 72, height: 72, borderRadius: radii.xl, backgroundColor: colors.primarySoft,
    alignItems: 'center', justifyContent: 'center', marginBottom: spacing.lg,
  },
  title: { fontSize: 24, fontWeight: '800', color: colors.text },
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 6, lineHeight: 20, marginBottom: spacing.xl },

  toggle: { flexDirection: 'row', backgroundColor: colors.surfaceMuted, borderRadius: radii.md, padding: 4, marginBottom: spacing.xl },
  toggleItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 10, borderRadius: radii.sm },
  toggleItemOn: { backgroundColor: colors.primary },
  toggleText: { fontSize: 14, fontWeight: '600', color: colors.textSecondary },

  footer: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  footerText: { fontSize: 14, color: colors.textSecondary },
  link: { fontSize: 14, fontWeight: '700', color: colors.primary },
}));
