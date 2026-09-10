import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow, themedStyles, useTheme, type ThemePreference } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { user } from '@/data/mock';

const APPEARANCE: { key: ThemePreference; label: string; icon: string }[] = [
  { key: 'system', label: 'System', icon: 'phone-portrait-outline' },
  { key: 'light', label: 'Light', icon: 'sunny-outline' },
  { key: 'dark', label: 'Dark', icon: 'moon-outline' },
];

const STATS = [
  { value: '720', label: 'Success Score', color: colors.primary },
  { value: '14', label: 'Badges', color: colors.orange },
  { value: '8', label: 'Projects', color: colors.green },
];

const ACHIEVEMENTS = [
  { icon: 'trophy', label: 'Top Contributor', color: colors.yellow, soft: colors.yellowSoft },
  { icon: 'flame', label: '30-day Streak', color: colors.red, soft: colors.redSoft },
  { icon: 'ribbon', label: 'iCompete Winner', color: colors.primary, soft: colors.primarySoft },
  { icon: 'school', label: "Dean's List", color: colors.green, soft: colors.greenSoft },
];

const MENU = [
  { icon: 'sparkles-outline', label: 'iAI Assistant', color: colors.primary, route: '/ai' },
  { icon: 'person-circle-outline', label: 'My Portfolio', color: colors.blue, route: '/portfolio' },
  { icon: 'briefcase-outline', label: 'iCareer', color: colors.green, route: '/career' },
  { icon: 'folder-outline', label: 'iVault Documents', color: colors.green, route: '/documents' },
  { icon: 'bookmark-outline', label: 'Saved Items', color: colors.primary },
  { icon: 'settings-outline', label: 'Settings', color: colors.textSecondary },
  { icon: 'help-circle-outline', label: 'Help & Support', color: colors.textSecondary },
] as const;

export default function ProfileScreen() {
  const router = useRouter();
  const { preference, setPreference } = useTheme();
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.header}>
          <Text style={styles.title}>Profile</Text>
          <Ionicons name="settings-outline" size={24} color={colors.text} />
        </View>

        {/* Identity */}
        <View style={styles.identity}>
          <Avatar initials={user.avatarInitials} size={84} ring />
          <Text style={styles.name}>{user.fullName}</Text>
          <Text style={styles.sub}>{user.programme}</Text>
          <View style={styles.yearPill}>
            <Ionicons name="school-outline" size={13} color={colors.primary} />
            <Text style={styles.yearText}>{user.year}</Text>
          </View>
        </View>

        {/* Stats */}
        <Card style={styles.statsCard}>
          {STATS.map((s, i) => (
            <View key={s.label} style={styles.statWrap}>
              <View style={styles.stat}>
                <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
                <Text style={styles.statLabel}>{s.label}</Text>
              </View>
              {i < STATS.length - 1 && <View style={styles.vDivider} />}
            </View>
          ))}
        </Card>

        {/* Achievements */}
        <Text style={styles.sectionTitle}>Achievements</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.achRow}>
          {ACHIEVEMENTS.map((a) => (
            <View key={a.label} style={styles.achCard}>
              <View style={[styles.achIcon, { backgroundColor: a.soft }]}>
                <Ionicons name={a.icon as any} size={24} color={a.color} />
              </View>
              <Text style={styles.achLabel} numberOfLines={2}>{a.label}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Appearance / Dark mode */}
        <Text style={styles.sectionTitle}>Appearance</Text>
        <View style={styles.appearance}>
          {APPEARANCE.map((opt) => {
            const active = preference === opt.key;
            return (
              <Pressable
                key={opt.key}
                style={[styles.appearanceItem, active && styles.appearanceItemActive]}
                onPress={() => setPreference(opt.key)}
              >
                <Ionicons name={opt.icon as any} size={20} color={active ? colors.white : colors.textSecondary} />
                <Text style={[styles.appearanceText, active && { color: colors.white }]}>{opt.label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Menu */}
        <Card style={styles.menuCard}>
          {MENU.map((m, i) => (
            <Pressable
              key={m.label}
              style={[styles.menuRow, i < MENU.length - 1 && styles.menuBorder]}
              onPress={() => 'route' in m && m.route && router.push(m.route as any)}
            >
              <Ionicons name={m.icon as any} size={21} color={m.color} />
              <Text style={styles.menuLabel}>{m.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </Pressable>
          ))}
        </Card>

        <Pressable style={styles.logout} onPress={() => router.replace('/auth/login')}>
          <Ionicons name="log-out-outline" size={20} color={colors.red} />
          <Text style={styles.logoutText}>Log Out</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.md },
  title: { fontSize: 26, fontWeight: '800', color: colors.text },

  identity: { alignItems: 'center', marginTop: spacing.lg },
  name: { fontSize: 20, fontWeight: '800', color: colors.text, marginTop: spacing.md },
  sub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  yearPill: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.primarySoft, paddingHorizontal: spacing.md, paddingVertical: 5, borderRadius: radii.pill, marginTop: spacing.sm },
  yearText: { fontSize: 12, fontWeight: '600', color: colors.primary },

  statsCard: { flexDirection: 'row', marginHorizontal: spacing.lg, marginTop: spacing.xl, paddingVertical: spacing.lg },
  statWrap: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: '800' },
  statLabel: { fontSize: 11, color: colors.textMuted, marginTop: 2 },
  vDivider: { width: 1, height: 34, backgroundColor: colors.border },

  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.text, paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  achRow: { paddingHorizontal: spacing.lg, marginTop: spacing.md, gap: spacing.md },
  achCard: { width: 92, alignItems: 'center', backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, gap: spacing.sm, ...shadow.soft },
  achIcon: { width: 48, height: 48, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  achLabel: { fontSize: 11, fontWeight: '600', color: colors.textSecondary, textAlign: 'center' },

  appearance: { flexDirection: 'row', gap: spacing.sm, marginHorizontal: spacing.lg, marginTop: spacing.md, backgroundColor: colors.surface, borderRadius: radii.lg, padding: 4, ...shadow.soft },
  appearanceItem: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: spacing.md, borderRadius: radii.md },
  appearanceItemActive: { backgroundColor: colors.primary },
  appearanceText: { fontSize: 13.5, fontWeight: '600', color: colors.textSecondary },

  menuCard: { marginHorizontal: spacing.lg, marginTop: spacing.xl, padding: 0, overflow: 'hidden' },
  menuRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingHorizontal: spacing.lg, paddingVertical: spacing.lg },
  menuBorder: { borderBottomWidth: 1, borderBottomColor: colors.border },
  menuLabel: { flex: 1, fontSize: 15, fontWeight: '600', color: colors.text },

  logout: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.xl, marginHorizontal: spacing.lg, paddingVertical: spacing.lg, backgroundColor: colors.redSoft, borderRadius: radii.lg },
  logoutText: { fontSize: 15, fontWeight: '700', color: colors.red },
}));
