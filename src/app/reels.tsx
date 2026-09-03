import { useState } from 'react';
import { View, Text, ScrollView, Pressable, StyleSheet, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing , themedStyles } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { reels, stories, type Reel } from '@/data/mock';

export default function ReelsScreen() {
  const router = useRouter();
  const { height } = useWindowDimensions();
  // reel height fills the screen minus the stories bar
  const reelHeight = height - 96;

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header + stories */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Reels & Stories</Text>
        <Ionicons name="camera-outline" size={24} color={colors.white} />
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.storiesBar} contentContainerStyle={styles.storiesContent}>
        {stories.map((s) => (
          <View key={s.id} style={styles.story}>
            <View style={[styles.storyRing, !s.viewed && !s.mine && styles.storyRingActive, s.mine && styles.storyRingMine]}>
              <Avatar initials={s.initials} size={54} color={s.color} />
              {s.mine && (
                <View style={styles.storyAdd}>
                  <Ionicons name="add" size={13} color={colors.white} />
                </View>
              )}
            </View>
            <Text style={styles.storyName} numberOfLines={1}>{s.name}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Reels vertical feed */}
      <ScrollView
        pagingEnabled
        showsVerticalScrollIndicator={false}
        snapToInterval={reelHeight}
        decelerationRate="fast"
      >
        {reels.map((r) => (
          <ReelCard key={r.id} reel={r} h={reelHeight} />
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

function ReelCard({ reel, h }: { reel: Reel; h: number }) {
  const [liked, setLiked] = useState(false);

  return (
    <View style={[styles.reel, { height: h, backgroundColor: reel.bg }]}>
      {/* faux video content */}
      <View style={styles.reelCenter}>
        <Text style={{ fontSize: 90 }}>{reel.emoji}</Text>
        <View style={styles.playHint}>
          <Ionicons name="play" size={20} color="rgba(255,255,255,0.9)" />
        </View>
      </View>

      {/* Right action rail */}
      <View style={styles.rail}>
        <RailAction icon={liked ? 'heart' : 'heart-outline'} label={reel.likes} active={liked} onPress={() => setLiked((l) => !l)} />
        <RailAction icon="chatbubble-outline" label={reel.comments} />
        <RailAction icon="arrow-redo-outline" label={reel.shares} />
        <RailAction icon="bookmark-outline" label="Save" />
        <View style={styles.discWrap}>
          <View style={styles.disc}>
            <Ionicons name="musical-notes" size={16} color={colors.white} />
          </View>
        </View>
      </View>

      {/* Bottom info */}
      <View style={styles.bottom}>
        <View style={styles.authorRow}>
          <Avatar initials={reel.initials} size={36} color={colors.white} />
          <Text style={styles.author}>@{reel.author.replace(/\s+/g, '').toLowerCase()}</Text>
          <View style={styles.followBtn}>
            <Text style={styles.followText}>Follow</Text>
          </View>
        </View>
        <Text style={styles.caption}>{reel.caption}</Text>
        <View style={styles.musicRow}>
          <Ionicons name="musical-notes" size={13} color={colors.white} />
          <Text style={styles.music}>{reel.music}</Text>
          <View style={styles.chamberTag}>
            <Text style={styles.chamberText}>#{reel.chamber}</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function RailAction({ icon, label, active, onPress }: { icon: any; label: string; active?: boolean; onPress?: () => void }) {
  return (
    <Pressable style={styles.railAction} onPress={onPress}>
      <Ionicons name={icon} size={28} color={active ? colors.red : colors.white} />
      <Text style={styles.railLabel}>{label}</Text>
    </Pressable>
  );
}

const styles = themedStyles((colors) => ({
  safe: { flex: 1, backgroundColor: '#0E0E1A' },
  header: {
    position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  headerTitle: { fontSize: 17, fontWeight: '800', color: colors.white },

  storiesBar: { position: 'absolute', top: 44, left: 0, right: 0, zIndex: 10, maxHeight: 92 },
  storiesContent: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingVertical: spacing.sm },
  story: { alignItems: 'center', width: 64 },
  storyRing: { padding: 2, borderRadius: 32, borderWidth: 2, borderColor: 'rgba(255,255,255,0.3)' },
  storyRingActive: { borderColor: colors.primaryLight },
  storyRingMine: { borderColor: 'rgba(255,255,255,0.4)' },
  storyAdd: { position: 'absolute', bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#0E0E1A' },
  storyName: { fontSize: 11, color: colors.white, marginTop: 4 },

  reel: { justifyContent: 'center', alignItems: 'center', position: 'relative' },
  reelCenter: { alignItems: 'center', gap: spacing.lg },
  playHint: { width: 54, height: 54, borderRadius: 27, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },

  rail: { position: 'absolute', right: spacing.md, bottom: 130, alignItems: 'center', gap: spacing.xl },
  railAction: { alignItems: 'center', gap: 4 },
  railLabel: { fontSize: 11, color: colors.white, fontWeight: '600' },
  discWrap: { marginTop: spacing.sm },
  disc: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)' },

  bottom: { position: 'absolute', left: spacing.lg, right: 80, bottom: spacing.xxl },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  author: { fontSize: 15, fontWeight: '800', color: colors.white },
  followBtn: { borderWidth: 1.5, borderColor: colors.white, borderRadius: radii.pill, paddingHorizontal: spacing.md, paddingVertical: 4 },
  followText: { fontSize: 12, fontWeight: '700', color: colors.white },
  caption: { fontSize: 14, color: colors.white, marginTop: spacing.md, lineHeight: 20 },
  musicRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: spacing.md },
  music: { fontSize: 12.5, color: colors.white },
  chamberTag: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: radii.pill, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  chamberText: { fontSize: 11, color: colors.white, fontWeight: '600' },
}));
