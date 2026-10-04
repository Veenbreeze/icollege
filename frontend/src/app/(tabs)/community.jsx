import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, shadow, chamberThemes, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { useApi } from '@/hooks/useApi';
import { fetchChambers } from '@/lib/api/community';
export default function CommunityScreen() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const { data: chambers, isLoading } = useApi(fetchChambers);
  const visibleChambers = (chambers ?? []).filter((chamber) => {
    const query = search.trim().toLowerCase();
    return !query || `${chamber.name} ${chamber.tagline ?? ''} ${chamber.description ?? ''}`.toLowerCase().includes(query);
  });
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 110,
        }}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Community</Text>
          <Text style={styles.subtitle}>Chambers, forums, clubs & discovery</Text>
        </View>

        <View style={styles.searchBar}>
          <Ionicons name="search" size={19} color={colors.textMuted} />
          <TextInput
            placeholder="Search chambers, people, topics..."
            placeholderTextColor={colors.textMuted}
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
            onSubmitEditing={() => search.trim() && router.push({ pathname: '/ai-search', params: { q: search.trim() } })}
          />
        </View>

        {/* Clubs & Events shortcut */}
        <Pressable style={styles.clubsBanner} onPress={() => router.push('/clubs')}>
          <View style={styles.clubsIcon}>
            <Ionicons name="calendar" size={22} color={colors.white} />
          </View>
          <View
            style={{
              flex: 1,
            }}
          >
            <Text style={styles.clubsTitle}>Clubs & Events</Text>
            <Text style={styles.clubsSub}>Discover clubs, seminars & competitions</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.white} />
        </Pressable>

        <Pressable style={styles.musicBanner} onPress={() => router.push('/music')}>
          <View style={styles.musicIcon}><Ionicons name="musical-notes" size={20} color={colors.white} /></View>
          <View style={{ flex: 1 }}>
            <Text style={styles.musicTitle}>Explore music</Text>
            <Text style={styles.musicSub}>Search songs and play official previews</Text>
          </View>
          <Ionicons name="chevron-forward" size={19} color={colors.textMuted} />
        </Pressable>

        <Text style={styles.sectionTitle}>Chambers</Text>
        {isLoading && (
          <ActivityIndicator
            color={colors.primary}
            style={{
              marginTop: spacing.lg,
            }}
          />
        )}
        <ScrollView horizontal nestedScrollEnabled showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chamberShelf}>
          {visibleChambers.map((c) => {
            const t = chamberThemes[c.theme] ?? chamberThemes.economics;
            return (
              <Pressable key={c.id} style={styles.chamberItem} onPress={() => router.push(`/chamber/${c.id}`)}>
                <Card style={styles.row}>
                  <View style={[styles.icon, { backgroundColor: t.color }]}>
                    <Text style={{ fontSize: 26 }}>{c.emoji}</Text>
                  </View>
                  <View style={styles.nameRow}>
                    <Text style={styles.name} numberOfLines={1}>{c.name}</Text>
                    {(c.joined || c.recommended) && (
                      <View style={[styles.joinedPill, { backgroundColor: t.soft }]}>
                        <Text style={[styles.joinedText, { color: t.color }]}>{c.joined ? 'Joined' : 'Recommended'}</Text>
                      </View>
                    )}
                  </View>
                  <Text style={styles.tagline} numberOfLines={2}>{c.tagline}</Text>
                  <View style={styles.metaRow}>
                    <View accessibilityLabel={`${c.visibility || 'university'} visibility`} style={styles.scopeBadge}>
                      <Text style={styles.scopeText}>{c.visibility === 'national' ? 'National' : c.visibility === 'department' ? 'Department' : c.visibility === 'course' ? 'Course' : 'University'}</Text>
                    </View>
                    <Ionicons name="people-outline" size={13} color={colors.textMuted} />
                    <Text style={styles.meta}>{c.memberCount} Members</Text>
                  </View>
                </Card>
              </Pressable>
            );
          })}
        </ScrollView>
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = themedStyles((colors) => ({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    height: 50,
    borderRadius: radii.lg,
    ...shadow.soft,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
  },
  clubsBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.xl,
    ...shadow.card,
  },
  musicBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginHorizontal: spacing.lg,
    marginTop: spacing.sm,
    padding: spacing.md,
    borderRadius: radii.lg,
    backgroundColor: colors.surface,
  },
  musicIcon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F2994A' },
  musicTitle: { fontSize: 14, fontWeight: '700', color: colors.text },
  musicSub: { fontSize: 12, color: colors.textMuted, marginTop: 3 },
  clubsIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.md,
    backgroundColor: 'rgba(255,255,255,0.22)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clubsTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.white,
  },
  clubsSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 1,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.text,
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
  },
  row: {
    minHeight: 180,
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.md,
  },
  chamberShelf: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    gap: spacing.md,
  },
  chamberItem: {
    width: 230,
  },
  icon: {
    width: 54,
    height: 54,
    borderRadius: radii.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  name: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
  },
  joinedPill: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radii.pill,
  },
  joinedText: {
    fontSize: 10,
    fontWeight: '700',
  },
  tagline: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 4,
  },
  scopeBadge: {
    backgroundColor: colors.primarySoft,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  scopeText: { color: colors.primary, fontSize: 10, fontWeight: '700' },
  meta: {
    fontSize: 12,
    color: colors.textMuted,
  },
}));
