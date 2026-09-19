import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import * as notificationsService from '../services/notificationsService.js';

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

notificationsRouter.get('/', asyncHandler(async (req, res) => {
  res.json(await notificationsService.listNotifications(req.user.id));
}));

notificationsRouter.get('/unread-count', asyncHandler(async (req, res) => {
  res.json({ count: await notificationsService.getUnreadCount(req.user.id) });
}));

notificationsRouter.post('/:id/read', asyncHandler(async (req, res) => {
  await notificationsService.markRead(Number(req.params.id), req.user.id);
  res.status(204).end();
}));

notificationsRouter.post('/read-all', asyncHandler(async (req, res) => {
  await notificationsService.markAllRead(req.user.id);
  res.status(204).end();
}));
