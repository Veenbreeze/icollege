import path from 'node:path';
import fs from 'node:fs';
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import { db } from '../db/pool.js';
import { env } from '../config/env.js';

export const filesRouter = Router();
filesRouter.use(requireAuth);

/**
 * Decide whether `user` may read `doc` (a row from the `documents` table).
 * - private  → owner only
 * - course   → any user in the SAME university as the owning course
 */
async function canAccess(doc, user) {
  if (doc.visibility === 'course') {
    if (!doc.course_id || !user.universityId) return false;
    const course = await db('courses').where({ id: doc.course_id }).first('university_id');
    return !!course && course.university_id === user.universityId;
  }
  // 'private' and any unknown visibility default to owner-only.
  return doc.user_id === user.id;
}

/** Authenticated, access-checked download for iVault documents + course materials. */
filesRouter.get('/:id/download', asyncHandler(async (req, res) => {
  const doc = await db('documents').where({ id: numericId(req.params.id) }).first();
  if (!doc) throw new HttpError(404, 'File not found');
  if (!(await canAccess(doc, req.user))) throw new HttpError(403, 'You do not have access to this file');

  const absolutePath = path.resolve(env.uploadDir, doc.storage_path);
  // Guard against path traversal: the resolved path must stay inside uploadDir.
  const root = path.resolve(env.uploadDir);
  if (!absolutePath.startsWith(root + path.sep)) throw new HttpError(400, 'Invalid file path');
  if (!fs.existsSync(absolutePath)) throw new HttpError(404, 'File missing on disk');

  if (doc.mime_type) res.type(doc.mime_type);
  res.sendFile(absolutePath);
}));
