import { db } from '../db/pool.js';
import { pluckSet } from '../db/queryHelpers.js';
import { getLikeCountMap, getUserLikedSet, toggleLike } from './likesService.js';
import { notifyMany, notifyOwner } from './notificationsService.js';
import { initialsOf } from '../utils/names.js';
import { signedMediaUrl } from '../middleware/upload.js';

const VIDEO_EXTENSIONS = /\.(mp4|mov|m4v|webm)$/i;

/** Image vs video, from the stored file extension — `null` for legacy rows with no media. */
function detectMediaType(mediaUrl) {
  if (!mediaUrl) return null;
  return VIDEO_EXTENSIONS.test(mediaUrl) ? 'video' : 'image';
}

export async function listStories(user) {
  const rows = await db('stories')
    .join('users', 'users.id', 'stories.user_id')
    .where('stories.expires_at', '>', new Date())
    .andWhere(function () { this.where('stories.visibility', 'national').orWhere('users.university_id', user.universityId); })
    .select('stories.*', 'users.full_name')
    .orderBy('stories.created_at', 'asc')
    .limit(300);

  const viewedSet = await pluckSet('story_views', { viewer_id: user.id }, 'story_id');

  const byUser = new Map();
  for (const r of rows) {
    if (!byUser.has(r.user_id)) {
      byUser.set(r.user_id, {
        id: `user-${r.user_id}`,
        userId: r.user_id,
        name: r.full_name,
        initials: initialsOf(r.full_name),
        colorKey: r.user_id === user.id ? 'primary' : 'blue',
        mine: r.user_id === user.id,
        stories: [],
      });
    }
    byUser.get(r.user_id).stories.push({
      id: r.id,
      mediaUrl: r.media_url ? signedMediaUrl('story', r.id, user.id) : null,
      mediaType: detectMediaType(r.media_url),
      createdAt: r.created_at,
      viewed: viewedSet.has(r.id),
    });
  }

  const groups = [...byUser.values()].map((g) => ({ ...g, viewed: g.stories.every((s) => s.viewed) }));

  const myGroup = groups.find((g) => g.mine);
  const others = groups.filter((g) => !g.mine);

  const mine = myGroup ?? {
    id: `user-${user.id}`,
    userId: user.id,
    name: 'Your Story',
    initials: initialsOf((await db('users').where({ id: user.id, university_id: user.universityId }).first('full_name'))?.full_name),
    colorKey: 'primary',
    mine: true,
    viewed: false,
    stories: [],
  };

  return [mine, ...others];
}

export async function createStory(user, mediaPath, visibility = 'university') {
  if (!['national', 'university'].includes(visibility)) throw new Error('Unsupported story visibility');
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const [row] = await db('stories').insert({ user_id: user.id, media_url: mediaPath, expires_at: expiresAt, visibility }).returning('*');

  const otherUserIds = await db('users').whereNot({ id: user.id }).modify((q) => {
    if (visibility !== 'national') q.where({ university_id: user.universityId });
  }).pluck('id');
  await notifyMany(otherUserIds, user.id, 'new_story', 'story', row.id);

  return { id: row.id, mediaUrl: signedMediaUrl('story', row.id, user.id), expiresAt: row.expires_at };
}

export async function markStoryViewed(storyId, user) {
  const story = await db('stories').join('users', 'users.id', 'stories.user_id').where('stories.id', storyId)
    .andWhere('stories.expires_at', '>', new Date())
    .andWhere(function () { this.where('stories.visibility', 'national').orWhere('users.university_id', user.universityId); }).first('stories.id');
  if (!story) return null;
  await db('story_views').insert({ story_id: storyId, viewer_id: user.id }).onConflict(['story_id', 'viewer_id']).ignore();
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
    mediaUrl: r.media_url ? signedMediaUrl('reel', r.id, viewerId) : null,
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

export async function listReels(user) {
  const rows = await reelListQuery().where(function () {
    this.where('reels.visibility', 'national').orWhere('users.university_id', user.universityId);
  }).orderBy('reels.created_at', 'desc').limit(40);
  return attachReelMeta(rows, user.id);
}

export async function listReelsByAuthor(user) {
  const rows = await reelListQuery().where('reels.author_id', user.id).orderBy('reels.created_at', 'desc').limit(40);
  return attachReelMeta(rows, user.id);
}

export async function createReel(user, { caption, mediaPath, chamberId, visibility = 'university' }) {
  const authorId = user.id;
  if (!['national', 'university'].includes(visibility)) throw new Error('Unsupported reel visibility');
  if (chamberId) {
    const chamber = await db('chambers').where({ id: chamberId }).andWhere(function () {
      this.where('visibility', 'national').orWhere({ visibility: 'university', university_id: user.universityId });
    }).first('id');
    const member = chamber && await db('chamber_members').where({ chamber_id: chamberId, user_id: authorId }).first('user_id');
    if (!member) return null;
  }
  const [row] = await db('reels').insert({
    author_id: authorId, caption, media_url: mediaPath, chamber_id: chamberId || null, music_label: 'Original Audio', visibility,
  }).returning('*');

  const recipientIds = chamberId
    ? await db('chamber_members').where({ chamber_id: chamberId }).pluck('user_id')
    : await db('users').whereNot({ id: authorId }).modify((q) => {
      if (visibility !== 'national') q.where({ university_id: user.universityId });
    }).pluck('id');
  await notifyMany(recipientIds, authorId, 'new_reel', 'reel', row.id);

  return { id: `reel-${row.id}`, caption: row.caption, mediaUrl: signedMediaUrl('reel', row.id, authorId) };
}

export async function toggleReelLike(reelId, user) {
  return toggleLike(user, 'reel', reelId);
}

export async function incrementReelShares(reelId, user) {
  const [row] = await db('reels').join('users', 'users.id', 'reels.author_id').where('reels.id', reelId)
    .andWhere(function () { this.where('reels.visibility', 'national').orWhere('users.university_id', user.universityId); })
    .update({ shares_count: db.raw('shares_count + 1') }).returning('shares_count');
  if (row) await notifyOwner('reel', reelId, user.id, 'share');
  return { shares: row?.shares_count ?? 0 };
}
