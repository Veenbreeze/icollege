import { db } from '../db/pool.js';

const EXPO_PUSH_URL = 'https://exp.host/--/api/v2/push/send';

/* ---- device tokens ------------------------------------------------ */

/** Upsert a device's push token for the given user (one row per token). */
export async function registerToken(userId, { token, platform }) {
  if (!token) return null;
  const existing = await db('device_tokens').where({ token }).first();
  if (existing) {
    const [row] = await db('device_tokens')
      .where({ token })
      .update({ user_id: userId, platform: platform || existing.platform })
      .returning('*');
    return row;
  }
  const [row] = await db('device_tokens')
    .insert({ user_id: userId, token, platform: platform || 'unknown' })
    .returning('*');
  return row;
}

/* ---- in-app feed -------------------------------------------------- */

function toPublic(row) {
  return {
    id: row.id,
    title: row.title,
    body: row.body,
    type: row.type,
    read: row.read,
    deepLink: row.deep_link,
    createdAt: row.created_at,
  };
}

export async function listNotifications(userId, { limit = 50 } = {}) {
  const rows = await db('academic_notifications')
    .where({ user_id: userId })
    .orderBy('created_at', 'desc')
    .limit(limit);
  return rows.map(toPublic);
}

export async function unreadCount(userId) {
  const row = await db('academic_notifications').where({ user_id: userId, read: false }).count({ c: '*' }).first();
  return Number(row?.c ?? 0);
}

export async function markRead(userId, id) {
  const [row] = await db('academic_notifications')
    .where({ id, user_id: userId })
    .update({ read: true })
    .returning('*');
  return row ? toPublic(row) : null;
}

export async function markAllRead(userId) {
  await db('academic_notifications').where({ user_id: userId, read: false }).update({ read: true });
  return true;
}

/* ---- rule engine -------------------------------------------------- */

/**
 * Active students to notify. Scoped to one university when `universityId` is
 * given (the normal case); pass null only for genuinely national events.
 */
export async function activeStudentIds(universityId) {
  const q = db('users').where({ role: 'student', status: 'active' });
  if (universityId) q.andWhere({ university_id: universityId });
  return q.pluck('id');
}

/**
 * Core entry point: persist an in-app notification for every recipient and
 * fire a best-effort Expo push. Persistence errors are swallowed and logged so
 * a notification never breaks the action that triggered it (notice publish,
 * lecture cancel, …). Safe to call with an empty audience.
 */
export async function notifyUsers(userIds, { title, body = null, type = 'general', deepLink = null }) {
  const ids = (userIds ?? []).filter((id) => id != null);
  if (!ids.length || !title) return;

  try {
    const rows = ids.map((uid) => ({ user_id: uid, title, body, type, deep_link: deepLink, read: false }));
    await db('academic_notifications').insert(rows);
  } catch (err) {
    console.error('[notifications] persist failed:', err.message);
    return;
  }

  // Fire-and-forget: a push failure must never surface to the caller.
  sendExpoPush(ids, { title, body, deepLink }).catch((err) =>
    console.error('[notifications] push failed:', err.message),
  );
}

/** Best-effort Expo push to every registered device of the given users. */
async function sendExpoPush(userIds, { title, body, deepLink }) {
  const tokens = await db('device_tokens').whereIn('user_id', userIds).pluck('token');
  const valid = tokens.filter((t) => typeof t === 'string' && t.startsWith('ExponentPushToken'));
  if (!valid.length) return; // nothing registered yet (normal in dev / on web)

  const messages = valid.map((to) => ({
    to,
    title,
    body: body ?? '',
    sound: 'default',
    data: deepLink ? { deepLink } : {},
  }));

  // Expo accepts up to 100 messages per request.
  for (let i = 0; i < messages.length; i += 100) {
    const chunk = messages.slice(i, i + 100);
    const res = await fetch(EXPO_PUSH_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(chunk),
    });
    if (!res.ok) throw new Error(`Expo push HTTP ${res.status}`);
  }
}
