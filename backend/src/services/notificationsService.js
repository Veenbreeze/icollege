import { db } from '../db/pool.js';
import { initialsOf } from '../utils/names.js';

const MESSAGE_BY_TYPE = {
  like: {
    post: 'liked your post',
    reel: 'liked your reel',
  },
  comment: {
    post: 'commented on your post',
  },
  share: {
    reel: 'shared your reel',
  },
  new_post: {
    post: 'posted in a chamber you follow',
  },
  new_reel: {
    reel: 'posted a new reel',
  },
  new_story: {
    story: 'added a new story',
  },
};

function messageFor(type, targetType) {
  return MESSAGE_BY_TYPE[type]?.[targetType] ?? 'sent you an update';
}

async function resolveOwner(targetType, targetId) {
  if (targetType === 'post') return (await db('posts').where({ id: targetId }).first('author_id'))?.author_id ?? null;
  if (targetType === 'reel') return (await db('reels').where({ id: targetId }).first('author_id'))?.author_id ?? null;
  if (targetType === 'comment') return (await db('comments').where({ id: targetId }).first('author_id'))?.author_id ?? null;
  return null;
}

/** Notifies a single recipient about an actor's action on a target. No-ops if the actor is the recipient. */
export async function notify(recipientId, actorId, type, targetType, targetId) {
  if (!recipientId || recipientId === actorId) return;
  await db('notifications').insert({ recipient_id: recipientId, actor_id: actorId, type, target_type: targetType, target_id: targetId });
}

/** Like `notify`, but resolves the target's owner as the recipient (used for likes/comments/shares). */
export async function notifyOwner(targetType, targetId, actorId, type) {
  const ownerId = await resolveOwner(targetType, targetId);
  await notify(ownerId, actorId, type, targetType, targetId);
}

/** Broadcasts a notification to many recipients at once (used for new post/reel/story), excluding the actor. */
export async function notifyMany(recipientIds, actorId, type, targetType, targetId) {
  const rows = recipientIds
    .filter((id) => id !== actorId)
    .map((id) => ({ recipient_id: id, actor_id: actorId, type, target_type: targetType, target_id: targetId }));
  if (rows.length === 0) return;
  await db('notifications').insert(rows);
}

function toDto(row) {
  return {
    id: row.id,
    type: row.type,
    targetType: row.target_type,
    targetId: row.target_id,
    actor: row.actor_name,
    initials: row.actor_name ? initialsOf(row.actor_name) : '?',
    message: messageFor(row.type, row.target_type),
    read: row.read,
    time: row.created_at,
  };
}

export async function listNotifications(userId) {
  const rows = await db('notifications')
    .leftJoin('users', 'users.id', 'notifications.actor_id')
    .where('notifications.recipient_id', userId)
    .select('notifications.*', 'users.full_name as actor_name')
    .orderBy('notifications.created_at', 'desc')
    .limit(50);
  return rows.map(toDto);
}

export async function getUnreadCount(userId) {
  const [{ count }] = await db('notifications').where({ recipient_id: userId, read: false }).count('* as count');
  return Number(count);
}

export async function markRead(id, userId) {
  await db('notifications').where({ id, recipient_id: userId }).update({ read: true });
}

export async function markAllRead(userId) {
  await db('notifications').where({ recipient_id: userId, read: false }).update({ read: true });
}
