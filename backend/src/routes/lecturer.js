import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { requireRole } from '../middleware/roles.js';
import { createUploader } from '../middleware/upload.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { HttpError } from '../middleware/errorHandler.js';
import { numericId } from '../utils/ids.js';
import * as lecturerService from '../services/lecturerService.js';

export const lecturerRouter = Router();
lecturerRouter.use(requireAuth, requireRole('lecturer'));

const upload = createUploader('materials');

lecturerRouter.get('/courses', asyncHandler(async (req, res) => {
  res.json(await lecturerService.listMyCourses(req.user.id));
}));

lecturerRouter.post('/notices', asyncHandler(async (req, res) => {
  const { title, body, courseId } = req.body;
  if (!title || !body) throw new HttpError(400, 'title and body are required');
  const notice = await lecturerService.createNotice(req.user.id, { title, body, courseId: courseId ? numericId(courseId) : null });
  if (!notice) throw new HttpError(400, 'Invalid course');
  res.status(201).json(notice);
}));

lecturerRouter.post('/materials', upload.single('file'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No file uploaded');
  const { courseId } = req.body;
  if (!courseId) throw new HttpError(400, 'courseId is required');
  const material = await lecturerService.uploadMaterial(req.user.id, numericId(courseId), req.file);
  if (!material) throw new HttpError(403, 'You do not teach this course');
  res.status(201).json(material);
}));

lecturerRouter.post('/lecture-updates', asyncHandler(async (req, res) => {
  const { timetableSlotId, date, status, note } = req.body;
  if (!timetableSlotId || !date || !status) throw new HttpError(400, 'timetableSlotId, date and status are required');
  const row = await lecturerService.createLectureUpdate(req.user.id, { timetableSlotId: numericId(timetableSlotId), date, status, note });
  if (!row) throw new HttpError(403, 'You do not teach this course');
  res.status(201).json(row);
}));

lecturerRouter.get('/timetable-change-requests', asyncHandler(async (req, res) => {
  res.json(await lecturerService.listMyTimetableChangeRequests(req.user.id));
}));

lecturerRouter.post('/timetable-change-requests', asyncHandler(async (req, res) => {
  const { courseId, message } = req.body;
  if (!courseId || !message) throw new HttpError(400, 'courseId and message are required');
  const row = await lecturerService.createTimetableChangeRequest(req.user.id, { courseId: numericId(courseId), message });
  if (!row) throw new HttpError(403, 'You do not teach this course');
  res.status(201).json(row);
}));
