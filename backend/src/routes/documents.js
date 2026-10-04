import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createUploader, verifyDocumentUrl } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as documentsService from '../services/documentsService.js';
import { db } from '../db/pool.js';

export const documentsRouter = Router();

documentsRouter.get('/:id/download', asyncHandler(async (req, res) => {
  const id = numericId(req.params.id);
  const userId = numericId(req.query.user);
  if (!verifyDocumentUrl(id, userId, req.query.expires, req.query.signature)) throw new HttpError(403, 'Download link is invalid or expired');
  const account = await db('users').join('universities', 'universities.id', 'users.university_id')
    .where({ 'users.id': userId, 'users.status': 'active', 'universities.status': 'active' })
    .first('users.id', 'users.role', 'users.university_id');
  if (!account) throw new HttpError(404, 'Document not found');
  const filePath = await documentsService.resolveDownload(id, { id: account.id, role: account.role, universityId: account.university_id });
  if (!filePath) throw new HttpError(404, 'Document not found');
  res.download(filePath);
}));

documentsRouter.use(requireAuth);

const upload = createUploader('documents');

documentsRouter.get('/', asyncHandler(async (req, res) => {
  res.json(await documentsService.listDocuments(req.user.id));
}));

documentsRouter.get('/materials', asyncHandler(async (req, res) => {
  const courseId = numericId(req.query.courseId);
  const materials = await documentsService.listCourseMaterials(req.user, courseId);
  if (!materials) throw new HttpError(404, 'Course not found');
  res.json(materials);
}));

documentsRouter.post('/', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No file uploaded');
  const doc = await documentsService.createDocument(req.user.id, req.file, req.body.category);
  res.status(201).json(doc);
}));

documentsRouter.delete('/:id', asyncHandler(async (req, res) => {
  const id = numericId(req.params.id);
  const deleted = await documentsService.deleteDocument(req.user.id, id);
  if (!deleted) throw new HttpError(404, 'Document not found');
  res.status(204).end();
}));
