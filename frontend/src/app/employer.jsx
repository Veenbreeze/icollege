import { useState } from 'react';
import { View, Text, ScrollView, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Pill } from '@/components/ui/Pill';
import { Button } from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import { fetchMyCompany, fetchMyOpportunities, postOpportunity, postChallenge } from '@/lib/api/employer';

export default function EmployerConsoleScreen() {
  const { data: company, isLoading: loadingCompany } = useApi(fetchMyCompany);
  const { data: opportunities, isLoading: loadingOpps, refetch } = useApi(fetchMyOpportunities);
  const [role, setRole] = useState('');
  const [type, setType] = useState('Internship');
  const [category, setCategory] = useState('Internships');
  const [compTitle, setCompTitle] = useState('');
  const [busy, setBusy] = useState(false);

  async function createPosting() {
    if (!role.trim()) return Alert.alert('Add a role title');
    setBusy(true);
    try {
      await postOpportunity({ role: role.trim(), type, category });
      setRole('');
      refetch();
      Alert.alert('Job posting created', 'It will appear in student opportunity search.');
    } catch (e) {
      Alert.alert('Could not post', e.message);
    } finally {
      setBusy(false);
    }
  }

  async function launchChallenge() {
    if (!compTitle.trim()) return Alert.alert('Add a title');
    setBusy(true);
    try {
      await postChallenge({ title: compTitle.trim() });
      setCompTitle('');
      Alert.alert('Challenge launched');
    } catch (e) {
      Alert.alert('Could not launch', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Employer Console" subtitle={company?.name ?? 'Manage your company'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loadingCompany ? <ActivityIndicator color={colors.primary} /> : company && (
          <Card style={styles.card}>
            <View style={styles.companyRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cardTitle}>{company.name}</Text>
                <Text style={styles.companyDesc} numberOfLines={2}>{company.description}</Text>
              </View>
              <Pill label={company.verified ? 'Verified' : 'Pending Verification'} color={company.verified ? colors.green : colors.orange} soft={company.verified ? colors.greenSoft : colors.orangeSoft} />
            </View>
          </Card>
        )}

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Post a Job / Internship</Text>
          <TextInput style={styles.input} placeholder="Role title" placeholderTextColor={colors.textMuted} value={role} onChangeText={setRole} />
          <Button label={busy ? 'Posting…' : 'Post Opportunity'} color={colors.orange} onPress={createPosting} style={{ marginTop: spacing.md }} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Launch a Challenge</Text>
          <TextInput style={styles.input} placeholder="Challenge title" placeholderTextColor={colors.textMuted} value={compTitle} onChangeText={setCompTitle} />
          <Button label={busy ? 'Launching…' : 'Launch'} variant="outline" onPress={launchChallenge} style={{ marginTop: spacing.md }} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>My Postings ({opportunities?.length ?? 0})</Text>
          {loadingOpps ? <ActivityIndicator color={colors.primary} /> : (opportunities ?? []).length === 0 ? (
            <Text style={styles.empty}>No postings yet.</Text>
          ) : (
            (opportunities ?? []).map((o) => (
              <View key={o.id} style={styles.oppRow}>
                <Ionicons name="briefcase-outline" size={16} color={colors.textSecondary} />
                <Text style={styles.oppTitle}>{o.role}</Text>
                <Pill label={o.verified ? 'Verified' : 'Pending'} color={o.verified ? colors.green : colors.orange} soft={o.verified ? colors.greenSoft : colors.orangeSoft} />
              </View>
            ))
          )}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 120 },
  card: { marginBottom: spacing.lg },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.sm },
  companyRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  companyDesc: { fontSize: 12.5, color: colors.textSecondary, marginTop: 4 },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: 14, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.sm,
  },
  oppRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  oppTitle: { flex: 1, fontSize: 13.5, color: colors.text, fontWeight: '600' },
  empty: { color: colors.textMuted, fontSize: 13 },
}));
