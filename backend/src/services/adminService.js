import { db } from '../db/pool.js';
import { toPublicUser } from './authService.js';
import { ROLES } from '../utils/roles.js';
import * as notificationService from './academicNotificationService.js';

// A university_admin passes their universityId (scoped); platform_admin passes null (all).
export async function listUsers({ status, role, universityId } = {}) {
  let query = db('users').select('*').orderBy('created_at', 'desc');
  if (status) query = query.where({ status });
  if (role) query = query.where({ role });
  if (universityId) query = query.where({ university_id: universityId });
  const rows = await query;
  return rows.map(toPublicUser);
}

export async function updateUserStatus(userId, status, actorUniversityId) {
  if (!['pending', 'active', 'suspended'].includes(status)) return null;
  const target = await db('users').where({ id: userId }).first();
  if (!target) return null;
  // A university_admin may only act on users in their own university.
  if (actorUniversityId && target.university_id !== actorUniversityId) return null;
  const [row] = await db('users').where({ id: userId }).update({ status }).returning('*');
  return row ? toPublicUser(row) : null;
}

export async function updateUserRole(userId, role) {
  if (!ROLES.includes(role)) return null;
  const [row] = await db('users').where({ id: userId }).update({ role }).returning('*');
  return row ? toPublicUser(row) : null;
}

/* ---- courses / timetable / exams / notices (shared with lecturerService reads) ---- */

export async function listCourses(universityId) {
  const q = db('courses').leftJoin('users', 'users.id', 'courses.lecturer_id')
    .select('courses.*', 'users.full_name as assigned_lecturer_name')
    .orderBy('courses.code');
  // university_admin sees only their university; platform_admin (no universityId) sees all.
  if (universityId) q.where('courses.university_id', universityId);
  return q;
}

export async function createCourse(data, universityId) {
  const [row] = await db('courses').insert({
    code: data.code, title: data.title, lecturer_name: data.lecturerName, icon: data.icon, color_key: data.colorKey,
    university_id: universityId ?? null,
  }).returning('*');
  return row;
}

// `actorUniversityId` set (university_admin) restricts the action to that university's rows.
const ownScope = (actorUniversityId) => (q) => {
  if (actorUniversityId) q.andWhere({ university_id: actorUniversityId });
};

export async function updateCourse(id, data, actorUniversityId) {
  const patch = {};
  if (data.code !== undefined) patch.code = data.code;
  if (data.title !== undefined) patch.title = data.title;
  if (data.lecturerName !== undefined) patch.lecturer_name = data.lecturerName;
  if (data.icon !== undefined) patch.icon = data.icon;
  if (data.colorKey !== undefined) patch.color_key = data.colorKey;
  const [row] = await db('courses').where({ id }).modify(ownScope(actorUniversityId)).update(patch).returning('*');
  return row ?? null;
}

export async function deleteCourse(id, actorUniversityId) {
  const count = await db('courses').where({ id }).modify(ownScope(actorUniversityId)).del();
  return count > 0;
}

export async function assignCourseLecturer(courseId, lecturerId) {
  const lecturer = await db('users').where({ id: lecturerId, role: 'lecturer' }).first();
  if (!lecturer) return null;
  const [row] = await db('courses').where({ id: courseId }).update({ lecturer_id: lecturerId, lecturer_name: lecturer.full_name }).returning('*');
  return row ?? null;
}

export async function createTimetableSlot(data) {
  const [row] = await db('timetable_slots').insert({
    course_id: data.courseId, day_of_week: data.dayOfWeek, start_time: data.startTime, end_time: data.endTime, room: data.room, type: data.type || 'Lecture',
  }).returning('*');
  return row;
}

