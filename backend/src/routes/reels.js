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
  res.json(await reelsService.listStories(req.user));
}));

reelsRouter.post('/stories', uploadStory.single('media'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No media uploaded');
  res.status(201).json(await reelsService.createStory(req.user, relativeUploadPath(req.file), req.body.visibility));
}));

reelsRouter.post('/stories/:id/view', asyncHandler(async (req, res) => {
  const result = await reelsService.markStoryViewed(numericId(req.params.id), req.user);
  if (!result) throw new HttpError(404, 'Story not found');
  res.json(result);
}));

reelsRouter.get('/reels', asyncHandler(async (req, res) => {
  res.json(await reelsService.listReels(req.user));
}));

reelsRouter.get('/users/me/reels', asyncHandler(async (req, res) => {
  res.json(await reelsService.listReelsByAuthor(req.user));
}));

reelsRouter.post('/reels', uploadReel.single('media'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No media uploaded');
  const { caption, chamberId, visibility } = req.body;
  const reel = await reelsService.createReel(req.user, { caption, mediaPath: relativeUploadPath(req.file), chamberId: chamberId ? numericId(chamberId) : null, visibility });
  if (!reel) throw new HttpError(404, 'Chamber not found or not available to you');
  res.status(201).json(reel);
}));

reelsRouter.post('/reels/:id/like', asyncHandler(async (req, res) => {
  res.json(await reelsService.toggleReelLike(numericId(req.params.id), req.user));
}));

reelsRouter.post('/reels/:id/share', asyncHandler(async (req, res) => {
  const result = await reelsService.incrementReelShares(numericId(req.params.id), req.user);
  if (!result.shares) throw new HttpError(404, 'Reel not found');
  res.json(result);
}));
