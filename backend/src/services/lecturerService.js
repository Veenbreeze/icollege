import { db } from '../db/pool.js';
import { signedDocumentUrl } from '../middleware/upload.js';
import path from 'node:path';
import { env } from '../config/env.js';

export async function listMyCourses(user) {
  const courses = await db('courses').where({ lecturer_id: user.id, university_id: user.universityId }).orderBy('code');
  const slots = await db('timetable_slots').whereIn('course_id', courses.map((c) => c.id)).select('id', 'course_id');
  const firstSlotByCourse = new Map();
  for (const s of slots) if (!firstSlotByCourse.has(s.course_id)) firstSlotByCourse.set(s.course_id, s.id);
  return courses.map((c) => ({ ...c, timetable_slot_id: firstSlotByCourse.get(c.id) ?? null }));
}

export async function createNotice(user, { title, body, courseId }) {
  const lecturerId = user.id;
  const course = courseId ? await db('courses').where({ id: courseId, lecturer_id: lecturerId, university_id: user.universityId }).first() : null;
  if (courseId && !course) return null;

  const [row] = await db('notices').insert({
    university_id: user.universityId,
    visibility: course ? 'course' : 'university',
    course_id: course?.id ?? null,
    title,
    body,
    category: course ? `Course: ${course.code}` : 'Academic',
    priority: 'Normal',
    icon: 'megaphone-outline',
    color_key: 'primary',
  }).returning('*');
  return row;
}

export async function uploadMaterial(user, courseId, file) {
  const lecturerId = user.id;
  const course = await db('courses').where({ id: courseId, lecturer_id: lecturerId, university_id: user.universityId }).first();
  if (!course) return null;

  const relativePath = path.relative(path.resolve(env.uploadDir), file.path);
  const docType = file.mimetype === 'application/pdf' ? 'pdf' : file.mimetype?.startsWith('image/') ? 'image' : 'doc';
  const [row] = await db('documents').insert({
    user_id: lecturerId,
    name: file.originalname,
    doc_type: docType,
    category: 'Course Material',
    size_bytes: file.size,
    mime_type: file.mimetype,
    storage_path: relativePath,
    course_id: courseId,
    visibility: 'course',
  }).returning('*');
  return { ...row, url: signedDocumentUrl(row.id, lecturerId) };
}

export async function createLectureUpdate(user, { timetableSlotId, date, status, note }) {
  const lecturerId = user.id;
  const slot = await db('timetable_slots')
    .join('courses', 'courses.id', 'timetable_slots.course_id')
    .where('timetable_slots.id', timetableSlotId)
    .andWhere('courses.lecturer_id', lecturerId)
    .andWhere('courses.university_id', user.universityId)
    .first('timetable_slots.id');
  if (!slot) return null;

  const [row] = await db('lecture_updates').insert({
    timetable_slot_id: timetableSlotId, date, status, note, updated_by: lecturerId,
  }).returning('*');
  return row;
}

export async function createTimetableChangeRequest(user, { courseId, message }) {
  const lecturerId = user.id;
  const course = await db('courses').where({ id: courseId, lecturer_id: lecturerId, university_id: user.universityId }).first();
  if (!course) return null;

  const [row] = await db('timetable_change_requests').insert({
    course_id: courseId, lecturer_id: lecturerId, message,
  }).returning('*');
  return row;
}

export async function listMyTimetableChangeRequests(user) {
  return db('timetable_change_requests').join('courses', 'courses.id', 'timetable_change_requests.course_id')
    .where({ 'timetable_change_requests.lecturer_id': user.id, 'courses.university_id': user.universityId })
    .select('timetable_change_requests.*').orderBy('timetable_change_requests.created_at', 'desc');
}
