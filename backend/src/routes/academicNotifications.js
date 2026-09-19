import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as academicNotificationService from '../services/academicNotificationService.js';

export const academicNotificationsRouter = Router();
academicNotificationsRouter.use(requireAuth);

// Register / refresh this device's push token (called after login on native).
academicNotificationsRouter.post('/register-token', asyncHandler(async (req, res) => {
  const { token, platform } = req.body ?? {};
  if (!token) throw new HttpError(400, 'token is required');
  await academicNotificationService.registerToken(req.user.id, { token, platform });
  res.status(204).end();
}));

// The current user's academic notification feed (notice/lecture alerts).
academicNotificationsRouter.get('/', asyncHandler(async (req, res) => {
  res.json(await academicNotificationService.listNotifications(req.user.id));
}));

academicNotificationsRouter.get('/unread-count', asyncHandler(async (req, res) => {
  res.json({ count: await academicNotificationService.unreadCount(req.user.id) });
}));

academicNotificationsRouter.patch('/:id/read', asyncHandler(async (req, res) => {
  const row = await academicNotificationService.markRead(req.user.id, numericId(req.params.id));
  if (!row) throw new HttpError(404, 'Notification not found');
  res.json(row);
}));

academicNotificationsRouter.post('/read-all', asyncHandler(async (req, res) => {
  await academicNotificationService.markAllRead(req.user.id);
  res.status(204).end();
}));
