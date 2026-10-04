import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as careerService from '../services/careerService.js';

export const careerRouter = Router();
careerRouter.use(requireAuth);

careerRouter.get('/opportunities', asyncHandler(async (req, res) => {
  res.json(await careerService.listOpportunities(req.user, req.query.category));
}));

careerRouter.get('/opportunities/:id', asyncHandler(async (req, res) => {
  const opp = await careerService.getOpportunity(numericId(req.params.id), req.user);
  if (!opp) throw new HttpError(404, 'Opportunity not found');
  res.json(opp);
}));

careerRouter.post('/opportunities/:id/save', asyncHandler(async (req, res) => {
  const result = await careerService.toggleSaveOpportunity(numericId(req.params.id), req.user);
  if (!result) throw new HttpError(404, 'Opportunity not found');
  res.json(result);
}));

careerRouter.post('/opportunities/:id/apply', asyncHandler(async (req, res) => {
  const result = await careerService.applyToOpportunity(numericId(req.params.id), req.user);
  if (!result) throw new HttpError(404, 'Opportunity not found');
  res.json(result);
}));

careerRouter.get('/projects', asyncHandler(async (req, res) => {
  res.json(await careerService.listProjects(req.user));
}));

careerRouter.post('/projects', asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (typeof title !== 'string' || !title.trim() || title.trim().length > 160) throw new HttpError(400, 'Project title must be between 1 and 160 characters');
  if (req.body.tagline !== undefined && (typeof req.body.tagline !== 'string' || req.body.tagline.length > 500)) throw new HttpError(400, 'Project tagline must be 500 characters or fewer');
  if (req.body.skills !== undefined && (!Array.isArray(req.body.skills) || req.body.skills.length > 30 || req.body.skills.some((skill) => typeof skill !== 'string' || skill.length > 60))) throw new HttpError(400, 'Project skills are invalid');
  if (req.body.neededCount !== undefined && (!Number.isSafeInteger(Number(req.body.neededCount)) || Number(req.body.neededCount) < 0 || Number(req.body.neededCount) > 100)) throw new HttpError(400, 'Teammate count must be between 0 and 100');
  const project = await careerService.createProject(req.user, { ...req.body, title: title.trim(), tagline: req.body.tagline?.trim() ?? '' });
  res.status(201).json(project);
}));

careerRouter.post('/projects/:id/join', asyncHandler(async (req, res) => {
  const result = await careerService.toggleProjectMembership(numericId(req.params.id), req.user);
  if (!result) throw new HttpError(404, 'Project not found');
  res.json(result);
}));

careerRouter.get('/portfolio', asyncHandler(async (req, res) => {
  res.json(await careerService.getPortfolio(req.user.id));
}));
