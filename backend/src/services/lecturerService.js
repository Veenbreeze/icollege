import { db } from '../db/pool.js';
import { publicUrlFor } from '../middleware/upload.js';
import path from 'node:path';
import { env } from '../config/env.js';
import * as notificationService from './academicNotificationService.js';

export async function listMyCourses(lecturerId) {
  const courses = await db('courses').where({ lecturer_id: lecturerId }).orderBy('code');
  const slots = await db('timetable_slots').whereIn('course_id', courses.map((c) => c.id)).select('id', 'course_id');
  const firstSlotByCourse = new Map();
  for (const s of slots) if (!firstSlotByCourse.has(s.course_id)) firstSlotByCourse.set(s.course_id, s.id);
  return courses.map((c) => ({ ...c, timetable_slot_id: firstSlotByCourse.get(c.id) ?? null }));
}

export async function createNotice(lecturerId, { title, body, courseId }) {
  const course = courseId ? await db('courses').where({ id: courseId, lecturer_id: lecturerId }).first() : null;
  if (courseId && !course) return null;

  const universityId = (await db('users').where({ id: lecturerId }).first('university_id'))?.university_id ?? null;
  const [row] = await db('notices').insert({
    title,
    body,
    category: course ? `Course: ${course.code}` : 'Academic',
    priority: 'Normal',
    icon: 'megaphone-outline',
    color_key: 'primary',
    university_id: universityId,
    scope: universityId ? 'university' : 'national',
  }).returning('*');
  // Rule engine: a lecturer announcement alerts their university's students.
  const studentIds = await notificationService.activeStudentIds(universityId);
  await notificationService.notifyUsers(studentIds, {
    title: course ? `${course.code}: ${row.title}` : `New notice: ${row.title}`,
    body: row.body,
    type: 'notice',
    deepLink: '/notices',
  });
  return row;
}

export async function uploadMaterial(lecturerId, courseId, file) {
  const course = await db('courses').where({ id: courseId, lecturer_id: lecturerId }).first();
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
  return { ...row, url: publicUrlFor(row.storage_path) };
}

export async function createLectureUpdate(lecturerId, { timetableSlotId, date, status, note }) {
  const slot = await db('timetable_slots')
    .join('courses', 'courses.id', 'timetable_slots.course_id')
    .where('timetable_slots.id', timetableSlotId)
    .andWhere('courses.lecturer_id', lecturerId)
    .first('timetable_slots.id', 'courses.code as course_code', 'courses.title as course_title', 'courses.university_id as university_id');
  if (!slot) return null;

  const [row] = await db('lecture_updates').insert({
    timetable_slot_id: timetableSlotId, date, status, note, updated_by: lecturerId,
  }).returning('*');

  // Rule engine: a cancelled/moved lecture alerts that university's students.
  if (status === 'cancelled' || status === 'moved') {
    const verb = status === 'cancelled' ? 'cancelled' : 'rescheduled';
    const studentIds = await notificationService.activeStudentIds(slot.university_id);
    await notificationService.notifyUsers(studentIds, {
      title: `Lecture ${verb}: ${slot.course_code}`,
      body: `${slot.course_title} on ${date} has been ${verb}.${note ? ` ${note}` : ''}`,
      type: 'lecture',
      deepLink: '/timetable',
    });
  }
  return row;
}

export async function createTimetableChangeRequest(lecturerId, { courseId, message }) {
  const course = await db('courses').where({ id: courseId, lecturer_id: lecturerId }).first();
  if (!course) return null;

  const [row] = await db('timetable_change_requests').insert({
    course_id: courseId, lecturer_id: lecturerId, message,
  }).returning('*');
  return row;
}

export async function listMyTimetableChangeRequests(lecturerId) {
  return db('timetable_change_requests').where({ lecturer_id: lecturerId }).orderBy('created_at', 'desc');
}
