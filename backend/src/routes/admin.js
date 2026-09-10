import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as adminService from '../services/adminService.js';

export const adminRouter = Router();
adminRouter.use(requireAuth, requireRole('university_admin', 'platform_admin'));

adminRouter.get('/stats', asyncHandler(async (req, res) => {
  res.json(await adminService.getStats());
}));

/* users */
adminRouter.get('/users', asyncHandler(async (req, res) => {
  res.json(await adminService.listUsers({ status: req.query.status, role: req.query.role }));
}));

adminRouter.patch('/users/:id/status', asyncHandler(async (req, res) => {
  const user = await adminService.updateUserStatus(numericId(req.params.id), req.body.status);
  if (!user) throw new HttpError(400, 'Invalid user or status');
  res.json(user);
}));

adminRouter.patch('/users/:id/role', requireRole('platform_admin'), asyncHandler(async (req, res) => {
  const user = await adminService.updateUserRole(numericId(req.params.id), req.body.role);
  if (!user) throw new HttpError(400, 'Invalid user or role');
  res.json(user);
}));

/* courses */
adminRouter.get('/courses', asyncHandler(async (req, res) => {
  res.json(await adminService.listCourses());
}));
adminRouter.post('/courses', asyncHandler(async (req, res) => {
  res.status(201).json(await adminService.createCourse(req.body));
}));
adminRouter.patch('/courses/:id', asyncHandler(async (req, res) => {
  const row = await adminService.updateCourse(numericId(req.params.id), req.body);
  if (!row) throw new HttpError(404, 'Course not found');
  res.json(row);
}));
adminRouter.delete('/courses/:id', asyncHandler(async (req, res) => {
  const ok = await adminService.deleteCourse(numericId(req.params.id));
  if (!ok) throw new HttpError(404, 'Course not found');
  res.status(204).end();
}));
adminRouter.patch('/courses/:id/lecturer', asyncHandler(async (req, res) => {
  const row = await adminService.assignCourseLecturer(numericId(req.params.id), numericId(req.body.lecturerId));
  if (!row) throw new HttpError(400, 'Invalid course or lecturer');
  res.json(row);
}));

/* timetable */
adminRouter.post('/timetable-slots', asyncHandler(async (req, res) => {
  res.status(201).json(await adminService.createTimetableSlot(req.body));
}));
adminRouter.patch('/timetable-slots/:id', asyncHandler(async (req, res) => {
  const row = await adminService.updateTimetableSlot(numericId(req.params.id), req.body);
  if (!row) throw new HttpError(404, 'Slot not found');
  res.json(row);
}));
adminRouter.delete('/timetable-slots/:id', asyncHandler(async (req, res) => {
  const ok = await adminService.deleteTimetableSlot(numericId(req.params.id));
  if (!ok) throw new HttpError(404, 'Slot not found');
  res.status(204).end();
}));

adminRouter.get('/timetable-change-requests', asyncHandler(async (req, res) => {
  res.json(await adminService.listTimetableChangeRequests(req.query.status));
}));
adminRouter.patch('/timetable-change-requests/:id', asyncHandler(async (req, res) => {
  const row = await adminService.resolveTimetableChangeRequest(numericId(req.params.id), req.body.status, req.body.adminNote);
  if (!row) throw new HttpError(400, 'Invalid request id or status');
  res.json(row);
}));

/* exams */
adminRouter.post('/exams', asyncHandler(async (req, res) => {
  res.status(201).json(await adminService.createExam(req.body));
}));
adminRouter.patch('/exams/:id', asyncHandler(async (req, res) => {
  const row = await adminService.updateExam(numericId(req.params.id), req.body);
  if (!row) throw new HttpError(404, 'Exam not found');
  res.json(row);
}));
adminRouter.delete('/exams/:id', asyncHandler(async (req, res) => {
  const ok = await adminService.deleteExam(numericId(req.params.id));
  if (!ok) throw new HttpError(404, 'Exam not found');
  res.status(204).end();
}));
adminRouter.post('/exams/:id/generate-seating', asyncHandler(async (req, res) => {
  const result = await adminService.generateExamSeating(numericId(req.params.id));
  if (!result) throw new HttpError(404, 'Exam not found');
  res.json(result);
}));

/* notices */
adminRouter.post('/notices', asyncHandler(async (req, res) => {
  res.status(201).json(await adminService.createNotice(req.body));
}));
adminRouter.patch('/notices/:id', asyncHandler(async (req, res) => {
  const row = await adminService.updateNotice(numericId(req.params.id), req.body);
  if (!row) throw new HttpError(404, 'Notice not found');
  res.json(row);
}));
adminRouter.delete('/notices/:id', asyncHandler(async (req, res) => {
  const ok = await adminService.deleteNotice(numericId(req.params.id));
  if (!ok) throw new HttpError(404, 'Notice not found');
  res.status(204).end();
}));

/* clubs / companies */
adminRouter.patch('/clubs/:id/owner', asyncHandler(async (req, res) => {
  const row = await adminService.assignClubOwner(numericId(req.params.id), numericId(req.body.ownerId));
  if (!row) throw new HttpError(400, 'Invalid club or owner');
  res.json(row);
}));
adminRouter.patch('/companies/:id/verify', asyncHandler(async (req, res) => {
  const row = await adminService.verifyCompany(numericId(req.params.id), req.body.verified);
  if (!row) throw new HttpError(404, 'Company not found');
  res.json(row);
}));

/* platform settings — platform_admin only */
adminRouter.get('/settings', requireRole('platform_admin'), asyncHandler(async (req, res) => {
  res.json(await adminService.getSettings());
}));
adminRouter.patch('/settings', requireRole('platform_admin'), asyncHandler(async (req, res) => {
  res.json(await adminService.updateSettings(req.user.id, req.body));
}));
