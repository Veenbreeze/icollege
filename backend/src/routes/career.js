import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as careerService from '../services/careerService.js';

export const careerRouter = Router();
careerRouter.use(requireAuth);

careerRouter.get('/opportunities', asyncHandler(async (req, res) => {
  res.json(await careerService.listOpportunities(req.user.id, req.query.category));
}));

careerRouter.get('/opportunities/:id', asyncHandler(async (req, res) => {
  const opp = await careerService.getOpportunity(numericId(req.params.id), req.user.id);
  if (!opp) throw new HttpError(404, 'Opportunity not found');
  res.json(opp);
}));

careerRouter.post('/opportunities/:id/save', asyncHandler(async (req, res) => {
  res.json(await careerService.toggleSaveOpportunity(numericId(req.params.id), req.user.id));
}));

careerRouter.post('/opportunities/:id/apply', asyncHandler(async (req, res) => {
  res.json(await careerService.applyToOpportunity(numericId(req.params.id), req.user.id));
}));

careerRouter.get('/projects', asyncHandler(async (req, res) => {
  res.json(await careerService.listProjects(req.user.id));
}));

careerRouter.post('/projects', asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title) throw new HttpError(400, 'title is required');
  const project = await careerService.createProject(req.user.id, req.body);
  res.status(201).json(project);
}));

careerRouter.post('/projects/:id/join', asyncHandler(async (req, res) => {
  res.json(await careerService.toggleProjectMembership(numericId(req.params.id), req.user.id));
}));

careerRouter.get('/portfolio', asyncHandler(async (req, res) => {
  res.json(await careerService.getPortfolio(req.user.id));
}));
