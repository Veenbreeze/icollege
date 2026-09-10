import { useState } from 'react';
import { View, Text, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { colors, radii, spacing, themedStyles, useResponsive } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { useApi } from '@/hooks/useApi';
import { fetchStories, fetchReels, toggleReelLike, shareReel } from '@/lib/api/reels';
import { resolveAccent } from '@/lib/colorKey';

const HEADER_HEIGHT = 44; // matches styles.storiesBar.top below
const STORIES_BAR_HEIGHT = 92; // matches styles.storiesBar.maxHeight below

export default function ReelsScreen() {
  const router = useRouter();
  const { height, scale } = useResponsive();
  const insets = useSafeAreaInsets();
  // reel height fills the screen minus the header + stories bar + top safe area
  const reelHeight = height - insets.top - HEADER_HEIGHT - STORIES_BAR_HEIGHT;
  const storyWidth = scale(64);
  const { data: stories } = useApi(fetchStories);
  const { data: reels, isLoading, refetch } = useApi(fetchReels);
  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      {/* Header + stories */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <Ionicons name="arrow-back" size={24} color={colors.white} />
        </Pressable>
        <Text style={styles.headerTitle}>Reels & Stories</Text>
        <Pressable onPress={() => router.push('/create-reel')} hitSlop={8}>
          <Ionicons name="add-circle-outline" size={26} color={colors.white} />
        </Pressable>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storiesBar}
        contentContainerStyle={styles.storiesContent}
      >
        {(stories ?? []).map((s) => {
          const { color } = resolveAccent(s.colorKey);
          return (
            <Pressable key={s.id} style={[styles.story, { width: storyWidth }]} onPress={s.mine ? () => router.push('/create-story') : undefined}>
              <View
                style={[
                  styles.storyRing,
                  !s.viewed && !s.mine && styles.storyRingActive,
                  s.mine && styles.storyRingMine,
                ]}
              >
                <Avatar initials={s.initials} size={54} color={color} />
                {s.mine && (
                  <View style={styles.storyAdd}>
                    <Ionicons name="add" size={13} color={colors.white} />
                  </View>
                )}
              </View>
              <Text style={styles.storyName} numberOfLines={1}>
                {s.name}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Reels vertical feed */}
      {isLoading ? (
        <ActivityIndicator
          color={colors.white}
          style={{
            marginTop: reelHeight / 2,
          }}
        />
      ) : (
        <ScrollView
          pagingEnabled
          showsVerticalScrollIndicator={false}
          snapToInterval={reelHeight}
          decelerationRate="fast"
        >
          {(reels ?? []).map((r) => (
            <ReelCard key={r.id} reel={r} h={reelHeight} onChanged={refetch} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
function ReelCard({ reel, h, onChanged }) {
  const [busy, setBusy] = useState(false);
  const onLike = async () => {
    if (busy) return;
    setBusy(true);
    try {
      await toggleReelLike(reel.id);
      onChanged();
    } finally {
      setBusy(false);
    }
  };
  const onShare = async () => {
    await shareReel(reel.id);
    onChanged();
  };
  return (
    <View
      style={[
        styles.reel,
        {
          height: h,
          backgroundColor: reel.bg,
        },
      ]}
    >
      {/* faux video content */}
      <View style={styles.reelCenter}>
        <Text
          style={{
            fontSize: 90,
          }}
        >
          {reel.emoji}
        </Text>
        <View style={styles.playHint}>
          <Ionicons name="play" size={20} color="rgba(255,255,255,0.9)" />
        </View>
      </View>

      {/* Right action rail */}
      <View style={styles.rail}>
        <RailAction
          icon={reel.likedByMe ? 'heart' : 'heart-outline'}
          label={String(reel.likes)}
          active={reel.likedByMe}
          onPress={onLike}
        />
        <RailAction icon="chatbubble-outline" label={String(reel.comments)} />
        <RailAction icon="arrow-redo-outline" label={String(reel.shares)} onPress={onShare} />
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
          <Text style={styles.author}>@{reel.authorUsername ?? reel.author.replace(/\s+/g, '').toLowerCase()}</Text>
        </View>
        <Text style={styles.caption}>{reel.caption}</Text>
        <View style={styles.musicRow}>
          <Ionicons name="musical-notes" size={13} color={colors.white} />
          <Text style={styles.music}>{reel.music}</Text>
          {reel.chamber && (
            <View style={styles.chamberTag}>
              <Text style={styles.chamberText}>#{reel.chamber}</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}
function RailAction({ icon, label, active, onPress }) {
  return (
    <Pressable style={styles.railAction} onPress={onPress}>
      <Ionicons name={icon} size={28} color={active ? colors.red : colors.white} />
      <Text style={styles.railLabel}>{label}</Text>
    </Pressable>
  );
}
const styles = themedStyles((colors) => ({
  safe: {
    flex: 1,
    backgroundColor: '#0E0E1A',
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: colors.white,
  },
  storiesBar: {
    position: 'absolute',
    top: 44,
    left: 0,
    right: 0,
    zIndex: 10,
    maxHeight: 92,
  },
  storiesContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
    paddingVertical: spacing.sm,
  },
  story: {
    alignItems: 'center',
    width: 64,
  },
  storyRing: {
    padding: 2,
    borderRadius: 32,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  storyRingActive: {
    borderColor: colors.primaryLight,
  },
  storyRingMine: {
    borderColor: 'rgba(255,255,255,0.4)',
  },
  storyAdd: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#0E0E1A',
  },
  storyName: {
    fontSize: 11,
    color: colors.white,
    marginTop: 4,
  },
  reel: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  reelCenter: {
    alignItems: 'center',
    gap: spacing.lg,
  },
  playHint: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rail: {
    position: 'absolute',
    right: spacing.md,
    bottom: 130,
    alignItems: 'center',
    gap: spacing.xl,
  },
  railAction: {
    alignItems: 'center',
    gap: 4,
  },
  railLabel: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },
  discWrap: {
    marginTop: spacing.sm,
  },
  disc: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
  },
  bottom: {
    position: 'absolute',
    left: spacing.lg,
    right: 80,
    bottom: spacing.xxl,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  author: {
    fontSize: 15,
    fontWeight: '800',
    color: colors.white,
  },
  caption: {
    fontSize: 14,
    color: colors.white,
    marginTop: spacing.md,
    lineHeight: 20,
  },
  musicRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
  },
  music: {
    fontSize: 12.5,
    color: colors.white,
  },
  chamberTag: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  chamberText: {
    fontSize: 11,
    color: colors.white,
    fontWeight: '600',
  },
}));
