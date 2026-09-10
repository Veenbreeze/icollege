import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as chatService from '../services/chatService.js';

export const chatRouter = Router();
chatRouter.use(requireAuth);

chatRouter.get('/threads', asyncHandler(async (req, res) => {
  res.json(await chatService.listThreads(req.user.id));
}));

chatRouter.get('/threads/:id', asyncHandler(async (req, res) => {
  const thread = await chatService.getThread(numericId(req.params.id), req.user.id);
  if (!thread) throw new HttpError(404, 'Thread not found');
  res.json(thread);
}));

chatRouter.get('/threads/:id/messages', asyncHandler(async (req, res) => {
  const after = req.query.after ? numericId(req.query.after) : undefined;
  const messages = await chatService.listMessages(numericId(req.params.id), req.user.id, after);
  if (!messages) throw new HttpError(404, 'Thread not found');
  res.json(messages);
}));

chatRouter.post('/threads/:id/messages', asyncHandler(async (req, res) => {
  const { text } = req.body;
  if (!text?.trim()) throw new HttpError(400, 'text is required');
  const message = await chatService.sendMessage(numericId(req.params.id), req.user.id, text.trim());
  if (!message) throw new HttpError(404, 'Thread not found');
  res.status(201).json(message);
}));
