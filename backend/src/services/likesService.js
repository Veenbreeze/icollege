import { db } from '../db/pool.js';
import { toggleRow } from '../db/queryHelpers.js';
import { notifyOwner } from './notificationsService.js';
import { visibleChamber } from './visibilityService.js';

/** Like counts for a batch of targets, e.g. `{ target_type: 'post' }`. */
export async function getLikeCountMap(targetType, targetIds) {
  if (targetIds.length === 0) return new Map();
  const rows = await db('likes')
    .where({ target_type: targetType })
    .whereIn('target_id', targetIds)
    .select('target_id')
    .count('* as count')
    .groupBy('target_id');
  return new Map(rows.map((r) => [r.target_id, Number(r.count)]));
}

/** Which of `targetIds` the given user has liked. */
export async function getUserLikedSet(userId, targetType, targetIds) {
  if (targetIds.length === 0) return new Set();
  const ids = await db('likes')
    .where({ target_type: targetType, user_id: userId })
    .whereIn('target_id', targetIds)
    .pluck('target_id');
  return new Set(ids);
}

export async function toggleLike(user, targetType, targetId) {
  let target;
  if (targetType === 'post') {
    const query = db('posts').join('chambers', 'chambers.id', 'posts.chamber_id').where('posts.id', targetId);
    target = await visibleChamber(query, user).first('posts.id');
  } else if (targetType === 'reel') {
    target = await db('reels').join('users', 'users.id', 'reels.author_id').where('reels.id', targetId)
      .andWhere(function () { this.where('reels.visibility', 'national').orWhere('users.university_id', user.universityId); }).first('reels.id');
  } else if (targetType === 'comment') {
    const query = db('comments').join('posts', 'posts.id', 'comments.post_id').join('chambers', 'chambers.id', 'posts.chamber_id').where('comments.id', targetId);
    target = await visibleChamber(query, user).first('comments.id');
  }
  if (!target) return { liked: false };
  const liked = await toggleRow('likes', { user_id: user.id, target_type: targetType, target_id: targetId });
  if (liked) await notifyOwner(targetType, targetId, user.id, 'like');
  return { liked };
}
