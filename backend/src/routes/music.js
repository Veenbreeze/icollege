import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as musicService from '../services/musicService.js';

export const musicRouter = Router();
musicRouter.use(requireAuth);

musicRouter.get('/search', asyncHandler(async (req, res) => {
  res.json(await musicService.searchTracks(req.query.q, req.query.country ?? 'tz'));
}));
