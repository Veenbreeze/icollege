import { db } from '../db/pool.js';
import { initialsOf } from '../utils/names.js';

const COLOR_PALETTE = ['blue', 'green', 'orange', 'primary', 'red'];
const colorKeyFor = (id) => COLOR_PALETTE[id % COLOR_PALETTE.length];

async function threadDisplayName(thread, user) {
  if (thread.is_group) return thread.name;
  const other = await db('chat_thread_members').join('users', 'users.id', 'chat_thread_members.user_id')
    .where('chat_thread_members.thread_id', thread.id).andWhereNot('chat_thread_members.user_id', user.id)
    .andWhere('users.university_id', user.universityId).select('users.full_name').first();
  return other?.full_name ?? 'Unknown';
}

export async function listThreads(user) {
  const memberships = await db('chat_thread_members').join('chat_threads', 'chat_threads.id', 'chat_thread_members.thread_id')
    .where('chat_thread_members.user_id', user.id).andWhere('chat_threads.university_id', user.universityId)
    .select('chat_threads.*', 'chat_thread_members.last_read_at');
  return Promise.all(memberships.map(async (thread) => {
    const name = await threadDisplayName(thread, user);
    const lastMessage = await db('chat_messages').where({ thread_id: thread.id }).orderBy('created_at', 'desc').first();
    const unreadQuery = db('chat_messages').where({ thread_id: thread.id }).andWhereNot('sender_id', user.id);
    if (thread.last_read_at) unreadQuery.andWhere('created_at', '>', thread.last_read_at);
    const [{ count: unread }] = await unreadQuery.count('* as count');
    return {
      id: `thread-${thread.id}`, name, initials: initialsOf(name), colorKey: colorKeyFor(thread.id),
      isGroup: thread.is_group, last: lastMessage?.body ?? 'No messages yet',
      time: lastMessage?.created_at ?? thread.created_at, unread: Number(unread),
    };
  }));
}

async function findThread(threadId, user) {
  const membership = await db('chat_thread_members').join('chat_threads', 'chat_threads.id', 'chat_thread_members.thread_id')
    .where({ 'chat_thread_members.thread_id': threadId, 'chat_thread_members.user_id': user.id, 'chat_threads.university_id': user.universityId })
    .first('chat_threads.id');
  if (!membership) return null;
  const foreignMember = await db('chat_thread_members').join('users', 'users.id', 'chat_thread_members.user_id')
    .where('chat_thread_members.thread_id', threadId).andWhereNot('users.university_id', user.universityId).first('users.id');
  if (foreignMember) return null;
  return db('chat_threads').where({ id: threadId, university_id: user.universityId }).first();
}

export async function getThread(threadId, user) {
  const thread = await findThread(threadId, user);
  if (!thread) return null;
  const [{ count: memberCount }] = await db('chat_thread_members').where({ thread_id: threadId }).count('* as count');
  const name = await threadDisplayName(thread, user);
  return { id: `thread-${thread.id}`, name, initials: initialsOf(name), colorKey: colorKeyFor(thread.id), isGroup: thread.is_group, memberCount: Number(memberCount) };
}

export async function listMessages(threadId, user, afterId) {
  const thread = await findThread(threadId, user);
  if (!thread) return null;
  let query = db('chat_messages').join('users', 'users.id', 'chat_messages.sender_id')
    .where('chat_messages.thread_id', threadId).andWhere('users.university_id', user.universityId)
    .select('chat_messages.*', 'users.full_name as sender_name').orderBy('chat_messages.created_at', 'asc').limit(200);
  if (afterId) query = query.andWhere('chat_messages.id', '>', afterId);
  const rows = await query;
  await db('chat_thread_members').where({ thread_id: threadId, user_id: user.id }).update({ last_read_at: db.fn.now() });
  return rows.map((r) => ({
    id: `msg-${r.id}`, text: r.body, mine: r.sender_id === user.id, time: r.created_at,
    sender: thread.is_group ? r.sender_name : undefined,
    senderColorKey: thread.is_group ? colorKeyFor(r.sender_id) : undefined,
  }));
}

export async function sendMessage(threadId, user, body) {
  const thread = await findThread(threadId, user);
  if (!thread) return null;
  const [row] = await db('chat_messages').insert({ thread_id: threadId, sender_id: user.id, body }).returning('*');
  await db('chat_thread_members').where({ thread_id: threadId, user_id: user.id }).update({ last_read_at: db.fn.now() });
  return { id: `msg-${row.id}`, text: row.body, mine: true, time: row.created_at };
}
