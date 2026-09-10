import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as clubsService from '../services/clubsService.js';

export const clubsRouter = Router();
clubsRouter.use(requireAuth);

clubsRouter.get('/clubs', asyncHandler(async (req, res) => {
  res.json(await clubsService.listClubs(req.user.id));
}));

clubsRouter.post('/clubs/:id/join', asyncHandler(async (req, res) => {
  res.json(await clubsService.toggleClubMembership(numericId(req.params.id), req.user.id));
}));

clubsRouter.get('/events', asyncHandler(async (req, res) => {
  res.json(await clubsService.listEvents(req.user.id));
}));

clubsRouter.post('/events/:id/register', asyncHandler(async (req, res) => {
  res.json(await clubsService.toggleEventRegistration(numericId(req.params.id), req.user.id));
}));

clubsRouter.post('/events', asyncHandler(async (req, res) => {
  const { title, eventDate } = req.body;
  if (!title || !eventDate) throw new HttpError(400, 'title and eventDate are required');
  const event = await clubsService.createEvent(req.user.id, { ...req.body, clubId: req.body.clubId ? numericId(req.body.clubId) : null });
  res.status(201).json(event);
}));
