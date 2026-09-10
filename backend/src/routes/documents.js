import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createUploader } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as documentsService from '../services/documentsService.js';

export const documentsRouter = Router();
documentsRouter.use(requireAuth);

const upload = createUploader('documents');

documentsRouter.get('/', asyncHandler(async (req, res) => {
  res.json(await documentsService.listDocuments(req.user.id));
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
