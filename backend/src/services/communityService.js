import { db } from '../db/pool.js';
import { countByColumn, pluckSet, toggleRow } from '../db/queryHelpers.js';
import { getLikeCountMap, getUserLikedSet } from './likesService.js';
import { initialsOf } from '../utils/names.js';
import { publicUrlFor } from '../middleware/upload.js';

export async function listChambers(userId) {
  const chambers = await db('chambers').select('*').orderBy('name');
  const [memberSet, countMap] = await Promise.all([
    pluckSet('chamber_members', { user_id: userId }, 'chamber_id'),
    countByColumn('chamber_members', 'chamber_id'),
  ]);

  return chambers.map((c) => ({
    id: c.slug,
    name: c.name,
    tagline: c.tagline,
    description: c.description,
    theme: c.theme_key,
    emoji: c.emoji,
    memberCount: countMap.get(c.id) ?? 0,
    joined: memberSet.has(c.id),
  }));
}

async function findChamberBySlug(slug) {
  return db('chambers').where({ slug }).first();
}

export async function getChamber(slug, userId) {
  const chamber = await findChamberBySlug(slug);
  if (!chamber) return null;

  const [{ count: memberCount }] = await db('chamber_members').where({ chamber_id: chamber.id }).count('* as count');
  const [{ count: postCount }] = await db('posts').where({ chamber_id: chamber.id }).count('* as count');
  const membership = await db('chamber_members').where({ chamber_id: chamber.id, user_id: userId }).first();

  return {
    id: chamber.slug,
    name: chamber.name,
    tagline: chamber.tagline,
    description: chamber.description,
    theme: chamber.theme_key,
    emoji: chamber.emoji,
    memberCount: Number(memberCount),
    postCount: Number(postCount),
    joined: !!membership,
  };
}

export async function toggleMembership(slug, userId) {
  const chamber = await findChamberBySlug(slug);
  if (!chamber) return null;
  const joined = await toggleRow('chamber_members', { chamber_id: chamber.id, user_id: userId });
  return { joined };
}

async function attachPostMeta(rows, userId) {
  if (rows.length === 0) return [];
  const postIds = rows.map((r) => r.id);

  const [commentCountMap, likeCountMap, myLikeSet] = await Promise.all([
    countByColumn('comments', 'post_id', postIds),
    getLikeCountMap('post', postIds),
    getUserLikedSet(userId, 'post', postIds),
  ]);

  return rows.map((r) => ({
    id: `post-${r.id}`,
    author: r.author_name,
    initials: initialsOf(r.author_name),
    year: r.author_year,
    chamber: r.chamber_name,
    time: r.created_at,
    tag: r.tag ? { label: r.tag[0].toUpperCase() + r.tag.slice(1), kind: r.tag } : null,
    title: r.title,
    body: r.body,
    mediaUrl: r.media_url ? publicUrlFor(r.media_url) : null,
    likes: likeCountMap.get(r.id) ?? 0,
    comments: commentCountMap.get(r.id) ?? 0,
    likedByMe: myLikeSet.has(r.id),
  }));
}

export async function listPosts(slug, userId, tag) {
  const chamber = await findChamberBySlug(slug);
  if (!chamber) return null;

  let query = db('posts')
    .join('users', 'users.id', 'posts.author_id')
    .where('posts.chamber_id', chamber.id)
    .select('posts.*', 'users.full_name as author_name', 'users.year as author_year', db.raw('? as chamber_name', [chamber.name]))
    .orderBy('posts.created_at', 'desc');

  if (tag) query = query.andWhere('posts.tag', tag);

  const rows = await query;
  return attachPostMeta(rows, userId);
}

export async function createPost(slug, authorId, { title, body, tag, mediaPath }) {
  const chamber = await findChamberBySlug(slug);
  if (!chamber) return null;

  const [row] = await db('posts').insert({ chamber_id: chamber.id, author_id: authorId, title, body, tag: tag || null, media_url: mediaPath || null }).returning('id');
  const [post] = await attachPostMeta(
    await db('posts')
      .join('users', 'users.id', 'posts.author_id')
      .where('posts.id', row.id)
      .select('posts.*', 'users.full_name as author_name', 'users.year as author_year', db.raw('? as chamber_name', [chamber.name])),
    authorId,
  );
  return post;
}

export async function getPost(postId, userId) {
  const row = await db('posts')
    .join('users', 'users.id', 'posts.author_id')
    .join('chambers', 'chambers.id', 'posts.chamber_id')
    .where('posts.id', postId)
    .select('posts.*', 'users.full_name as author_name', 'users.year as author_year', 'chambers.name as chamber_name')
    .first();
  if (!row) return null;
  const [post] = await attachPostMeta([row], userId);
  return post;
}

export async function listComments(postId) {
  const rows = await db('comments')
    .join('users', 'users.id', 'comments.author_id')
    .where('comments.post_id', postId)
    .select('comments.*', 'users.full_name as author_name', 'users.year as author_year', 'users.role as author_role')
    .orderBy('comments.created_at', 'asc');

  const likeCountMap = await getLikeCountMap('comment', rows.map((r) => r.id));

  return rows.map((r) => ({
    id: `comment-${r.id}`,
    author: r.author_name,
    initials: initialsOf(r.author_name),
    year: r.author_role === 'lecturer' ? 'Lecturer' : r.author_year,
    time: r.created_at,
    text: r.body,
    likes: likeCountMap.get(r.id) ?? 0,
    best: r.best,
  }));
}

export async function createComment(postId, authorId, body) {
  const [row] = await db('comments').insert({ post_id: postId, author_id: authorId, body }).returning('id');
  const all = await listComments(postId);
  return all.find((c) => c.id === `comment-${row.id}`);
}