export async function updateTimetableSlot(id, data) {
  const patch = {};
  if (data.dayOfWeek !== undefined) patch.day_of_week = data.dayOfWeek;
  if (data.startTime !== undefined) patch.start_time = data.startTime;
  if (data.endTime !== undefined) patch.end_time = data.endTime;
  if (data.room !== undefined) patch.room = data.room;
  if (data.type !== undefined) patch.type = data.type;
  const [row] = await db('timetable_slots').where({ id }).update(patch).returning('*');
  return row ?? null;
}

export async function deleteTimetableSlot(id) {
  const count = await db('timetable_slots').where({ id }).del();
  return count > 0;
}

export async function createExam(data) {
  const [row] = await db('exams').insert({
    course_id: data.courseId, type: data.type || 'Final', exam_date: data.examDate, exam_time: data.examTime, duration: data.duration, venue: data.venue, room: data.room,
  }).returning('*');
  return row;
}

export async function updateExam(id, data) {
  const patch = {};
  if (data.type !== undefined) patch.type = data.type;
  if (data.examDate !== undefined) patch.exam_date = data.examDate;
  if (data.examTime !== undefined) patch.exam_time = data.examTime;
  if (data.duration !== undefined) patch.duration = data.duration;
  if (data.venue !== undefined) patch.venue = data.venue;
  if (data.room !== undefined) patch.room = data.room;
  const [row] = await db('exams').where({ id }).update(patch).returning('*');
  return row ?? null;
}

export async function deleteExam(id) {
  const count = await db('exams').where({ id }).del();
  return count > 0;
}

/** Auto-assigns sequential seats (row of 10) to every student for an exam's course. */
export async function generateExamSeating(examId, actorUniversityId) {
  const exam = await db('exams')
    .join('courses', 'courses.id', 'exams.course_id')
    .where('exams.id', examId)
    .first('exams.id', 'courses.university_id as university_id');
  if (!exam) return null;
  // Guard: a university_admin can only seat their own university's exams.
  if (actorUniversityId && exam.university_id !== actorUniversityId) return null;

  // Seat only the students of THIS exam's university (not every student on the platform).
  const students = await db('users')
    .where({ role: 'student', status: 'active' })
    .modify((q) => { if (exam.university_id) q.andWhere({ university_id: exam.university_id }); })
    .orderBy('student_id')
    .select('id');
  await db('exam_seats').where({ exam_id: examId }).del();

  const seats = students.map((s, idx) => {
    const row = Math.floor(idx / 10) + 1;
    const col = (idx % 10) + 1;
    return { exam_id: examId, user_id: s.id, seat_row: row, seat_col: col, seat_label: `R${row} · S${col}` };
  });
  if (seats.length) await db('exam_seats').insert(seats);
  return { assigned: seats.length };
}

export async function createNotice(data, universityId) {
  // platform_admin (no university) publishes nationally; university_admin scopes to theirs.
  const scope = universityId ? 'university' : 'national';
  const [row] = await db('notices').insert({
    title: data.title, body: data.body, category: data.category, priority: data.priority || 'Normal', icon: data.icon, color_key: data.colorKey,
    university_id: universityId ?? null, scope,
  }).returning('*');
  // Rule engine: alert the students who can actually see this notice.
  const studentIds = await notificationService.activeStudentIds(scope === 'national' ? null : universityId);
  await notificationService.notifyUsers(studentIds, {
    title: `New notice: ${row.title}`,
    body: row.body,
    type: 'notice',
    deepLink: '/notices',
  });
  return row;
}

export async function updateNotice(id, data, actorUniversityId) {
  const patch = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.body !== undefined) patch.body = data.body;
  if (data.category !== undefined) patch.category = data.category;
  if (data.priority !== undefined) patch.priority = data.priority;
  const [row] = await db('notices').where({ id }).modify(ownScope(actorUniversityId)).update(patch).returning('*');
  return row ?? null;
}

export async function deleteNotice(id, actorUniversityId) {
  const count = await db('notices').where({ id }).modify(ownScope(actorUniversityId)).del();
  return count > 0;
}

/* ---- clubs / companies / timetable change requests ---- */

