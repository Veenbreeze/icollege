import { useState } from 'react';
import { View, Text, ScrollView, Pressable, TextInput, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radii, spacing, shadow, chamberThemes, themedStyles } from '@/theme';
import { Card } from '@/components/ui/Card';
import { Avatar } from '@/components/ui/Avatar';
import { ClaySurface } from '@/components/ui/ClaySurface';
import { useApi } from '@/hooks/useApi';
import { fetchChamber, fetchChamberPosts, joinChamber, createPost, togglePostLike } from '@/lib/api/community';
import { useAuth } from '@/lib/auth/AuthContext';
import { initialsOf } from '@/lib/initials';
import { resolveMediaUrl } from '@/lib/api/client';
import { timeAgo } from '@/lib/timeAgo';
import { chamberTabs, postFilters } from '@/data/mock';
const FILTER_TO_TAG = {
  'All Posts': undefined,
  Questions: 'question',
  News: 'news',
  Opportunities: 'opportunity',
  'Study Help': undefined, // no schema tag for this yet — falls back to All
};
export default function ChamberScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState('Feed');
  const [filter, setFilter] = useState('All Posts');
  const [draft, setDraft] = useState('');
  const [posting, setPosting] = useState(false);
  const { data: chamber, refetch: refetchChamber } = useApi(() => fetchChamber(id), [id]);
  const {
    data: posts,
    isLoading: loadingPosts,
    refetch: refetchPosts,
  } = useApi(() => fetchChamberPosts(id, FILTER_TO_TAG[filter]), [id, filter]);
  const t = chamberThemes[chamber?.theme ?? ''] ?? chamberThemes.economics;
  const onToggleJoin = async () => {
    await joinChamber(id);
    refetchChamber();
  };
  const onPost = async () => {
    const title = draft.trim();
    if (!title) return;
    setPosting(true);
    try {
      await createPost(id, {
        title,
        tag: FILTER_TO_TAG[filter],
      });
      setDraft('');
      refetchPosts();
      refetchChamber();
    } finally {
      setPosting(false);
    }
  };
  const onLike = async (postId) => {
    await togglePostLike(postId);
    refetchPosts();
  };
  if (!chamber) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <ActivityIndicator
          color={colors.primary}
          style={{
            marginTop: spacing.xxl,
          }}
        />
      </SafeAreaView>
    );
  }
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 40,
        }}
      >
        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </Pressable>
        </View>

        {/* Chamber header */}
        <View style={styles.chamberHead}>
          <ClaySurface
            radius={radii.xl}
            style={[
              styles.chamberIcon,
              {
                backgroundColor: t.color,
              },
            ]}
          >
            <Text
              style={{
                fontSize: 38,
              }}
            >
              {chamber.emoji}
            </Text>
          </ClaySurface>
          <Text style={styles.chamberTitle}>{chamber.name} Chamber</Text>
          <Text
            style={[
              styles.chamberTagline,
              {
                color: t.color,
              },
            ]}
          >
            {chamber.tagline}
          </Text>
          <Text style={styles.chamberDesc}>{chamber.description}</Text>
        </View>

        {/* Stats + join */}
        <View style={styles.statsRow}>
          <Stat value={String(chamber.memberCount)} label="Members" />
          <Stat value={String(chamber.postCount)} label="Posts" />
          <Pressable
            style={[
              styles.joinBtn,
              {
                borderColor: t.color,
                backgroundColor: chamber.joined ? colors.surface : t.color,
              },
            ]}
            onPress={onToggleJoin}
          >
            <Ionicons
              name={chamber.joined ? 'checkmark-circle' : 'add'}
              size={16}
              color={chamber.joined ? t.color : colors.white}
            />
            <Text
              style={[
                styles.joinText,
                {
                  color: chamber.joined ? t.color : colors.white,
                },
              ]}
            >
              {chamber.joined ? 'Joined' : 'Join'}
            </Text>
          </Pressable>
        </View>

        {/* Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsRow}>
          {chamberTabs.map((tb) => {
            const active = tb === tab;
            return (
              <Pressable key={tb} style={styles.tabItem} onPress={() => setTab(tb)}>
                <Text
                  style={[
                    styles.tabText,
                    active && {
                      color: t.color,
                      fontWeight: '700',
                    },
                  ]}
                >
                  {tb}
                </Text>
                {active && (
                  <View
                    style={[
                      styles.tabUnderline,
                      {
                        backgroundColor: t.color,
                      },
                    ]}
                  />
                )}
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Composer */}
        <View style={styles.composer}>
          <Avatar initials={user ? initialsOf(user.fullName) : ''} uri={resolveMediaUrl(user?.avatarUrl)} size={38} color={t.color} />
          <TextInput
            style={styles.composerInput}
            placeholder="What's on your mind?"
            placeholderTextColor={colors.textMuted}
            value={draft}
            onChangeText={setDraft}
            onSubmitEditing={onPost}
          />
          <Pressable
            style={[
              styles.composerAdd,
              {
                backgroundColor: t.color,
              },
            ]}
            onPress={onPost}
            disabled={posting}
          >
            {posting ? (
              <ActivityIndicator size="small" color={colors.white} />
            ) : (
              <Ionicons name="send" size={18} color={colors.white} />
            )}
          </Pressable>
        </View>

        {/* Filter chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
          {postFilters.map((f) => {
            const active = f === filter;
            const icon = {
              'All Posts': 'grid-outline',
              Questions: 'help-circle-outline',
              News: 'newspaper-outline',
              'Study Help': 'school-outline',
              Opportunities: 'briefcase-outline',
            }[f];
            return (
              <Pressable
                key={f}
                style={[
                  styles.chip,
                  active
                    ? {
                        backgroundColor: t.color,
                        borderColor: t.color,
                      }
                    : {
                        borderColor: colors.border,
                      },
                ]}
                onPress={() => setFilter(f)}
              >
                <Ionicons name={icon} size={14} color={active ? colors.white : colors.textSecondary} />
                <Text
                  style={[
                    styles.chipText,
                    {
                      color: active ? colors.white : colors.textSecondary,
                    },
                  ]}
                >
                  {f}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Latest posts */}
        <View style={styles.sectionHead}>
          <Text style={styles.sectionTitle}>Latest Posts</Text>
        </View>

        {loadingPosts && (
          <ActivityIndicator
            color={colors.primary}
            style={{
              marginTop: spacing.lg,
            }}
          />
        )}
        {!loadingPosts && (posts ?? []).length === 0 && (
          <Text style={styles.emptyText}>No posts yet. Be the first to share something.</Text>
        )}

        {(posts ?? []).map((p) => (
          <PostCard
            key={p.id}
            post={p}
            themeColor={t.color}
            themeSoft={t.soft}
            onOpen={() => router.push(`/post/${p.id}`)}
            onLike={() => onLike(p.id)}
          />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
function PostCard({ post: p, themeColor, themeSoft, onOpen, onLike }) {
  return (
    <Pressable onPress={onOpen}>
      <Card style={styles.postCard}>
        <View style={styles.postHead}>
          <Avatar initials={p.initials} size={40} color={themeColor} />
          <View
            style={{
              flex: 1,
              marginLeft: spacing.sm,
            }}
          >
            <View style={styles.postAuthorRow}>
              <Text style={styles.postAuthor}>{p.author}</Text>
              <Text style={styles.postTime}>• {timeAgo(p.time)}</Text>
            </View>
            <Text style={styles.postSub}>
              {p.year} • {p.chamber}
            </Text>
          </View>
          {p.tag && (
            <View
              style={[
                styles.tagPill,
                {
                  backgroundColor: p.tag.kind === 'news' ? colors.blueSoft : themeSoft,
                },
              ]}
            >
              <Text
                style={[
                  styles.tagText,
                  {
                    color: p.tag.kind === 'news' ? colors.blue : themeColor,
                  },
                ]}
              >
                {p.tag.label}
              </Text>
            </View>
          )}
        </View>
        <Text style={styles.postTitle}>{p.title}</Text>
        {p.body && <Text style={styles.postBody}>{p.body}</Text>}
        <View style={styles.postFooter}>
          <Pressable style={styles.react} onPress={onLike} hitSlop={6}>
            <Ionicons name={p.likedByMe ? 'thumbs-up' : 'thumbs-up-outline'} size={16} color={themeColor} />
            <Text style={styles.reactText}>{p.likes}</Text>
          </Pressable>
          <View style={styles.react}>
            <Ionicons name="chatbubble-outline" size={16} color={colors.textMuted} />
            <Text style={styles.reactText}>{p.comments}</Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}
function Stat({ value, label }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}
const styles = themedStyles((colors) => ({
  safe: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
  },
  chamberHead: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  chamberIcon: {
    width: 76,
    height: 76,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  chamberTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  chamberTagline: {
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  chamberDesc: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.text,
  },
  statLabel: {
    fontSize: 10,
    color: colors.textMuted,
    marginTop: 1,
  },
  joinBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    borderWidth: 1.5,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginLeft: 'auto',
  },
  joinText: {
    fontSize: 13,
    fontWeight: '700',
  },
  tabsRow: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    paddingBottom: spacing.md,
    alignItems: 'center',
  },
  tabText: {
    fontSize: 14,
    color: colors.textMuted,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: -1,
    height: 2.5,
    left: 0,
    right: 0,
    borderRadius: 2,
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.surface,
    marginHorizontal: spacing.lg,
    marginTop: spacing.lg,
    padding: spacing.sm,
    borderRadius: radii.pill,
    ...shadow.soft,
  },
  composerInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text,
    paddingHorizontal: spacing.sm,
  },
  composerAdd: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chips: {
    paddingHorizontal: spacing.lg,
    marginTop: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    borderWidth: 1.5,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    marginTop: spacing.xl,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.text,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  postCard: {
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
  },
  postHead: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  postAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flexWrap: 'wrap',
  },
  postAuthor: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.text,
  },
  postTime: {
    fontSize: 12,
    color: colors.textMuted,
  },
  postSub: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 1,
  },
  tagPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.pill,
  },
  tagText: {
    fontSize: 11,
    fontWeight: '700',
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.md,
  },
  postBody: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    lineHeight: 19,
  },
  postFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xl,
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  react: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  reactText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '600',
  },
}));
