import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as employerService from '../services/employerService.js';

export const employerRouter = Router();
employerRouter.use(requireAuth, requireRole('employer'));

employerRouter.get('/company', asyncHandler(async (req, res) => {
  const company = await employerService.getMyCompany(req.user.id);
  if (!company) throw new HttpError(404, 'No company profile yet');
  res.json(company);
}));

employerRouter.patch('/company', asyncHandler(async (req, res) => {
  const company = await employerService.updateMyCompany(req.user.id, req.body);
  if (!company) throw new HttpError(404, 'No company profile yet');
  res.json(company);
}));

employerRouter.get('/opportunities', asyncHandler(async (req, res) => {
  res.json(await employerService.listMyOpportunities(req.user.id));
}));

employerRouter.post('/opportunities', asyncHandler(async (req, res) => {
  const { role, type, category } = req.body;
  if (!role || !type || !category) throw new HttpError(400, 'role, type and category are required');
  res.status(201).json(await employerService.createOpportunity(req.user.id, req.body));
}));

employerRouter.get('/opportunities/:id/applicants', asyncHandler(async (req, res) => {
  const applicants = await employerService.listApplicants(req.user.id, numericId(req.params.id));
  if (!applicants) throw new HttpError(404, 'Opportunity not found');
  res.json(applicants);
}));

employerRouter.post('/competitions', asyncHandler(async (req, res) => {
  const { title } = req.body;
  if (!title) throw new HttpError(400, 'title is required');
  const row = await employerService.createChallenge(req.user.id, req.body);
  if (!row) throw new HttpError(400, 'Create a company profile first');
  res.status(201).json(row);
}));

employerRouter.get('/talent-search', asyncHandler(async (req, res) => {
  res.json(await employerService.searchTalent({ skill: req.query.skill, programme: req.query.programme }));
}));
