import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as notificationService from '../services/notificationService.js';

export const notificationsRouter = Router();
notificationsRouter.use(requireAuth);

// Register / refresh this device's push token (called after login on native).
notificationsRouter.post('/register-token', asyncHandler(async (req, res) => {
  const { token, platform } = req.body ?? {};
  if (!token) throw new HttpError(400, 'token is required');
  await notificationService.registerToken(req.user.id, { token, platform });
  res.status(204).end();
}));

// The current user's in-app notification feed.
notificationsRouter.get('/', asyncHandler(async (req, res) => {
  res.json(await notificationService.listNotifications(req.user.id));
}));

notificationsRouter.get('/unread-count', asyncHandler(async (req, res) => {
  res.json({ count: await notificationService.unreadCount(req.user.id) });
}));

notificationsRouter.patch('/:id/read', asyncHandler(async (req, res) => {
  const row = await notificationService.markRead(req.user.id, numericId(req.params.id));
  if (!row) throw new HttpError(404, 'Notification not found');
  res.json(row);
}));

notificationsRouter.post('/read-all', asyncHandler(async (req, res) => {
  await notificationService.markAllRead(req.user.id);
  res.status(204).end();
}));
