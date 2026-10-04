import { db } from '../db/pool.js';
import { countByColumn, pluckSet, toggleRow } from '../db/queryHelpers.js';
import { getLikeCountMap, getUserLikedSet } from './likesService.js';
import { notifyMany, notifyOwner } from './notificationsService.js';
import { initialsOf } from '../utils/names.js';
import { signedMediaUrl } from '../middleware/upload.js';
import { visibleChamber } from './visibilityService.js';

export async function listChambers(user) {
  const chambers = await visibleChamber(db('chambers'), user).select('chambers.*').orderBy('name');
  const [memberSet, countMap] = await Promise.all([
    pluckSet('chamber_members', { user_id: user.id }, 'chamber_id'),
    countByColumn('chamber_members', 'chamber_id', chambers.map((c) => c.id)),
  ]);

  return chambers.map((c) => {
    const joined = memberSet.has(c.id);
    return {
      id: c.slug,
      name: c.name,
      tagline: c.tagline,
      description: c.description,
      theme: c.theme_key,
      emoji: c.emoji,
      visibility: c.visibility,
      memberCount: countMap.get(c.id) ?? 0,
      joined,
      recommended: !joined,
    };
  }).sort((a, b) => Number(b.joined) - Number(a.joined)
    || b.memberCount - a.memberCount
    || a.name.localeCompare(b.name));
}

async function findChamberBySlug(slug, user) {
  return visibleChamber(db('chambers').where({ slug }), user).first();
}

export async function getChamber(slug, user) {
  const chamber = await findChamberBySlug(slug, user);
  if (!chamber) return null;

  const [{ count: memberCount }] = await db('chamber_members').where({ chamber_id: chamber.id }).count('* as count');
  const [{ count: postCount }] = await db('posts').where({ chamber_id: chamber.id }).count('* as count');
  const membership = await db('chamber_members').where({ chamber_id: chamber.id, user_id: user.id }).first();

  return {
    id: chamber.slug,
    name: chamber.name,
    tagline: chamber.tagline,
    description: chamber.description,
    theme: chamber.theme_key,
    emoji: chamber.emoji,
    visibility: chamber.visibility,
    memberCount: Number(memberCount),
    postCount: Number(postCount),
    joined: !!membership,
  };
}

export async function toggleMembership(slug, user) {
  const chamber = await findChamberBySlug(slug, user);
  if (!chamber) return null;
  const joined = await toggleRow('chamber_members', { chamber_id: chamber.id, user_id: user.id });
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
    mediaUrl: r.media_url ? signedMediaUrl('post', r.id, userId) : null,
    likes: likeCountMap.get(r.id) ?? 0,
    comments: commentCountMap.get(r.id) ?? 0,
    likedByMe: myLikeSet.has(r.id),
  }));
}

export async function listPosts(slug, user, tag) {
  const chamber = await findChamberBySlug(slug, user);
  if (!chamber) return null;

  let query = db('posts')
    .join('users', 'users.id', 'posts.author_id')
    .where('posts.chamber_id', chamber.id)
    .select('posts.*', 'users.full_name as author_name', 'users.year as author_year', db.raw('? as chamber_name', [chamber.name]))
    .orderBy('posts.created_at', 'desc').limit(50);

  if (tag) query = query.andWhere('posts.tag', tag);

  const rows = await query;
  return attachPostMeta(rows, user.id);
}

export async function listPostsByAuthor(authorId, user) {
  let query = db('posts')
    .join('users', 'users.id', 'posts.author_id')
    .join('chambers', 'chambers.id', 'posts.chamber_id')
    .where('posts.author_id', authorId)
    .modify((q) => visibleChamber(q, user, 'chambers'))
    .select('posts.*', 'users.full_name as author_name', 'users.year as author_year', 'chambers.name as chamber_name')
    .orderBy('posts.created_at', 'desc').limit(50);

  return attachPostMeta(await query, user.id);
}

export async function createPost(slug, user, { title, body, tag, mediaPath }) {
  const authorId = user.id;
  const chamber = await findChamberBySlug(slug, user);
  if (!chamber) return null;
  if (!(await db('chamber_members').where({ chamber_id: chamber.id, user_id: authorId }).first())) return null;

  const [row] = await db('posts').insert({ chamber_id: chamber.id, author_id: authorId, title, body, tag: tag || null, media_url: mediaPath || null }).returning('id');
  const [post] = await attachPostMeta(
    await db('posts')
      .join('users', 'users.id', 'posts.author_id')
      .where('posts.id', row.id)
      .select('posts.*', 'users.full_name as author_name', 'users.year as author_year', db.raw('? as chamber_name', [chamber.name])),
    authorId,
  );

  const memberIds = await db('chamber_members').where({ chamber_id: chamber.id }).pluck('user_id');
  await notifyMany(memberIds, authorId, 'new_post', 'post', row.id);

  return post;
}

export async function getPost(postId, user) {
  let query = db('posts')
    .join('users', 'users.id', 'posts.author_id')
    .join('chambers', 'chambers.id', 'posts.chamber_id')
    .where('posts.id', postId);
  query = visibleChamber(query, user, 'chambers');
  const row = await query
    .select('posts.*', 'users.full_name as author_name', 'users.year as author_year', 'chambers.name as chamber_name')
    .first();
  if (!row) return null;
  const [post] = await attachPostMeta([row], user.id);
  return post;
}

export async function listComments(postId, user) {
  const visiblePost = await db('posts').join('chambers', 'chambers.id', 'posts.chamber_id')
    .where('posts.id', postId).modify((query) => visibleChamber(query, user, 'chambers')).first('posts.id');
  if (!visiblePost) return null;
  const rows = await db('comments')
    .join('users', 'users.id', 'comments.author_id')
    .join('posts', 'posts.id', 'comments.post_id')
    .join('chambers', 'chambers.id', 'posts.chamber_id')
    .where('comments.post_id', postId)
    .andWhere(function () {
      this.where('chambers.visibility', 'national').orWhere('chambers.university_id', user.universityId);
    })
    .select('comments.*', 'users.full_name as author_name', 'users.year as author_year', 'users.role as author_role')
    .orderBy('comments.created_at', 'asc').limit(200);

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

export async function createComment(postId, user, body) {
  const authorId = user.id;
  const post = await db('posts').join('chambers', 'chambers.id', 'posts.chamber_id')
    .where('posts.id', postId).modify((query) => visibleChamber(query, user, 'chambers')).first('posts.id');
  if (!post) return null;
  const [row] = await db('comments').insert({ post_id: postId, author_id: authorId, body }).returning('id');
  await notifyOwner('post', postId, authorId, 'comment');
  const all = await listComments(postId, user);
  return all.find((c) => c.id === `comment-${row.id}`);
}
