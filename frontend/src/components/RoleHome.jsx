import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { AppDrawer } from '@/components/AppDrawer';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { useAuth } from '@/lib/auth/AuthContext';
import { useApi } from '@/hooks/useApi';
import { initialsOf, greetingForNow } from '@/lib/initials';
import { resolveMediaUrl } from '@/lib/api/client';
import { fetchStats } from '@/lib/api/admin';
import { fetchMyCourses } from '@/lib/api/lecturer';
import { fetchMyClubs } from '@/lib/api/clubAdmin';
import { fetchMyCompany, fetchMyOpportunities } from '@/lib/api/employer';

const ROLE_META = {
  university_admin: { title: 'University Admin', icon: 'shield-checkmark-outline', color: 'primary', console: '/admin' },
  platform_admin: { title: 'Platform Admin', icon: 'shield-checkmark-outline', color: 'primary', console: '/admin' },
  lecturer: { title: 'Lecturer', icon: 'easel-outline', color: 'blue', console: '/lecturer' },
  club_admin: { title: 'Club Admin', icon: 'people-circle-outline', color: 'green', console: '/club-admin' },
  employer: { title: 'Employer', icon: 'briefcase-outline', color: 'orange', console: '/employer' },
};

function StatRow({ items }) {
  return (
    <View style={statStyles.row}>
      {items.map((it) => (
        <View key={it.label} style={statStyles.item}>
          <Text style={statStyles.value}>{it.value}</Text>
          <Text style={statStyles.label}>{it.label}</Text>
        </View>
      ))}
    </View>
  );
}
const statStyles = themedStyles((colors) => ({
  row: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.lg },
  item: { alignItems: 'center', flex: 1 },
  value: { fontSize: 22, fontWeight: '800', color: colors.text },
  label: { fontSize: 11, color: colors.textSecondary, marginTop: 2, textAlign: 'center' },
}));

function AdminSummary() {
  const { data, isLoading } = useApi(fetchStats);
  if (isLoading) return <ActivityIndicator color={colors.primary} />;
  return (
    <StatRow
      items={[
        { value: data?.pendingApprovals ?? 0, label: 'Pending Approvals' },
        { value: data?.usersByStatus?.active ?? 0, label: 'Active Users' },
        { value: data?.clubsCount ?? 0, label: 'Clubs' },
        { value: data?.opportunitiesCount ?? 0, label: 'Opportunities' },
      ]}
    />
  );
}

function LecturerSummary() {
  const { data, isLoading } = useApi(fetchMyCourses);
  if (isLoading) return <ActivityIndicator color={colors.primary} />;
  return <StatRow items={[{ value: data?.length ?? 0, label: 'My Courses' }]} />;
}

function ClubAdminSummary() {
  const { data, isLoading } = useApi(fetchMyClubs);
  if (isLoading) return <ActivityIndicator color={colors.primary} />;
  return <StatRow items={[{ value: data?.length ?? 0, label: 'Clubs Managed' }]} />;
}

function EmployerSummary() {
  const { data: opportunities, isLoading } = useApi(fetchMyOpportunities);
  const { data: company } = useApi(fetchMyCompany);
  if (isLoading) return <ActivityIndicator color={colors.primary} />;
  return (
    <StatRow
      items={[
        { value: opportunities?.length ?? 0, label: 'Job Postings' },
        { value: company?.verified ? 'Verified' : 'Pending', label: 'Company Status' },
      ]}
    />
  );
}

const SUMMARIES = {
  university_admin: AdminSummary,
  platform_admin: AdminSummary,
  lecturer: LecturerSummary,
  club_admin: ClubAdminSummary,
  employer: EmployerSummary,
};

export function RoleHome() {
  const router = useRouter();
  const { user } = useAuth();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const meta = ROLE_META[user.role];
  const Summary = SUMMARIES[user.role];
  const { color, soft } = { color: colors[meta.color], soft: colors[`${meta.color}Soft`] };

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppDrawer visible={drawerOpen} onClose={() => setDrawerOpen(false)} />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 110 }}>
        <View style={styles.header}>
          <Pressable onPress={() => setDrawerOpen(true)} hitSlop={8}>
            <Ionicons name="menu" size={26} color={colors.text} />
          </Pressable>
          <View style={{ flex: 1, marginLeft: spacing.md }}>
            <View style={styles.logoRow}>
              <Ionicons name="school" size={22} color={colors.primary} />
              <Text style={styles.logoText}>iCollege</Text>
            </View>
          </View>
          <Avatar initials={initialsOf(user.fullName)} uri={resolveMediaUrl(user.avatarUrl)} size={38} ring />
        </View>

        <View style={styles.greetRow}>
          <Text style={styles.greetTitle}>{greetingForNow()}, {user.fullName.split(' ')[0]}</Text>
          <Text style={styles.greetSub}>{meta.title} account</Text>
        </View>

        <Card style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <View style={[styles.summaryIcon, { backgroundColor: soft }]}>
              <Ionicons name={meta.icon} size={22} color={color} />
            </View>
            <Text style={styles.summaryTitle}>{meta.title} Overview</Text>
          </View>
          <Summary />
          <Pressable style={[styles.consoleBtn, { backgroundColor: color }]} onPress={() => router.push(meta.console)}>
            <Text style={styles.consoleBtnText}>Open {meta.title} Console</Text>
            <Ionicons name="arrow-forward" size={16} color={colors.white} />
          </Pressable>
        </Card>

        {user.status === 'pending' && (
          <View style={styles.pendingBanner}>
            <Ionicons name="time-outline" size={18} color={colors.orange} />
            <Text style={styles.pendingText}>Your account is awaiting admin approval. Some features are limited.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoText: { fontSize: 20, fontWeight: '800', color: colors.primary },
  greetRow: { paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  greetTitle: { fontSize: 22, fontWeight: '800', color: colors.text },
  greetSub: { fontSize: 13, color: colors.textSecondary, marginTop: 2 },
  summaryCard: { marginHorizontal: spacing.lg, marginTop: spacing.xl },
  summaryHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  summaryIcon: { width: 44, height: 44, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: colors.text },
  consoleBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm,
    borderRadius: radii.md, paddingVertical: spacing.md, marginTop: spacing.xl,
  },
  consoleBtnText: { color: colors.white, fontSize: 14, fontWeight: '700' },
  pendingBanner: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.orangeSoft,
    marginHorizontal: spacing.lg, marginTop: spacing.lg, padding: spacing.lg, borderRadius: radii.lg,
  },
  pendingText: { flex: 1, fontSize: 12.5, color: colors.orange, fontWeight: '600' },
}));
