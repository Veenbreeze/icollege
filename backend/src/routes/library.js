import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { numericId } from '../utils/ids.js';
import * as libraryService from '../services/libraryService.js';

export const libraryRouter = Router();
libraryRouter.use(requireAuth);

libraryRouter.get('/', asyncHandler(async (req, res) => {
  const courseId = req.query.courseId ? numericId(req.query.courseId) : undefined;
  res.json(await libraryService.listMaterials({ courseId }));
}));
