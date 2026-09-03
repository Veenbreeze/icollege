import { useRef, useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing , themedStyles } from '@/theme';
import { Button } from '@/components/ui/Button';

const LEN = 6;

export default function VerifyScreen() {
  const router = useRouter();
  const [code, setCode] = useState<string[]>(Array(LEN).fill(''));
  const inputs = useRef<(TextInput | null)[]>([]);

  const setDigit = (i: number, v: string) => {
    const d = v.replace(/[^0-9]/g, '').slice(-1);
    const next = [...code];
    next[i] = d;
    setCode(next);
    if (d && i < LEN - 1) inputs.current[i + 1]?.focus();
  };

  const onKey = (i: number, key: string) => {
    if (key === 'Backspace' && !code[i] && i > 0) inputs.current[i - 1]?.focus();
  };

  const filled = code.every((c) => c !== '');

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.content}>
        <View style={styles.iconWrap}>
          <Ionicons name="shield-checkmark-outline" size={34} color={colors.primary} />
        </View>
        <Text style={styles.title}>Verify your account</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to your institutional email and phone. Enter it below to verify.
        </Text>

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

        <Button
          label="Verify & Continue"
          icon="checkmark-circle-outline"
          onPress={() => router.replace('/(tabs)')}
          style={{ opacity: filled ? 1 : 0.6, marginTop: spacing.xl }}
        />

        <View style={styles.resend}>
          <Text style={styles.resendText}>Didn&apos;t get the code? </Text>
          <Pressable hitSlop={8}>
            <Text style={styles.link}>Resend in 0:45</Text>
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
  subtitle: { fontSize: 14, color: colors.textSecondary, marginTop: 6, lineHeight: 20 },

  otpRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.xxl },
  otpBox: {
    width: 48, height: 58, borderRadius: radii.md, borderWidth: 1.5, borderColor: colors.border,
    backgroundColor: colors.surface, textAlign: 'center', fontSize: 22, fontWeight: '800', color: colors.text,
  },
  otpBoxFilled: { borderColor: colors.primary, backgroundColor: colors.white },

  resend: { flexDirection: 'row', justifyContent: 'center', marginTop: spacing.xl },
  resendText: { fontSize: 13, color: colors.textSecondary },
  link: { fontSize: 13, fontWeight: '700', color: colors.primary },
}));
