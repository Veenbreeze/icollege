import { View, Text, ScrollView, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { useAuth } from '@/lib/auth/AuthContext';
export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  if (!user) return null;
  const ACCOUNT_ROWS = [
    {
      label: 'Full Name',
      value: user.fullName,
    },
    {
      label: 'Student / Registration Number',
      value: user.studentId,
    },
    {
      label: 'Programme',
      value: user.programme ?? 'Not set',
    },
    {
      label: 'Year',
      value: user.year ?? 'Not set',
    },
    {
      label: 'Email',
      value: user.email ?? 'Not set',
    },
    {
      label: 'Phone',
      value: user.phone ?? 'Not set',
    },
  ];
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Settings" subtitle="Your account details" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <Text style={styles.sectionTitle}>Account</Text>
        <Card style={styles.card}>
          {ACCOUNT_ROWS.map((row, i) => (
            <View key={row.label} style={[styles.row, i < ACCOUNT_ROWS.length - 1 && styles.rowBorder]}>
              <Text style={styles.rowLabel}>{row.label}</Text>
              <Text style={styles.rowValue}>{row.value}</Text>
            </View>
          ))}
        </Card>

        <Pressable
          style={styles.logout}
          onPress={async () => {
            await logout();
            router.replace('/auth/login');
          }}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.red} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = themedStyles((colors) => ({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.md,
  },
  card: {
    marginHorizontal: spacing.lg,
    padding: 0,
    overflow: 'hidden',
  },
  row: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 3,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xl,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
    backgroundColor: colors.redSoft,
    borderRadius: radii.lg,
  },
  logoutText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.red,
  },
}));
