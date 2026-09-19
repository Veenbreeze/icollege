import { View, Text, Pressable, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, themedStyles } from '@/theme';
import { resolveMediaUrl } from '@/lib/api/client';

/** Instagram-style 3-column thumbnail grid — used for a user's own posts/reels on their profile. */
export function ThumbnailGrid({ items, onPressItem, emptyLabel = 'Nothing here yet' }) {
  if (items.length === 0) {
    return (
      <View style={styles.empty}>
        <Ionicons name="images-outline" size={28} color={colors.textMuted} />
        <Text style={styles.emptyText}>{emptyLabel}</Text>
      </View>
    );
  }
  return (
    <View style={styles.grid}>
      {items.map((item) => (
        <Pressable key={item.id} style={styles.tile} onPress={() => onPressItem(item)}>
          {item.mediaUrl ? (
            <Image source={{ uri: resolveMediaUrl(item.mediaUrl) }} style={styles.thumb} resizeMode="cover" />
          ) : (
            <View style={[styles.thumb, styles.textTile]}>
              <Text style={styles.textTileLabel} numberOfLines={4}>
                {item.title ?? item.caption ?? ''}
              </Text>
            </View>
          )}
          {item.mediaType === 'video' && (
            <View style={styles.videoBadge}>
              <Ionicons name="play" size={12} color={colors.white} />
            </View>
          )}
        </Pressable>
      ))}
    </View>
  );
}

const styles = themedStyles((colors) => ({
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tile: {
    width: '33.333%',
    aspectRatio: 1,
    padding: 1,
  },
  thumb: {
    flex: 1,
    backgroundColor: colors.surfaceMuted,
  },
  textTile: {
    padding: spacing.sm,
    justifyContent: 'center',
  },
  textTileLabel: {
    fontSize: 11.5,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  videoBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.45)',
    borderRadius: 10,
    padding: 3,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxl,
    gap: spacing.sm,
  },
  emptyText: {
    fontSize: 13,
    color: colors.textMuted,
  },
}));
