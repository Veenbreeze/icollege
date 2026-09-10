import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { useAuth } from '@/lib/auth/AuthContext';
import { useApi } from '@/hooks/useApi';
import { fetchStats, fetchUsers, updateUserStatus, fetchTimetableChangeRequests, resolveTimetableChangeRequest } from '@/lib/api/admin';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'approvals', label: 'Approvals' },
  { key: 'requests', label: 'Timetable Requests' },
];

export default function AdminConsoleScreen() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const { data: stats, isLoading: loadingStats } = useApi(fetchStats);
  const { data: pendingUsers, isLoading: loadingUsers, refetch: refetchUsers } = useApi(() => fetchUsers({ status: 'pending' }));
  const { data: requests, isLoading: loadingRequests, refetch: refetchRequests } = useApi(() => fetchTimetableChangeRequests('pending'));

  async function approve(id) {
    await updateUserStatus(id, 'active');
    refetchUsers();
  }
  async function reject(id) {
    await updateUserStatus(id, 'suspended');
    refetchUsers();
  }
  async function resolveRequest(id, status) {
    await resolveTimetableChangeRequest(id, status, '');
    refetchRequests();
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Admin Console" subtitle={user.role === 'platform_admin' ? 'Platform Administrator' : 'University Administrator'} />

      <View style={styles.tabRow}>
        {TABS.map((t) => (
          <Pressable key={t.key} onPress={() => setTab(t.key)} style={[styles.tab, tab === t.key && styles.tabActive]}>
            <Text style={[styles.tabLabel, tab === t.key && styles.tabLabelActive]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {tab === 'overview' && (
          loadingStats ? <ActivityIndicator color={colors.primary} /> : (
            <View style={styles.statGrid}>
              {[
                { label: 'Pending Approvals', value: stats?.pendingApprovals ?? 0, icon: 'time-outline', color: colors.orange },
                { label: 'Active Users', value: stats?.usersByStatus?.active ?? 0, icon: 'people-outline', color: colors.primary },
                { label: 'Posts', value: stats?.postsCount ?? 0, icon: 'chatbubbles-outline', color: colors.blue },
                { label: 'Clubs', value: stats?.clubsCount ?? 0, icon: 'people-circle-outline', color: colors.green },
                { label: 'Opportunities', value: stats?.opportunitiesCount ?? 0, icon: 'briefcase-outline', color: colors.red },
              ].map((s) => (
                <Card key={s.label} style={styles.statCard}>
                  <Ionicons name={s.icon} size={20} color={s.color} />
                  <Text style={styles.statValue}>{s.value}</Text>
                  <Text style={styles.statLabel}>{s.label}</Text>
                </Card>
              ))}
              {stats?.usersByRole && (
                <Card style={styles.roleCard}>
                  <Text style={styles.roleCardTitle}>Users by Role</Text>
                  {Object.entries(stats.usersByRole).map(([role, count]) => (
                    <View key={role} style={styles.roleRow}>
                      <Text style={styles.roleName}>{role.replace('_', ' ')}</Text>
                      <Text style={styles.roleCount}>{count}</Text>
                    </View>
                  ))}
                </Card>
              )}
            </View>
          )
        )}

        {tab === 'approvals' && (
          loadingUsers ? <ActivityIndicator color={colors.primary} /> : (pendingUsers ?? []).length === 0 ? (
            <Text style={styles.empty}>No pending approvals.</Text>
          ) : (
            (pendingUsers ?? []).map((u) => (
              <Card key={u.id} style={styles.userCard}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.userName}>{u.fullName}</Text>
                  <Text style={styles.userMeta}>{u.studentId} · {u.email}</Text>
                  <Pill label={u.role.replace('_', ' ')} color={colors.primary} soft={colors.primarySoft} />
                </View>
                <View style={styles.userActions}>
                  <Pressable style={[styles.actionBtn, { backgroundColor: colors.green }]} onPress={() => approve(u.id)}>
                    <Ionicons name="checkmark" size={18} color={colors.white} />
                  </Pressable>
                  <Pressable style={[styles.actionBtn, { backgroundColor: colors.red }]} onPress={() => Alert.alert('Reject account?', u.fullName, [{ text: 'Cancel' }, { text: 'Reject', onPress: () => reject(u.id) }])}>
                    <Ionicons name="close" size={18} color={colors.white} />
                  </Pressable>
                </View>
              </Card>
            ))
          )
        )}

        {tab === 'requests' && (
          loadingRequests ? <ActivityIndicator color={colors.primary} /> : (requests ?? []).length === 0 ? (
            <Text style={styles.empty}>No pending timetable change requests.</Text>
          ) : (
            (requests ?? []).map((r) => (
              <Card key={r.id} style={styles.requestCard}>
                <Text style={styles.userName}>{r.course_code} · {r.course_title}</Text>
                <Text style={styles.userMeta}>From {r.lecturer_name}</Text>
                <Text style={styles.requestMessage}>{r.message}</Text>
                <View style={styles.userActions}>
                  <Pressable style={[styles.actionBtn, { backgroundColor: colors.green }]} onPress={() => resolveRequest(r.id, 'approved')}>
                    <Text style={styles.actionBtnLabel}>Approve</Text>
                  </Pressable>
                  <Pressable style={[styles.actionBtn, { backgroundColor: colors.red }]} onPress={() => resolveRequest(r.id, 'rejected')}>
                    <Text style={styles.actionBtnLabel}>Reject</Text>
                  </Pressable>
                </View>
              </Card>
            ))
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  tabRow: { flexDirection: 'row', paddingHorizontal: spacing.lg, gap: spacing.sm, marginTop: spacing.md },
  tab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.pill, backgroundColor: colors.surfaceMuted },
  tabActive: { backgroundColor: colors.primary },
  tabLabel: { fontSize: 12.5, fontWeight: '600', color: colors.textSecondary },
  tabLabelActive: { color: colors.white },
  content: { padding: spacing.lg, paddingBottom: 120 },
  statGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  statCard: { width: '47%', alignItems: 'flex-start', gap: 6 },
  statValue: { fontSize: 22, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 12, color: colors.textSecondary },
  roleCard: { width: '100%' },
  roleCardTitle: { fontSize: 14, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  roleRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 4 },
  roleName: { fontSize: 13, color: colors.textSecondary, textTransform: 'capitalize' },
  roleCount: { fontSize: 13, fontWeight: '700', color: colors.text },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xxl },
  userCard: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md, gap: spacing.md },
  userName: { fontSize: 15, fontWeight: '700', color: colors.text },
  userMeta: { fontSize: 12, color: colors.textSecondary, marginTop: 2, marginBottom: 6 },
  userActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  actionBtn: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radii.md, alignItems: 'center', justifyContent: 'center' },
  actionBtnLabel: { color: colors.white, fontSize: 12.5, fontWeight: '700' },
  requestCard: { marginBottom: spacing.md },
  requestMessage: { fontSize: 13, color: colors.text, marginTop: spacing.sm, lineHeight: 18 },
}));
