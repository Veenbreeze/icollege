import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radii, spacing, shadow, chamberThemes , themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import {
  chambers,
  chamberTabs,
  postFilters,
  pinnedPost,
  trendingTopics,
  posts,
} from '@/data/mock';

export default function ChamberScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const chamber = chambers.find((c) => c.id === id) ?? chambers[1];
  const t = chamberThemes[chamber.theme] ?? chamberThemes.economics;

  const [tab, setTab] = useState('Feed');
  const [filter, setFilter] = useState('All Posts');
  const [joined, setJoined] = useState(true);

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
          <View style={styles.topRight}>
            <View>
              <Ionicons name="notifications-outline" size={23} color={colors.text} />
              <View style={styles.bellBadge}><Text style={styles.bellBadgeText}>5</Text></View>
            </View>
            <Ionicons name="ellipsis-horizontal" size={23} color={colors.text} />
          </View>
        </View>

        {/* Chamber header */}
        <View style={styles.chamberHead}>
          <View style={[styles.chamberIcon, { backgroundColor: t.color }]}>
            <Text style={{ fontSize: 38 }}>{chamber.emoji}</Text>
          </View>
          <Text style={styles.chamberTitle}>{chamber.name} Chamber</Text>
          <Text style={[styles.chamberTagline, { color: t.color }]}>{chamber.tagline}</Text>
          <Text style={styles.chamberDesc}>{chamber.description}</Text>
        </View>

        {/* Stats + join */}
        <View style={styles.statsRow}>
          <View style={styles.avatarStack}>
            {['A', 'B', 'C', 'D'].map((x, i) => (
              <View key={x} style={[styles.stackAvatar, { left: i * 18, backgroundColor: [colors.primary, colors.green, colors.orange, colors.blue][i] }]}>
                <Text style={styles.stackInitial}>{x}</Text>
              </View>
            ))}
          </View>
          <Stat value={chamber.members.replace(' Members', '')} label="Members" />
          <Stat value={chamber.online?.replace(' Online', '') ?? '245'} label="Online" />
          <Stat value={chamber.postsToday?.replace(' Posts Today', '') ?? '152'} label="Posts Today" />
          <Pressable
            style={[styles.joinBtn, { borderColor: t.color, backgroundColor: joined ? colors.surface : t.color }]}
            onPress={() => setJoined((j) => !j)}
          >
            <Ionicons name={joined ? 'checkmark-circle' : 'add'} size={16} color={joined ? t.color : colors.white} />
            <Text style={[styles.joinText, { color: joined ? t.color : colors.white }]}>{joined ? 'Joined' : 'Join'}</Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {chamberTabs.map((tb) => {
            const active = tb === tab;
            return (
              <Pressable key={tb} style={styles.tabItem} onPress={() => setTab(tb)}>
                <Text style={[styles.tabText, active && { color: t.color, fontWeight: '700' }]}>{tb}</Text>
                {active && <View style={[styles.tabUnderline, { backgroundColor: t.color }]} />}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Composer */}
        <View style={styles.composer}>
          <Avatar initials="DM" size={38} color={t.color} />
          <View style={styles.composerInput}>
            <Text style={styles.composerText}>What&apos;s on your mind?</Text>
          </View>
          <View style={[styles.composerAdd, { backgroundColor: t.color }]}>
            <Ionicons name="add" size={20} color={colors.white} />
          </View>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {postFilters.map((f) => {
            const active = f === filter;
            const icon: any = { 'All Posts': 'grid-outline', Questions: 'help-circle-outline', News: 'newspaper-outline', 'Study Help': 'school-outline', Opportunities: 'briefcase-outline' }[f];
            return (
              <Pressable
                key={f}
                style={[styles.chip, active ? { backgroundColor: t.color, borderColor: t.color } : { borderColor: colors.border }]}
                onPress={() => setFilter(f)}
              >
                <Ionicons name={icon} size={14} color={active ? colors.white : colors.textSecondary} />
                <Text style={[styles.chipText, { color: active ? colors.white : colors.textSecondary }]}>{f}</Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Pinned */}
        <View style={styles.sectionHead}>
          <View style={styles.sectionHeadLeft}>
            <Ionicons name="pin" size={16} color={t.color} />
            <Text style={styles.sectionTitle}>Pinned Posts</Text>
          </View>
          <Text style={[styles.viewAll, { color: t.color }]}>View all ›</Text>
        </View>
        <Card style={[styles.pinnedCard, { backgroundColor: t.soft }]}>
          <View style={styles.pinnedTop}>
            <Ionicons name="pin" size={13} color={t.color} />
            <Text style={styles.pinnedAuthor}>{pinnedPost.author}</Text>
            <Text style={styles.pinnedTime}>• {pinnedPost.time}</Text>
          </View>
          <Text style={styles.pinnedTitle}>📌 {pinnedPost.title}</Text>
          <Text style={styles.pinnedBody}>{pinnedPost.body}</Text>
          <View style={styles.reactRow}>
            <React icon="thumbs-up-outline" value={pinnedPost.likes} color={t.color} />
            <React icon="chatbubble-outline" value={pinnedPost.comments} color={colors.textMuted} />
            <React icon="arrow-redo-outline" value={pinnedPost.shares} color={colors.textMuted} />
          </View>
        </Card>

        {/* Trending */}
        <View style={styles.sectionHead}>
          <View style={styles.sectionHeadLeft}>
            <Ionicons name="trending-up" size={16} color={t.color} />
            <Text style={styles.sectionTitle}>Trending Topics</Text>
          </View>
          <Text style={[styles.viewAll, { color: t.color }]}>View all ›</Text>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.trendingRow}>
          {trendingTopics.map((tp) => (
            <View key={tp.title} style={styles.trendCard}>
              <Text style={{ fontSize: 26 }}>{tp.emoji}</Text>
              <Text style={styles.trendTitle} numberOfLines={2}>{tp.title}</Text>
              <Text style={styles.trendPosts}>{tp.posts}</Text>
            </View>
          ))}
        </ScrollView>

        {/* Latest posts */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Latest Posts</Text>
          <View style={styles.sortRow}>
            <Text style={styles.sortText}>Sort by: Latest</Text>
            <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
          </View>
        </View>

        {posts.map((p) => (
          <Pressable key={p.id} onPress={() => router.push(`/post/${p.id}` as any)}>
          <Card style={styles.postCard}>
            <View style={styles.postHead}>
              <Avatar initials={p.initials} size={40} color={t.color} />
              <View style={{ flex: 1, marginLeft: spacing.sm }}>
                <View style={styles.postAuthorRow}>
                  <Text style={styles.postAuthor}>{p.author}</Text>
                  {p.topContributor && (
                    <View style={[styles.topBadge, { backgroundColor: t.soft }]}>
                      <Ionicons name="ribbon" size={11} color={t.color} />
                      <Text style={[styles.topBadgeText, { color: t.color }]}>Top Contributor</Text>
                    </View>
                  )}
                  <Text style={styles.postTime}>• {p.time}</Text>
                </View>
                <Text style={styles.postSub}>{p.year} • {p.chamber}</Text>
              </View>
              {p.tag && (
                <View style={[styles.tagPill, { backgroundColor: p.tag.kind === 'news' ? colors.blueSoft : t.soft }]}>
                  <Text style={[styles.tagText, { color: p.tag.kind === 'news' ? colors.blue : t.color }]}>{p.tag.label}</Text>
                </View>
              )}
            </View>
            <Text style={styles.postTitle}>{p.title}</Text>
            {p.body && <Text style={styles.postBody}>{p.body}</Text>}
            <View style={styles.postFooter}>
              <React icon="thumbs-up-outline" value={p.likes} color={t.color} />
              <React icon="chatbubble-outline" value={p.comments} color={colors.textMuted} />
              <View style={{ flex: 1 }} />
              <Ionicons name="bookmark-outline" size={18} color={colors.textMuted} />
            </View>
          </Card>
          </Pressable>
        ))}
      </ScrollView>

      {/* FAB */}
      <Pressable style={[styles.fab, { backgroundColor: t.color }]}>
        <Ionicons name="create-outline" size={24} color={colors.white} />
      </Pressable>
    </SafeAreaView>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function React({ icon, value, color }: { icon: any; value: number; color: string }) {
  return (
    <View style={styles.react}>
      <Ionicons name={icon} size={16} color={color} />
      <Text style={styles.reactText}>{value}</Text>
    </View>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },

  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, paddingTop: spacing.sm },
  topRight: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  bellBadge: { position: 'absolute', top: -6, right: -6, backgroundColor: colors.red, minWidth: 15, height: 15, borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 3 },
  bellBadgeText: { color: colors.white, fontSize: 9, fontWeight: '700' },

  chamberHead: { paddingHorizontal: spacing.lg, marginTop: spacing.md },
  chamberIcon: { width: 76, height: 76, borderRadius: radii.xl, alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  chamberTitle: { fontSize: 26, fontWeight: '800', color: colors.text },
  chamberTagline: { fontSize: 15, fontWeight: '600', marginTop: 2 },
  chamberDesc: { fontSize: 14, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 20 },

  statsRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.md },
  avatarStack: { width: 74, height: 32 },
  stackAvatar: { position: 'absolute', width: 30, height: 30, borderRadius: 15, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: colors.bg },
  stackInitial: { color: colors.white, fontSize: 11, fontWeight: '700' },
  statItem: { alignItems: 'center' },
  statValue: { fontSize: 15, fontWeight: '800', color: colors.text },
  statLabel: { fontSize: 10, color: colors.textMuted, marginTop: 1 },
  joinBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1.5, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, marginLeft: 'auto' },
  joinText: { fontSize: 13, fontWeight: '700' },

  tabsRow: { paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.xl, borderBottomWidth: 1, borderBottomColor: colors.border },
  tabItem: { paddingBottom: spacing.md, alignItems: 'center' },
  tabText: { fontSize: 14, color: colors.textMuted },
  tabUnderline: { position: 'absolute', bottom: -1, height: 2.5, left: 0, right: 0, borderRadius: 2 },

  composer: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: colors.surface, marginHorizontal: spacing.lg, marginTop: spacing.lg, padding: spacing.sm, borderRadius: radii.pill, ...shadow.soft },
  composerInput: { flex: 1 },
  composerText: { fontSize: 14, color: colors.textMuted },
  composerAdd: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },

  chips: { paddingHorizontal: spacing.lg, marginTop: spacing.lg, gap: spacing.sm },
  chip: { flexDirection: 'row', alignItems: 'center', gap: 5, borderWidth: 1.5, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  chipText: { fontSize: 13, fontWeight: '600' },

  sectionHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg, marginTop: spacing.xl },
  sectionHeadLeft: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text },
  viewAll: { fontSize: 12, fontWeight: '600' },

  pinnedCard: { marginHorizontal: spacing.lg, marginTop: spacing.md },
  pinnedTop: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: spacing.sm },
  pinnedAuthor: { fontSize: 12, fontWeight: '700', color: colors.text },
  pinnedTime: { fontSize: 12, color: colors.textMuted },
  pinnedTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  pinnedBody: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 19 },
  reactRow: { flexDirection: 'row', gap: spacing.xl, marginTop: spacing.md },

  trendingRow: { paddingHorizontal: spacing.lg, marginTop: spacing.md, gap: spacing.md },
  trendCard: { width: 130, backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, gap: 6, ...shadow.soft },
  trendTitle: { fontSize: 13, fontWeight: '700', color: colors.text },
  trendPosts: { fontSize: 11, color: colors.textMuted },

  sortRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  sortText: { fontSize: 12, color: colors.textMuted },

  postCard: { marginHorizontal: spacing.lg, marginTop: spacing.md },
  postHead: { flexDirection: 'row', alignItems: 'center' },
  postAuthorRow: { flexDirection: 'row', alignItems: 'center', gap: 5, flexWrap: 'wrap' },
  postAuthor: { fontSize: 14, fontWeight: '700', color: colors.text },
  topBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.pill },
  topBadgeText: { fontSize: 10, fontWeight: '700' },
  postTime: { fontSize: 12, color: colors.textMuted },
  postSub: { fontSize: 12, color: colors.textMuted, marginTop: 1 },
  tagPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill },
  tagText: { fontSize: 11, fontWeight: '700' },
  postTitle: { fontSize: 15, fontWeight: '700', color: colors.text, marginTop: spacing.md },
  postBody: { fontSize: 13, color: colors.textSecondary, marginTop: 4, lineHeight: 19 },
  postFooter: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },

  react: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  reactText: { fontSize: 12, color: colors.textSecondary, fontWeight: '600' },

  fab: { position: 'absolute', right: spacing.lg, bottom: spacing.xxl, width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', ...shadow.card },
}));
