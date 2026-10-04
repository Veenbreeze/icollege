import path from 'node:path';
import { Router } from 'express';
import { db } from '../db/pool.js';
import { env } from '../config/env.js';
import { verifyMediaUrl } from '../middleware/upload.js';
import { visibleChamber } from '../services/visibilityService.js';

export const mediaRouter = Router();

mediaRouter.get('/:kind/:id', async (req, res, next) => {
  const { kind } = req.params;
  const id = Number(req.params.id);
  const userId = Number(req.query.user);
  if (!['avatar', 'post', 'reel', 'story'].includes(kind) || !Number.isSafeInteger(id) || id <= 0 || !Number.isSafeInteger(userId) || userId <= 0
      || !verifyMediaUrl(kind, id, userId, req.query.expires, req.query.signature)) {
    return res.status(403).json({ error: 'Media link is invalid or expired' });
  }
  try {
    const viewer = await db('users').join('universities', 'universities.id', 'users.university_id')
      .where({ 'users.id': userId, 'users.status': 'active', 'universities.status': 'active' })
      .first('users.id', 'users.university_id', 'users.department_id');
    if (!viewer) return res.status(404).end();
    let storagePath = null;
    if (kind === 'avatar') {
      if (id !== userId) return res.status(404).end();
      storagePath = (await db('users').where({ id, university_id: viewer.university_id }).first('avatar_url'))?.avatar_url;
    } else if (kind === 'post') {
      let query = db('posts').join('chambers', 'chambers.id', 'posts.chamber_id').where('posts.id', id);
      query = visibleChamber(query, {
        id: viewer.id,
        universityId: viewer.university_id,
        departmentId: viewer.department_id,
      });
      storagePath = (await query.first('posts.media_url'))?.media_url;
    } else if (kind === 'reel') {
      storagePath = (await db('reels').join('users', 'users.id', 'reels.author_id').where('reels.id', id)
        .andWhere(function () { this.where('reels.visibility', 'national').orWhere('users.university_id', viewer.university_id); })
        .first('reels.media_url'))?.media_url;
    } else {
      storagePath = (await db('stories').join('users', 'users.id', 'stories.user_id').where('stories.id', id)
        .andWhere('stories.expires_at', '>', new Date())
        .andWhere(function () { this.where('stories.visibility', 'national').orWhere('users.university_id', viewer.university_id); })
        .first('stories.media_url'))?.media_url;
    }
    if (!storagePath) return res.status(404).end();
    const root = path.resolve(env.uploadDir);
    const filePath = path.resolve(root, storagePath);
    const relative = path.relative(root, filePath);
    if (relative.startsWith('..') || path.isAbsolute(relative)) return res.status(404).end();
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Cache-Control', 'private, max-age=60');
    return res.sendFile(filePath, { dotfiles: 'deny' }, (error) => {
      if (error && !res.headersSent) next(error);
    });
  } catch (error) {
    return next(error);
  }
});
