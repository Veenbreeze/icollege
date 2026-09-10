import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import * as aiService from '../services/aiService.js';

export const aiRouter = Router();
aiRouter.use(requireAuth);

const numericId = (prefixedId) => Number(String(prefixedId).replace(/^[a-z]+-/, ''));

aiRouter.get('/search', asyncHandler(async (req, res) => {
  const q = req.query.q ?? '';
  res.json(await aiService.search(req.user.id, q));
}));

aiRouter.get('/study/courses', asyncHandler(async (req, res) => {
  res.json(await aiService.listStudyCourses());
}));

aiRouter.get('/study/courses/:id', asyncHandler(async (req, res) => {
  const study = await aiService.getCourseStudy(numericId(req.params.id));
  if (!study) throw new HttpError(404, 'Course not found');
  res.json(study);
}));

aiRouter.post('/chat', asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) throw new HttpError(400, 'text is required');
  const reply = await aiService.chatReply(req.user.id, text.trim());
  res.json({ reply });
}));
