import path from 'node:path';
import fs from 'node:fs';
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import { verifyAccessToken, signFileToken } from '../utils/jwt.js';
import { db } from '../db/pool.js';
import { env } from '../config/env.js';

export const filesRouter = Router();

/**
 * Decide whether `user` may read `doc` (a row from the `documents` table).
 * - private  → owner only
 * - course   → any user in the SAME university as the owning course
 */
async function canAccess(doc, user) {
  if (!user) return false;
  if (doc.visibility === 'course') {
    if (!doc.course_id || !user.universityId) return false;
    const course = await db('courses').where({ id: doc.course_id }).first('university_id');
    return !!course && course.university_id === user.universityId;
  }
  // 'private' and any unknown visibility default to owner-only.
  return doc.user_id === user.id;
}

/**
 * Issue a short-lived signed URL the client can open directly (e.g. in a browser
 * tab or a native file viewer) without attaching an Authorization header.
 */
filesRouter.get('/:id/signed-url', requireAuth, asyncHandler(async (req, res) => {
  const id = numericId(req.params.id);
  const doc = await db('documents').where({ id }).first();
  if (!doc) throw new HttpError(404, 'File not found');
  if (!(await canAccess(doc, req.user))) throw new HttpError(403, 'You do not have access to this file');

  const token = signFileToken({ userId: req.user.id, universityId: req.user.universityId, fileId: id });
  res.json({ url: `/api/files/${id}/download?token=${token}` });
}));

/**
 * Access-checked download. Identity comes from either a `?token=` signed file
 * token (bound to this file id) or a normal Bearer access token.
 */
filesRouter.get('/:id/download', asyncHandler(async (req, res) => {
  const id = numericId(req.params.id);
  const doc = await db('documents').where({ id }).first();
  if (!doc) throw new HttpError(404, 'File not found');

  let user = null;
  if (req.query.token) {
    try {
      const p = verifyAccessToken(String(req.query.token));
      if (p.kind !== 'file' || p.fid !== id) throw new Error('token/file mismatch');
      user = { id: p.sub, universityId: p.universityId ?? null };
    } catch {
      throw new HttpError(401, 'Invalid or expired file link');
    }
  } else {
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) throw new HttpError(401, 'Authentication required');
    try {
      const p = verifyAccessToken(header.slice('Bearer '.length));
      user = { id: p.sub, universityId: p.universityId ?? null };
    } catch {
      throw new HttpError(401, 'Invalid or expired token');
    }
  }

  if (!(await canAccess(doc, user))) throw new HttpError(403, 'You do not have access to this file');

  const absolutePath = path.resolve(env.uploadDir, doc.storage_path);
  const root = path.resolve(env.uploadDir);
  if (!absolutePath.startsWith(root + path.sep)) throw new HttpError(400, 'Invalid file path');
  if (!fs.existsSync(absolutePath)) throw new HttpError(404, 'File missing on disk');

  if (doc.mime_type) res.type(doc.mime_type);
  res.sendFile(absolutePath);
}));
