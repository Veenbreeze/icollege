import { db } from '../db/pool.js';
import { pluckSet } from '../db/queryHelpers.js';
import { getLikeCountMap, getUserLikedSet, toggleLike } from './likesService.js';
import { notifyMany, notifyOwner } from './notificationsService.js';
import { initialsOf } from '../utils/names.js';
import { publicUrlFor } from '../middleware/upload.js';

const VIDEO_EXTENSIONS = /\.(mp4|mov|m4v|webm)$/i;

/** Image vs video, from the stored file extension — `null` for legacy rows with no media. */
function detectMediaType(mediaUrl) {
  if (!mediaUrl) return null;
  return VIDEO_EXTENSIONS.test(mediaUrl) ? 'video' : 'image';
}

export async function listStories(userId) {
  const rows = await db('stories')
    .join('users', 'users.id', 'stories.user_id')
    .where('stories.expires_at', '>', new Date())
    .select('stories.*', 'users.full_name')
    .orderBy('stories.created_at', 'asc');

  const viewedSet = await pluckSet('story_views', { viewer_id: userId }, 'story_id');

  const byUser = new Map();
  for (const r of rows) {
    if (!byUser.has(r.user_id)) {
      byUser.set(r.user_id, {
        id: `user-${r.user_id}`,
        userId: r.user_id,
        name: r.full_name,
        initials: initialsOf(r.full_name),
        colorKey: r.user_id === userId ? 'primary' : 'blue',
        mine: r.user_id === userId,
        stories: [],
      });
    }
    byUser.get(r.user_id).stories.push({
      id: r.id,
      mediaUrl: r.media_url ? publicUrlFor(r.media_url) : null,
      mediaType: detectMediaType(r.media_url),
      createdAt: r.created_at,
      viewed: viewedSet.has(r.id),
    });
  }

  const groups = [...byUser.values()].map((g) => ({ ...g, viewed: g.stories.every((s) => s.viewed) }));

  const myGroup = groups.find((g) => g.mine);
  const others = groups.filter((g) => !g.mine);

  const mine = myGroup ?? {
    id: `user-${userId}`,
    userId,
    name: 'Your Story',
    initials: initialsOf((await db('users').where({ id: userId }).first('full_name'))?.full_name),
    colorKey: 'primary',
    mine: true,
    viewed: false,
    stories: [],
  };

  return [mine, ...others];
}

export async function createStory(userId, mediaPath) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [row] = await db('stories').insert({ user_id: userId, media_url: mediaPath, expires_at: expiresAt }).returning('*');

  const otherUserIds = await db('users').whereNot({ id: userId }).pluck('id');
  await notifyMany(otherUserIds, userId, 'new_story', 'story', row.id);

  return { id: row.id, mediaUrl: publicUrlFor(row.media_url), expiresAt: row.expires_at };
}

export async function markStoryViewed(storyId, viewerId) {
  await db('story_views').insert({ story_id: storyId, viewer_id: viewerId }).onConflict(['story_id', 'viewer_id']).ignore();
  return { ok: true };
}

async function attachReelMeta(rows, viewerId) {
  if (rows.length === 0) return [];

  const reelIds = rows.map((r) => r.id);
  const [likeCountMap, myLikeSet] = await Promise.all([
    getLikeCountMap('reel', reelIds),
    getUserLikedSet(viewerId, 'reel', reelIds),
  ]);

  return rows.map((r) => ({
    id: `reel-${r.id}`,
    author: r.author_name,
    authorUsername: r.author_username,
    initials: initialsOf(r.author_name),
    caption: r.caption,
    chamber: r.chamber_name,
    music: r.music_label,
    mediaUrl: r.media_url ? publicUrlFor(r.media_url) : null,
    mediaType: detectMediaType(r.media_url),
    likes: likeCountMap.get(r.id) ?? 0,
    comments: 0,
    shares: r.shares_count,
    bg: r.bg_color,
    emoji: r.emoji,
    likedByMe: myLikeSet.has(r.id),
  }));
}

function reelListQuery() {
  return db('reels')
    .join('users', 'users.id', 'reels.author_id')
    .leftJoin('chambers', 'chambers.id', 'reels.chamber_id')
    .select('reels.*', 'users.full_name as author_name', 'users.username as author_username', 'chambers.name as chamber_name');
}

export async function listReels(userId) {
  const rows = await reelListQuery().orderBy('reels.created_at', 'desc');
  return attachReelMeta(rows, userId);
}

export async function listReelsByAuthor(authorId, viewerId) {
  const rows = await reelListQuery().where('reels.author_id', authorId).orderBy('reels.created_at', 'desc');
  return attachReelMeta(rows, viewerId);
}

export async function createReel(authorId, { caption, mediaPath, chamberId }) {
  const [row] = await db('reels').insert({
    author_id: authorId, caption, media_url: mediaPath, chamber_id: chamberId || null, music_label: 'Original Audio',
  }).returning('*');

  const recipientIds = chamberId
    ? await db('chamber_members').where({ chamber_id: chamberId }).pluck('user_id')
    : await db('users').whereNot({ id: authorId }).pluck('id');
  await notifyMany(recipientIds, authorId, 'new_reel', 'reel', row.id);

  return { id: `reel-${row.id}`, caption: row.caption, mediaUrl: publicUrlFor(row.media_url) };
}

export async function toggleReelLike(reelId, userId) {
  return toggleLike(userId, 'reel', reelId);
}

export async function incrementReelShares(reelId, sharerId) {
  const [row] = await db('reels').where({ id: reelId }).increment('shares_count', 1).returning('shares_count');
  if (sharerId) await notifyOwner('reel', reelId, sharerId, 'share');
  return { shares: row?.shares_count ?? 0 };
}
