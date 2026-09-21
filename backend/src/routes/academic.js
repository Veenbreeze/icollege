import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as academicService from '../services/academicService.js';

export const academicRouter = Router();
academicRouter.use(requireAuth);

academicRouter.get('/timetable/today', asyncHandler(async (req, res) => {
  res.json(await academicService.getTodayTimetable(req.user.universityId));
}));

academicRouter.get('/timetable/week', asyncHandler(async (req, res) => {
  res.json(await academicService.getWeekTimetable(req.user.universityId));
}));

academicRouter.get('/exams', asyncHandler(async (req, res) => {
  res.json(await academicService.getExams(req.user.id, req.user.universityId));
}));

academicRouter.get('/exams/:id/seating', asyncHandler(async (req, res) => {
  const examId = numericId(req.params.id);
  const seating = await academicService.getExamSeating(examId, req.user.id);
  if (!seating) throw new HttpError(404, 'Exam not found');
  res.json(seating);
}));

academicRouter.get('/notices', asyncHandler(async (req, res) => {
  res.json(await academicService.getNotices(req.user.id, req.user.universityId));
}));

academicRouter.post('/notices/:id/read', asyncHandler(async (req, res) => {
  const noticeId = numericId(req.params.id);
  await academicService.markNoticeRead(noticeId, req.user.id);
  res.status(204).end();
}));