export async function assignClubOwner(clubId, ownerId) {
  const owner = await db('users').where({ id: ownerId, role: 'club_admin' }).first();
  if (!owner) return null;
  const [row] = await db('clubs').where({ id: clubId }).update({ owner_id: ownerId }).returning('*');
  return row ?? null;
}

export async function verifyCompany(companyId, verified) {
  const [row] = await db('companies').where({ id: companyId }).update({ verified: !!verified }).returning('*');
  return row ?? null;
}

export async function listTimetableChangeRequests(status, universityId) {
  let query = db('timetable_change_requests')
    .join('courses', 'courses.id', 'timetable_change_requests.course_id')
    .join('users', 'users.id', 'timetable_change_requests.lecturer_id')
    .select('timetable_change_requests.*', 'courses.code as course_code', 'courses.title as course_title', 'users.full_name as lecturer_name')
    .orderBy('timetable_change_requests.created_at', 'desc');
  if (status) query = query.where('timetable_change_requests.status', status);
  if (universityId) query = query.andWhere('courses.university_id', universityId); // tenant scope
  return query;
}

export async function resolveTimetableChangeRequest(id, status, adminNote, actorUniversityId) {
  if (!['approved', 'rejected'].includes(status)) return null;
  // Guard: a university_admin can only resolve requests for their university's courses.
  if (actorUniversityId) {
    const owns = await db('timetable_change_requests')
      .join('courses', 'courses.id', 'timetable_change_requests.course_id')
      .where('timetable_change_requests.id', id)
      .andWhere('courses.university_id', actorUniversityId)
      .first('timetable_change_requests.id');
    if (!owns) return null;
  }
  const [row] = await db('timetable_change_requests').where({ id }).update({ status, admin_note: adminNote }).returning('*');
  return row ?? null;
}

/* ---- stats / settings ---- */

export async function getStats(universityId) {
  // Scope user counts to the admin's university (platform_admin: universityId null → all).
  const scopeUsers = (q) => (universityId ? q.where({ university_id: universityId }) : q);
  const [usersByRole, usersByStatus, [{ count: posts }], [{ count: clubs }], [{ count: opportunities }], [{ count: pending }]] = await Promise.all([
    scopeUsers(db('users').select('role').count('* as count').groupBy('role')),
    scopeUsers(db('users').select('status').count('* as count').groupBy('status')),
    db('posts').count('* as count'),
    db('clubs').count('* as count'),
    db('opportunities').count('* as count'),
    scopeUsers(db('users').where({ status: 'pending' }).count('* as count')),
  ]);

  return {
    usersByRole: Object.fromEntries(usersByRole.map((r) => [r.role, Number(r.count)])),
    usersByStatus: Object.fromEntries(usersByStatus.map((r) => [r.status, Number(r.count)])),
    postsCount: Number(posts),
    clubsCount: Number(clubs),
    opportunitiesCount: Number(opportunities),
    pendingApprovals: Number(pending),
  };
}

export async function getSettings() {
  const row = await db('platform_settings').orderBy('id').first();
  if (!row) return null;
  return {
    institutionName: row.institution_name,
    subscriptionPlan: row.subscription_plan,
    subscriptionStatus: row.subscription_status,
    updatedAt: row.updated_at,
  };
}

export async function updateSettings(updatedBy, data) {
  const patch = { updated_by: updatedBy, updated_at: db.fn.now() };
  if (data.institutionName !== undefined) patch.institution_name = data.institutionName;
  if (data.subscriptionPlan !== undefined) patch.subscription_plan = data.subscriptionPlan;
  if (data.subscriptionStatus !== undefined) patch.subscription_status = data.subscriptionStatus;

  const existing = await db('platform_settings').orderBy('id').first('id');
  if (!existing) {
    await db('platform_settings').insert(patch);
  } else {
    await db('platform_settings').where({ id: existing.id }).update(patch);
  }
  return getSettings();
}
