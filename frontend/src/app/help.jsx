import { View, Text, ScrollView, Linking, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, shadow, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
const FAQS = [
  {
    q: 'I forgot my password',
    a: 'Use "Forgot password?" on the login screen. A reset code is sent to your registered contact; enter it to set a new password.',
  },
  {
    q: 'My timetable or exam details look wrong',
    a: "Timetable, exam and seating data comes directly from the registrar. Report discrepancies to your registrar's office so they can correct the record.",
  },
  {
    q: 'A document failed to upload',
    a: 'Check your connection and file size, then try again. If it keeps failing, contact support with the file name and error shown.',
  },
  {
    q: 'How do I change my theme?',
    a: 'Go to Profile → Appearance to switch between System, Light and Dark.',
  },
];
const CONTACTS = [
  {
    icon: 'call-outline',
    label: "Registrar's Office",
    value: '+255 711 000 000',
    action: 'tel:+255711000000',
  },
  {
    icon: 'mail-outline',
    label: 'Student Support Email',
    value: 'support@icollege.ac.tz',
    action: 'mailto:support@icollege.ac.tz',
  },
];
export default function HelpScreen() {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <ScreenHeader title="Help & Support" subtitle="We're here to help" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        <Text style={styles.sectionTitle}>Contact</Text>
        <Card style={styles.card}>
          {CONTACTS.map((c, i) => (
            <Pressable
              key={c.label}
              style={[styles.row, i < CONTACTS.length - 1 && styles.rowBorder]}
              onPress={() => Linking.openURL(c.action)}
            >
              <View style={styles.rowIcon}>
                <Ionicons name={c.icon} size={19} color={colors.primary} />
              </View>
              <View
                style={{
                  flex: 1,
                }}
              >
                <Text style={styles.rowLabel}>{c.label}</Text>
                <Text style={styles.rowValue}>{c.value}</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </Card>

        <Text style={styles.sectionTitle}>Frequently asked questions</Text>
        {FAQS.map((f) => (
          <Card key={f.q} style={styles.faqCard}>
            <Text style={styles.faqQ}>{f.q}</Text>
            <Text style={styles.faqA}>{f.a}</Text>
          </Card>
        ))}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowIcon: {
    width: 38,
    height: 38,
    borderRadius: radii.md,
    backgroundColor: colors.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 12,
    color: colors.textMuted,
  },
  rowValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.text,
    marginTop: 2,
  },
  faqCard: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.md,
    ...shadow.soft,
  },
  faqQ: {
    fontSize: 14.5,
    fontWeight: '700',
    color: colors.text,
  },
  faqA: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 19,
  },
}));
