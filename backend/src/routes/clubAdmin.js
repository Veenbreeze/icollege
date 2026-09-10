import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as clubAdminService from '../services/clubAdminService.js';

export const clubAdminRouter = Router();
clubAdminRouter.use(requireAuth, requireRole('club_admin'));

clubAdminRouter.get('/clubs', asyncHandler(async (req, res) => {
  res.json(await clubAdminService.listMyClubs(req.user.id));
}));

clubAdminRouter.patch('/clubs/:id', asyncHandler(async (req, res) => {
  const row = await clubAdminService.updateClubProfile(numericId(req.params.id), req.user.id, req.body);
  if (!row) throw new HttpError(403, 'You do not manage this club');
  res.json(row);
}));

clubAdminRouter.get('/clubs/:id/members', asyncHandler(async (req, res) => {
  const members = await clubAdminService.listMembers(numericId(req.params.id), req.user.id);
  if (!members) throw new HttpError(403, 'You do not manage this club');
  res.json(members);
}));

clubAdminRouter.delete('/clubs/:id/members/:userId', asyncHandler(async (req, res) => {
  const ok = await clubAdminService.removeMember(numericId(req.params.id), req.user.id, numericId(req.params.userId));
  if (!ok) throw new HttpError(404, 'Member not found');
  res.status(204).end();
}));

clubAdminRouter.post('/clubs/:id/events', asyncHandler(async (req, res) => {
  const row = await clubAdminService.createEvent(numericId(req.params.id), req.user.id, req.body);
  if (!row) throw new HttpError(403, 'You do not manage this club');
  res.status(201).json(row);
}));

clubAdminRouter.patch('/clubs/:id/events/:eventId', asyncHandler(async (req, res) => {
  const row = await clubAdminService.updateEvent(numericId(req.params.id), req.user.id, numericId(req.params.eventId), req.body);
  if (!row) throw new HttpError(404, 'Event not found');
  res.json(row);
}));

clubAdminRouter.delete('/clubs/:id/events/:eventId', asyncHandler(async (req, res) => {
  const ok = await clubAdminService.deleteEvent(numericId(req.params.id), req.user.id, numericId(req.params.eventId));
  if (!ok) throw new HttpError(404, 'Event not found');
  res.status(204).end();
}));

clubAdminRouter.get('/clubs/:id/announcements', asyncHandler(async (req, res) => {
  res.json(await clubAdminService.listAnnouncements(numericId(req.params.id)));
}));

clubAdminRouter.post('/clubs/:id/announcements', asyncHandler(async (req, res) => {
  const { title, body } = req.body;
  if (!title) throw new HttpError(400, 'title is required');
  const row = await clubAdminService.createAnnouncement(numericId(req.params.id), req.user.id, { title, body });
  if (!row) throw new HttpError(403, 'You do not manage this club');
  res.status(201).json(row);
}));

clubAdminRouter.post('/clubs/:id/competitions', asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title) throw new HttpError(400, 'title is required');
  const row = await clubAdminService.createCompetition(numericId(req.params.id), req.user.id, req.body);
  if (!row) throw new HttpError(403, 'You do not manage this club');
  res.status(201).json(row);
}));
