import path from 'node:path';
import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { createUploader } from '../middleware/upload.js';
import { env } from '../config/env.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as reelsService from '../services/reelsService.js';

export const reelsRouter = Router();
reelsRouter.use(requireAuth);

const uploadReel = createUploader('reels', { maxSizeMb: 100 });
const uploadStory = createUploader('stories', { maxSizeMb: 50 });

function relativeUploadPath(file) {
  return path.relative(path.resolve(env.uploadDir), file.path);
}

reelsRouter.get('/stories', asyncHandler(async (req, res) => {
  res.json(await reelsService.listStories(req.user.id));
}));

reelsRouter.post('/stories', uploadStory.single('media'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No media uploaded');
  res.status(201).json(await reelsService.createStory(req.user.id, relativeUploadPath(req.file)));
}));

reelsRouter.get('/reels', asyncHandler(async (req, res) => {
  res.json(await reelsService.listReels(req.user.id));
}));

reelsRouter.post('/reels', uploadReel.single('media'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No media uploaded');
  const { caption, chamberId } = req.body;
  const reel = await reelsService.createReel(req.user.id, { caption, mediaPath: relativeUploadPath(req.file), chamberId: chamberId ? numericId(chamberId) : null });
  res.status(201).json(reel);
}));

reelsRouter.post('/reels/:id/like', asyncHandler(async (req, res) => {
  res.json(await reelsService.toggleReelLike(numericId(req.params.id), req.user.id));
}));

reelsRouter.post('/reels/:id/share', asyncHandler(async (req, res) => {
  res.json(await reelsService.incrementReelShares(numericId(req.params.id)));
}));
