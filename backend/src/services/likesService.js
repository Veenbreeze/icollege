import { db } from '../db/pool.js';
import { toggleRow } from '../db/queryHelpers.js';

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

export async function toggleLike(userId, targetType, targetId) {
  const liked = await toggleRow('likes', { user_id: userId, target_type: targetType, target_id: targetId });
  return { liked };
}
