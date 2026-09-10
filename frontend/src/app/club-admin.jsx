import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, radii, spacing, themedStyles } from '@/theme';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useApi } from '@/hooks/useApi';
import { fetchMyClubs, fetchClubMembers, postClubAnnouncement, createClubCompetition } from '@/lib/api/clubAdmin';

export default function ClubAdminConsoleScreen() {
  const { data: clubs, isLoading } = useApi(fetchMyClubs);
  const club = clubs?.[0];
  const { data: members } = useApi(() => (club ? fetchClubMembers(club.id) : Promise.resolve([])), [club?.id]);
  const [announceTitle, setAnnounceTitle] = useState('');
  const [announceBody, setAnnounceBody] = useState('');
  const [compTitle, setCompTitle] = useState('');
  const [busy, setBusy] = useState(false);

  async function sendAnnouncement() {
    if (!announceTitle.trim()) return Alert.alert('Add a title');
    setBusy(true);
    try {
      await postClubAnnouncement(club.id, { title: announceTitle.trim(), body: announceBody.trim() });
      setAnnounceTitle('');
      setAnnounceBody('');
      Alert.alert('Announcement posted');
    } catch (e) {
      Alert.alert('Could not post', e.message);
    } finally {
      setBusy(false);
    }
  }

  async function launchCompetition() {
    if (!compTitle.trim()) return Alert.alert('Add a title');
    setBusy(true);
    try {
      await createClubCompetition(club.id, { title: compTitle.trim() });
      setCompTitle('');
      Alert.alert('Competition created');
    } catch (e) {
      Alert.alert('Could not create competition', e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScreenHeader title="Club Console" subtitle={club?.name ?? 'Manage your club'} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isLoading ? <ActivityIndicator color={colors.primary} /> : !club ? (
          <Text style={styles.empty}>You don't manage any club yet. Ask an admin to assign you as club owner.</Text>
        ) : (
          <>
            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Members ({members?.length ?? 0})</Text>
              {(members ?? []).slice(0, 6).map((m) => (
                <View key={m.id} style={styles.memberRow}>
                  <Text style={styles.memberName}>{m.full_name}</Text>
                  <Text style={styles.memberMeta}>{m.student_id}</Text>
                </View>
              ))}
              {(members ?? []).length === 0 && <Text style={styles.empty}>No members yet.</Text>}
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Post Announcement</Text>
              <TextInput style={styles.input} placeholder="Title" placeholderTextColor={colors.textMuted} value={announceTitle} onChangeText={setAnnounceTitle} />
              <TextInput style={[styles.input, styles.textarea]} placeholder="Message" placeholderTextColor={colors.textMuted} value={announceBody} onChangeText={setAnnounceBody} multiline />
              <Button label={busy ? 'Posting…' : 'Post to Members'} color={colors.green} onPress={sendAnnouncement} style={{ marginTop: spacing.md }} />
            </Card>

            <Card style={styles.card}>
              <Text style={styles.cardTitle}>Launch Competition</Text>
              <TextInput style={styles.input} placeholder="Competition title" placeholderTextColor={colors.textMuted} value={compTitle} onChangeText={setCompTitle} />
              <Button label={busy ? 'Creating…' : 'Launch'} variant="outline" onPress={launchCompetition} style={{ marginTop: spacing.md }} />
            </Card>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  content: { padding: spacing.lg, paddingBottom: 120 },
  card: { marginBottom: spacing.lg },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginBottom: spacing.md },
  memberRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: colors.border },
  memberName: { fontSize: 13.5, color: colors.text, fontWeight: '600' },
  memberMeta: { fontSize: 12, color: colors.textMuted },
  input: {
    borderWidth: 1.5, borderColor: colors.border, borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.md,
    fontSize: 14, color: colors.text, backgroundColor: colors.surface, marginBottom: spacing.sm,
  },
  textarea: { minHeight: 80, textAlignVertical: 'top' },
  empty: { color: colors.textMuted, fontSize: 13, textAlign: 'center', marginTop: spacing.xxl },
}));
