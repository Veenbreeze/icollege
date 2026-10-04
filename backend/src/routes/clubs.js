import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as clubsService from '../services/clubsService.js';

export const clubsRouter = Router();
clubsRouter.use(requireAuth);

clubsRouter.get('/clubs', asyncHandler(async (req, res) => {
  res.json(await clubsService.listClubs(req.user));
}));

clubsRouter.post('/clubs/:id/join', asyncHandler(async (req, res) => {
  const result = await clubsService.toggleClubMembership(numericId(req.params.id), req.user);
  if (!result) throw new HttpError(404, 'Club not found');
  res.json(result);
}));

clubsRouter.get('/events', asyncHandler(async (req, res) => {
  res.json(await clubsService.listEvents(req.user));
}));

clubsRouter.post('/events/:id/register', asyncHandler(async (req, res) => {
  const result = await clubsService.toggleEventRegistration(numericId(req.params.id), req.user);
  if (!result) throw new HttpError(404, 'Event not found');
  res.json(result);
}));

clubsRouter.post('/events', asyncHandler(async (req, res) => {
  const { title, eventDate } = req.body;
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 160) throw new HttpError(400, 'Event title must be between 1 and 160 characters');
  if (typeof eventDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(eventDate) || Number.isNaN(Date.parse(`${eventDate}T00:00:00.000Z`)) || new Date(`${eventDate}T00:00:00.000Z`).toISOString().slice(0, 10) !== eventDate) throw new HttpError(400, 'Enter a valid event date in YYYY-MM-DD format');
  const event = await clubsService.createEvent(req.user, { ...req.body, title: title.trim(), eventDate, clubId: req.body.clubId ? numericId(req.body.clubId) : null });
  if (!event) throw new HttpError(404, 'Club not found');
  res.status(201).json(event);
}));
