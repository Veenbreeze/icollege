import { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  cancelAnimation,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { colors, spacing, themedStyles } from '@/theme';
import { Avatar } from '@/components/ui/Avatar';
import { VideoPlayer } from '@/components/media/VideoPlayer';
import { useApi } from '@/hooks/useApi';
import { fetchStories, viewStory } from '@/lib/api/reels';
import { resolveAccent } from '@/lib/colorKey';
import { timeAgo } from '@/lib/timeAgo';
import { resolveMediaUrl } from '@/lib/api/client';

const IMAGE_DURATION_MS = 5000;
const TAP_THRESHOLD_MS = 250;
const DISMISS_THRESHOLD = 120;

export default function StoryViewerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { userId } = useLocalSearchParams();
  const { data: stories } = useApi(fetchStories);

  const groups = useMemo(() => (stories ?? []).filter((g) => g.stories?.length > 0), [stories]);
  const startIndex = useMemo(() => Math.max(0, groups.findIndex((g) => String(g.userId) === String(userId))), [groups, userId]);

  const [groupIndex, setGroupIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const initialized = useRef(false);
  const pressStartAt = useRef(0);

  useEffect(() => {
    if (!initialized.current && groups.length > 0) {
      setGroupIndex(startIndex);
      initialized.current = true;
    }
  }, [groups.length, startIndex]);

  // No active stories to show at all (e.g. deep link with nothing left) — bail out.
  useEffect(() => {
    if (initialized.current && groups.length === 0) router.back();
  }, [groups.length, router]);

  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];

  const progress = useSharedValue(0);
  const translateY = useSharedValue(0);
  const overlayOpacity = useSharedValue(1);

  const close = () => router.back();

  const goNext = () => {
    if (!group) return;
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex((i) => i + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex((i) => i + 1);
      setStoryIndex(0);
    } else {
      close();
    }
  };

  const goPrev = () => {
    if (storyIndex > 0) {
      setStoryIndex((i) => i - 1);
    } else if (groupIndex > 0) {
      const prevGroup = groups[groupIndex - 1];
      setGroupIndex((i) => i - 1);
      setStoryIndex(prevGroup.stories.length - 1);
    }
  };

  // Reset + (re)start the per-story progress clock whenever the active story or pause state
  // changes. Only reset progress to 0 on a genuine story change — a pause/resume toggle re-runs
  // this effect too, and must resume from wherever the animation was, not restart from zero.
  const prevStoryIdRef = useRef(null);
  useEffect(() => {
    if (!story) return;
    cancelAnimation(progress);
    if (prevStoryIdRef.current !== story.id) {
      prevStoryIdRef.current = story.id;
      progress.value = 0;
    }
    if (story.mediaType === 'video') return; // driven externally by VideoPlayer's onProgress
    if (paused) return;
    const remainingMs = (1 - progress.value) * IMAGE_DURATION_MS;
    progress.value = withTiming(1, { duration: remainingMs, easing: Easing.linear }, (finished) => {
      if (finished) runOnJS(goNext)();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [story?.id, paused]);

  useEffect(() => {
    if (story) viewStory(story.id).catch(() => {});
  }, [story?.id]);

  const onPressIn = () => {
    pressStartAt.current = Date.now();
    setPaused(true);
  };
  const onPressOut = (side) => {
    setPaused(false);
    if (Date.now() - pressStartAt.current < TAP_THRESHOLD_MS) {
      if (side === 'left') goPrev();
      else goNext();
    }
  };

  const panGesture = Gesture.Pan()
    .activeOffsetY(15)
    .failOffsetX([-20, 20])
    .onUpdate((e) => {
      if (e.translationY > 0) translateY.value = e.translationY;
    })
    .onEnd((e) => {
      if (e.translationY > DISMISS_THRESHOLD) {
        overlayOpacity.value = withTiming(0, { duration: 150 });
        translateY.value = withTiming(400, { duration: 150 }, () => runOnJS(close)());
      } else {
        translateY.value = withSpring(0);
      }
    });

  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: overlayOpacity.value,
  }));

  if (!group || !story) return <View style={styles.safe} />;

  const { color } = resolveAccent(group.colorKey);

  return (
    <GestureDetector gesture={panGesture}>
      <Animated.View style={[styles.safe, containerStyle]}>
        <SafeAreaView style={styles.flex} edges={['top']}>
          <View style={[styles.progressRow, { paddingTop: insets.top ? 0 : spacing.sm }]}>
            {group.stories.map((s, i) => (
              <ProgressSegment key={s.id} done={i < storyIndex} active={i === storyIndex} progress={progress} />
            ))}
          </View>

          <View style={styles.header}>
            <Avatar initials={group.initials} size={36} color={color} />
            <View style={styles.headerText}>
              <Text style={styles.name}>{group.name}</Text>
              <Text style={styles.time}>{timeAgo(story.createdAt)}</Text>
            </View>
            <Pressable onPress={close} hitSlop={10}>
              <Ionicons name="close" size={26} color={colors.white} />
            </Pressable>
          </View>

          <View style={styles.media}>
            {story.mediaType === 'video' ? (
              <VideoPlayer
                uri={resolveMediaUrl(story.mediaUrl)}
                isActive={!paused}
                style={StyleSheet.absoluteFillObject}
                onEnd={goNext}
                onProgress={(p) => {
                  progress.value = p;
                }}
              />
            ) : (
              story.mediaUrl && (
                <Animated.Image source={{ uri: resolveMediaUrl(story.mediaUrl) }} style={StyleSheet.absoluteFillObject} resizeMode="cover" />
              )
            )}
          </View>

          <View style={styles.tapZones} pointerEvents="box-none">
            <Pressable style={styles.tapZone} onPressIn={onPressIn} onPressOut={() => onPressOut('left')} />
            <Pressable style={styles.tapZone} onPressIn={onPressIn} onPressOut={() => onPressOut('right')} />
          </View>
        </SafeAreaView>
      </Animated.View>
    </GestureDetector>
  );
}

function ProgressSegment({ done, active, progress }) {
  const style = useAnimatedStyle(() => ({
    width: `${(done ? 1 : active ? progress.value : 0) * 100}%`,
  }));
  return (
    <View style={styles.segmentTrack}>
      <Animated.View style={[styles.segmentFill, style]} />
    </View>
  );
}

const styles = themedStyles((colors) => ({
  safe: {
    flex: 1,
    backgroundColor: '#000',
  },
  flex: {
    flex: 1,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  segmentTrack: {
    flex: 1,
    height: 2.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.3)',
    overflow: 'hidden',
  },
  segmentFill: {
    height: '100%',
    backgroundColor: colors.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    zIndex: 5,
  },
  headerText: {
    flex: 1,
  },
  name: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.white,
  },
  time: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.7)',
  },
  media: {
    flex: 1,
    backgroundColor: '#111',
  },
  tapZones: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
  },
  tapZone: {
    flex: 1,
  },
}));
