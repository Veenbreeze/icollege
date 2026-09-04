import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { colors, radii, spacing, shadow , themedStyles } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { posts, postComments, type Comment } from '@/data/mock';

export default function PostScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const post = posts.find((p) => p.id === id) ?? posts[0];
  const [comments, setComments] = useState<Comment[]>(postComments[post.id] ?? []);
  const [draft, setDraft] = useState('');
  const [liked, setLiked] = useState(false);

  const addComment = () => {
    const t = draft.trim();
    if (!t) return;
    setComments((c) => [
      ...c,
      { id: String(Date.now()), author: 'Daniel Mwakideu', initials: 'DM', color: colors.primary, year: 'Year 2', time: 'now', text: t, likes: 0 },
    ]);
    setDraft('');
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Post</Text>
        <Ionicons name="share-social-outline" size={22} color={colors.text} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: spacing.lg }}>
        {/* Post */}
        <View style={styles.post}>
          <View style={styles.postHead}>
            <Avatar initials={post.initials} size={44} color={colors.green} />
            <View style={{ flex: 1, marginLeft: spacing.sm }}>
              <View style={styles.authorRow}>
                <Text style={styles.author}>{post.author}</Text>
                {post.topContributor && (
                  <View style={styles.topBadge}>
                    <Ionicons name="ribbon" size={11} color={colors.green} />
                    <Text style={styles.topText}>Top Contributor</Text>
                  </View>
                )}
              </View>
              <Text style={styles.sub}>{post.year} · {post.chamber} · {post.time}</Text>
            </View>
            <Ionicons name="ellipsis-horizontal" size={20} color={colors.textMuted} />
          </View>

          {post.tag && (
            <View style={[styles.tagPill, { backgroundColor: post.tag.kind === 'news' ? colors.blueSoft : colors.greenSoft }]}>
              <Text style={[styles.tagText, { color: post.tag.kind === 'news' ? colors.blue : colors.green }]}>{post.tag.label}</Text>
            </View>
          )}

          <Text style={styles.title}>{post.title}</Text>
          {post.body && <Text style={styles.body}>{post.body}</Text>}

          {/* Actions */}
          <View style={styles.actions}>
            <Pressable style={styles.action} onPress={() => setLiked((l) => !l)}>
              <Ionicons name={liked ? 'thumbs-up' : 'thumbs-up-outline'} size={19} color={liked ? colors.primary : colors.textSecondary} />
              <Text style={[styles.actionText, liked && { color: colors.primary }]}>{post.likes + (liked ? 1 : 0)}</Text>
            </Pressable>
            <View style={styles.action}>
              <Ionicons name="chatbubble-outline" size={18} color={colors.textSecondary} />
              <Text style={styles.actionText}>{comments.length}</Text>
            </View>
            <View style={styles.action}>
              <Ionicons name="arrow-redo-outline" size={19} color={colors.textSecondary} />
              <Text style={styles.actionText}>Share</Text>
            </View>
            <View style={{ flex: 1 }} />
            <Ionicons name="bookmark-outline" size={19} color={colors.textSecondary} />
          </View>
        </View>

        {/* Comments */}
        <Text style={styles.commentsTitle}>{comments.length} Comments</Text>
        {comments.map((c) => (
          <View key={c.id} style={styles.comment}>
            <Avatar initials={c.initials} size={36} color={c.color} />
            <View style={{ flex: 1 }}>
              <View style={[styles.commentBubble, c.best && styles.bestBubble]}>
                <View style={styles.commentTop}>
                  <Text style={styles.commentAuthor}>{c.author}</Text>
                  <Text style={styles.commentYear}>{c.year}</Text>
                  {c.best && (
                    <View style={styles.bestBadge}>
                      <Ionicons name="checkmark-circle" size={11} color={colors.green} />
                      <Text style={styles.bestText}>Best answer</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.commentText}>{c.text}</Text>
              </View>
              <View style={styles.commentActions}>
                <Text style={styles.commentTime}>{c.time}</Text>
                <Pressable style={styles.likeBtn}>
                  <Ionicons name="heart-outline" size={14} color={colors.textMuted} />
                  <Text style={styles.likeText}>{c.likes}</Text>
                </Pressable>
                <Text style={styles.replyText}>Reply</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      {/* Comment composer */}
      <View style={styles.composer}>
        <Avatar initials="DM" size={34} color={colors.primary} />
        <TextInput
          style={styles.input}
          placeholder="Add a comment..."
          placeholderTextColor={colors.textMuted}
          value={draft}
          onChangeText={setDraft}
        />
        <Pressable style={styles.send} onPress={addComment}>
          <Ionicons name="send" size={18} color={colors.white} />
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: colors.bg },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md, backgroundColor: colors.surface, ...shadow.soft,
  },
  headerTitle: { fontSize: 17, fontWeight: '700', color: colors.text },

  post: { backgroundColor: colors.surface, padding: spacing.lg, marginBottom: spacing.sm },
  postHead: { flexDirection: 'row', alignItems: 'center' },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  author: { fontSize: 15, fontWeight: '700', color: colors.text },
  topBadge: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: colors.greenSoft, paddingHorizontal: 6, paddingVertical: 2, borderRadius: radii.pill },
  topText: { fontSize: 10, fontWeight: '700', color: colors.green },
  sub: { fontSize: 12, color: colors.textMuted, marginTop: 2 },

  tagPill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radii.pill, marginTop: spacing.md },
  tagText: { fontSize: 11, fontWeight: '700' },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, marginTop: spacing.md, lineHeight: 25 },
  body: { fontSize: 14.5, color: colors.textSecondary, marginTop: spacing.sm, lineHeight: 21 },

  actions: { flexDirection: 'row', alignItems: 'center', gap: spacing.xl, marginTop: spacing.lg, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border },
  action: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, color: colors.textSecondary, fontWeight: '600' },

  commentsTitle: { fontSize: 15, fontWeight: '800', color: colors.text, paddingHorizontal: spacing.lg, paddingVertical: spacing.md },
  comment: { flexDirection: 'row', gap: spacing.sm, paddingHorizontal: spacing.lg, marginBottom: spacing.lg },
  commentBubble: { backgroundColor: colors.surface, borderRadius: radii.lg, padding: spacing.md, ...shadow.soft },
  bestBubble: { borderWidth: 1.5, borderColor: colors.greenSoft, backgroundColor: colors.greenSoft },
  commentTop: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3, flexWrap: 'wrap' },
  commentAuthor: { fontSize: 13.5, fontWeight: '700', color: colors.text },
  commentYear: { fontSize: 11, color: colors.textMuted },
  bestBadge: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  bestText: { fontSize: 10, fontWeight: '700', color: colors.green },
  commentText: { fontSize: 13.5, color: colors.textSecondary, lineHeight: 19 },
  commentActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginTop: 6, paddingLeft: spacing.sm },
  commentTime: { fontSize: 11, color: colors.textMuted },
  likeBtn: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  likeText: { fontSize: 11, color: colors.textMuted },
  replyText: { fontSize: 11.5, fontWeight: '700', color: colors.primary },

  composer: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm, backgroundColor: colors.surface, borderTopWidth: 1, borderTopColor: colors.border,
  },
  input: {
    flex: 1, height: 44, backgroundColor: colors.surfaceMuted, borderRadius: radii.pill,
    paddingHorizontal: spacing.lg, fontSize: 14, color: colors.text,
  },
  send: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
}));
