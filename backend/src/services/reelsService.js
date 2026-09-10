import { db } from '../db/pool.js';
import { pluckSet } from '../db/queryHelpers.js';
import { getLikeCountMap, getUserLikedSet, toggleLike } from './likesService.js';
import { initialsOf } from '../utils/names.js';
import { publicUrlFor } from '../middleware/upload.js';

export async function listStories(userId) {
  const rows = await db('stories')
    .join('users', 'users.id', 'stories.user_id')
    .where('stories.expires_at', '>', new Date())
    .select('stories.*', 'users.full_name')
    .orderBy('stories.created_at', 'desc');

  const [viewedSet, me] = await Promise.all([
    pluckSet('story_views', { viewer_id: userId }, 'story_id'),
    db('users').where({ id: userId }).first(),
  ]);

  return [
    { id: 'my-story', name: 'Your Story', initials: initialsOf(me.full_name), colorKey: 'primary', viewed: false, mine: true },
    ...rows.map((r) => ({
      id: `story-${r.id}`,
      name: r.full_name,
      initials: initialsOf(r.full_name),
      mediaUrl: r.media_url ? publicUrlFor(r.media_url) : null,
      colorKey: 'blue',
      viewed: viewedSet.has(r.id),
      mine: false,
    })),
  ];
}

export async function createStory(userId, mediaPath) {
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [row] = await db('stories').insert({ user_id: userId, media_url: mediaPath, expires_at: expiresAt }).returning('*');
  return { id: `story-${row.id}`, mediaUrl: publicUrlFor(row.media_url), expiresAt: row.expires_at };
}

export async function listReels(userId) {
  const rows = await db('reels')
    .join('users', 'users.id', 'reels.author_id')
    .leftJoin('chambers', 'chambers.id', 'reels.chamber_id')
    .select('reels.*', 'users.full_name as author_name', 'users.username as author_username', 'chambers.name as chamber_name')
    .orderBy('reels.created_at', 'desc');

  if (rows.length === 0) return [];

  const reelIds = rows.map((r) => r.id);
  const [likeCountMap, myLikeSet] = await Promise.all([
    getLikeCountMap('reel', reelIds),
    getUserLikedSet(userId, 'reel', reelIds),
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
    likes: likeCountMap.get(r.id) ?? 0,
    comments: 0,
    shares: r.shares_count,
    bg: r.bg_color,
    emoji: r.emoji,
    likedByMe: myLikeSet.has(r.id),
  }));
}

export async function createReel(authorId, { caption, mediaPath, chamberId }) {
  const [row] = await db('reels').insert({
    author_id: authorId, caption, media_url: mediaPath, chamber_id: chamberId || null, music_label: 'Original Audio',
  }).returning('*');
  return { id: `reel-${row.id}`, caption: row.caption, mediaUrl: publicUrlFor(row.media_url) };
}

export async function toggleReelLike(reelId, userId) {
  return toggleLike(userId, 'reel', reelId);
}

export async function incrementReelShares(reelId) {
  const [row] = await db('reels').where({ id: reelId }).increment('shares_count', 1).returning('shares_count');
  return { shares: row?.shares_count ?? 0 };
}
