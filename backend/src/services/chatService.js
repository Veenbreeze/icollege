import { db } from '../db/pool.js';
import { initialsOf } from '../utils/names.js';

const COLOR_PALETTE = ['blue', 'green', 'orange', 'primary', 'red'];
const colorKeyFor = (id) => COLOR_PALETTE[id % COLOR_PALETTE.length];

async function threadDisplayName(thread, userId) {
  if (thread.is_group) return thread.name;
  const other = await db('chat_thread_members')
    .join('users', 'users.id', 'chat_thread_members.user_id')
    .where('chat_thread_members.thread_id', thread.id)
    .andWhereNot('chat_thread_members.user_id', userId)
    .select('users.full_name')
    .first();
  return other?.full_name ?? 'Unknown';
}

export async function listThreads(userId) {
  const memberships = await db('chat_thread_members')
    .join('chat_threads', 'chat_threads.id', 'chat_thread_members.thread_id')
    .where('chat_thread_members.user_id', userId)
    .select('chat_threads.*', 'chat_thread_members.last_read_at');

  return Promise.all(
    memberships.map(async (thread) => {
      const name = await threadDisplayName(thread, userId);
      const lastMessage = await db('chat_messages').where({ thread_id: thread.id }).orderBy('created_at', 'desc').first();

      const unreadQuery = db('chat_messages').where({ thread_id: thread.id }).andWhereNot('sender_id', userId);
      if (thread.last_read_at) unreadQuery.andWhere('created_at', '>', thread.last_read_at);
      const [{ count: unread }] = await unreadQuery.count('* as count');

      return {
        id: `thread-${thread.id}`,
        name,
        initials: initialsOf(name),
        colorKey: colorKeyFor(thread.id),
        isGroup: thread.is_group,
        last: lastMessage?.body ?? 'No messages yet',
        time: lastMessage?.created_at ?? thread.created_at,
        unread: Number(unread),
      };
    }),
  );
}

async function findThread(threadId, userId) {
  const membership = await db('chat_thread_members').where({ thread_id: threadId, user_id: userId }).first();
  if (!membership) return null;
  return db('chat_threads').where({ id: threadId }).first();
}

export async function getThread(threadId, userId) {
  const thread = await findThread(threadId, userId);
  if (!thread) return null;

  const [{ count: memberCount }] = await db('chat_thread_members').where({ thread_id: threadId }).count('* as count');
  const name = await threadDisplayName(thread, userId);

  return {
    id: `thread-${thread.id}`,
    name,
    initials: initialsOf(name),
    colorKey: colorKeyFor(thread.id),
    isGroup: thread.is_group,
    memberCount: Number(memberCount),
  };
}

export async function listMessages(threadId, userId, afterId) {
  const thread = await findThread(threadId, userId);
  if (!thread) return null;

  let query = db('chat_messages')
    .join('users', 'users.id', 'chat_messages.sender_id')
    .where('chat_messages.thread_id', threadId)
    .select('chat_messages.*', 'users.full_name as sender_name')
    .orderBy('chat_messages.created_at', 'asc');

  if (afterId) query = query.andWhere('chat_messages.id', '>', afterId);

  const rows = await query;

  await db('chat_thread_members').where({ thread_id: threadId, user_id: userId }).update({ last_read_at: db.fn.now() });

  return rows.map((r) => ({
    id: `msg-${r.id}`,
    text: r.body,
    mine: r.sender_id === userId,
    time: r.created_at,
    sender: thread.is_group ? r.sender_name : undefined,
    senderColorKey: thread.is_group ? colorKeyFor(r.sender_id) : undefined,
  }));
}

export async function sendMessage(threadId, userId, body) {
  const thread = await findThread(threadId, userId);
  if (!thread) return null;

  const [row] = await db('chat_messages').insert({ thread_id: threadId, sender_id: userId, body }).returning('*');
  await db('chat_thread_members').where({ thread_id: threadId, user_id: userId }).update({ last_read_at: db.fn.now() });

  return { id: `msg-${row.id}`, text: row.body, mine: true, time: row.created_at };
}
