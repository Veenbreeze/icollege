import { db } from '../db/pool.js';
import { toPublicUser } from './authService.js';
import { ROLES } from '../utils/roles.js';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'node:crypto';

export async function listUsers({ status, role, universityId } = {}) {
  let query = db('users').select('*').orderBy('created_at', 'desc');
  if (universityId) query = query.where({ university_id: universityId });
  if (status) query = query.where({ status });
  if (role) query = query.where({ role });
  const rows = await query;
  return rows.map(toPublicUser);
}

export async function updateStudentAcademicIdentity(studentId, universityId, data) {
  for (const key of ['campusId', 'departmentId', 'programmeId']) {
    const value = data[key];
    if (value !== undefined && value !== null && value !== '' && (!Number.isSafeInteger(Number(value)) || Number(value) <= 0)) return null;
    if (value !== undefined && value !== null && value !== '') data[key] = Number(value);
  }
  const student = await db('users').where({ id: studentId, university_id: universityId, role: 'student' }).first('id');
  if (!student) return null;
  const belongs = async (table, id) => !id || !!(await db(table).where({ id, university_id: universityId }).first('id'));
  if (!(await belongs('campuses', data.campusId)) || !(await belongs('departments', data.departmentId)) || !(await belongs('programmes', data.programmeId))) return null;
  if (data.studentYear !== undefined && (typeof data.studentYear !== 'string' || data.studentYear.trim().length > 32)) return null;
  let programmeDepartmentId;
  if (data.programmeId) {
    const programme = await db('programmes').where({ id: data.programmeId, university_id: universityId }).first('department_id');
    programmeDepartmentId = programme.department_id;
    if (programmeDepartmentId && data.departmentId !== undefined && programmeDepartmentId !== data.departmentId) return null;
    if (programmeDepartmentId && data.departmentId === undefined) data.departmentId = programmeDepartmentId;
  }
  const requestedCourseIds = data.courseIds === undefined ? undefined : (Array.isArray(data.courseIds) ? data.courseIds : null);
  if (requestedCourseIds === null) return null;
  const courseIds = [...new Set((requestedCourseIds ?? []).map(Number))];
  if (courseIds.some((id) => !Number.isSafeInteger(id) || id <= 0)) return null;
  const courses = courseIds.length ? await db('courses').where({ university_id: universityId }).whereIn('id', courseIds).select('id', 'department_id', 'programme_id') : [];
  if (courses.length !== courseIds.length) return null;
  if (data.departmentId && courses.some((c) => c.department_id && c.department_id !== data.departmentId)) return null;
  if (data.programmeId && courses.some((c) => c.programme_id && c.programme_id !== data.programmeId)) return null;
  if (courseIds.length && (!/^\d{4}$/.test(String(data.academicYear || '')) || !String(data.term || '').trim())) return null;
  return db.transaction(async (trx) => {
    const patch = {};
    if (data.campusId !== undefined) patch.campus_id = data.campusId || null;
    if (data.departmentId !== undefined) patch.department_id = data.departmentId || null;
    if (data.programmeId !== undefined) {
      patch.programme_id = data.programmeId || null;
      const programme = data.programmeId ? await trx('programmes').where({ id: data.programmeId }).first('name') : null;
      patch.programme = programme?.name ?? null;
    }
    if (data.studentYear !== undefined) { patch.student_year = String(data.studentYear).trim(); patch.year = patch.student_year; }
    if (Object.keys(patch).length) await trx('users').where({ id: studentId, university_id: universityId }).update(patch);
    if (requestedCourseIds !== undefined) {
      await trx('student_course_enrollments').where({ student_id: studentId, university_id: universityId, status: 'active' }).update({ status: 'inactive' });
      for (const courseId of courseIds) {
        await trx('student_course_enrollments').insert({ university_id: universityId, student_id: studentId, course_id: courseId, academic_year: String(data.academicYear), term: String(data.term).trim(), status: 'active' })
          .onConflict(['student_id', 'course_id', 'academic_year', 'term']).merge({ university_id: universityId, status: 'active' });
      }
    }
    return trx('users').where({ id: studentId }).first().then(toPublicUser);
  });
}

export async function listUniversities() {
  return db('universities').select('id', 'slug', 'name', 'status', 'created_at').orderBy('name');
}

export async function createUniversity({ slug, name }) {
  const cleanSlug = String(slug || '').trim().toLowerCase();
  const cleanName = String(name || '').trim();
  if (!/^[a-z0-9](?:[a-z0-9-]{0,48}[a-z0-9])?$/.test(cleanSlug) || !cleanName || cleanName.length > 160) return null;
  const [row] = await db('universities').insert({ slug: cleanSlug, name: cleanName, status: 'provisioning' }).returning(['id', 'slug', 'name', 'status']);
  return row;
}

export async function updateUniversityStatus(id, status) {
  if (!['provisioning', 'active', 'suspended'].includes(status)) return null;
  const [row] = await db('universities').where({ id }).update({ status }).returning(['id', 'slug', 'name', 'status']);
  return row ?? null;
}

export async function provisionUniversityAdmin(universityId, { studentId, fullName, email }) {
  const university = await db('universities').where({ id: universityId, status: 'active' }).first('id');
  const cleanId = String(studentId || '').trim();
  const cleanName = String(fullName || '').trim();
  const cleanEmail = String(email || '').trim().toLowerCase();
  if (!university || cleanId.length < 3 || cleanId.length > 80 || cleanName.length < 2 || cleanName.length > 160
      || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) || cleanEmail.length > 254) return null;
  const passwordHash = await bcrypt.hash(randomBytes(48).toString('base64url'), 10);
  const [row] = await db('users').insert({
    university_id: universityId, student_id: cleanId, full_name: cleanName, email: cleanEmail,
    password_hash: passwordHash, role: 'university_admin', status: 'pending',
  }).returning('*');
  return toPublicUser(row);
}

export async function updateUniversityUserStatus(userId, universityId, status) {
  if (!['pending', 'active', 'suspended'].includes(status)) return null;
  const [row] = await db('users').where({ id: userId, university_id: universityId, role: 'university_admin' })
    .update({ status }).returning('*');
  return row ? toPublicUser(row) : null;
}

export async function createUniversityUnit(table, universityId, { name, code, departmentId }) {
  if (!['campuses', 'departments', 'programmes'].includes(table)) return null;
  const cleanName = String(name || '').trim();
  const cleanCode = String(code || '').trim() || null;
  if (!cleanName || cleanName.length > 160 || (cleanCode && cleanCode.length > 40)) return null;
  if (!(await db('universities').where({ id: universityId }).first('id'))) return null;
  const values = { university_id: universityId, name: cleanName, code: cleanCode };
  if (table === 'programmes' && departmentId) {
    const dept = await db('departments').where({ id: departmentId, university_id: universityId }).first('id');
    if (!dept) return null;
    values.department_id = departmentId;
  }
  const [row] = await db(table).insert(values).returning('*');
  return row;
}

export async function createUniversityIntegration(universityId, data) {
  const allowedKinds = ['oidc', 'saml', 'sis_api', 'lms_api'];
  const kind = String(data.kind || '');
  if (!allowedKinds.includes(kind) || !(await db('universities').where({ id: universityId }).first('id'))) return null;
  const secretReference = String(data.secretReference || '').trim();
  if (secretReference && !/^[a-zA-Z0-9/_:.@-]{1,200}$/.test(secretReference)) return null;
  const config = {};
  for (const key of ['metadataUrl', 'authorizationUrl', 'tokenUrl', 'userInfoUrl', 'sisBaseUrl', 'userIdClaim', 'emailDomain', 'scopes']) {
    if (data.configuration?.[key] !== undefined) config[key] = data.configuration[key];
  }
  const [row] = await db('university_integrations').insert({
    university_id: universityId, kind, issuer: data.issuer || null, client_id: data.clientId || null,
    secret_reference: secretReference || null, configuration: config, status: 'disabled',
  }).returning(['id', 'university_id', 'kind', 'issuer', 'client_id', 'secret_reference', 'configuration', 'status']);
  return row;
}

export async function updateUserStatus(userId, status, universityId) {
  if (!['pending', 'active', 'suspended'].includes(status)) return null;
  const [row] = await db('users').where({ id: userId, ...(universityId ? { university_id: universityId } : {}) }).update({ status }).returning('*');
  return row ? toPublicUser(row) : null;
}

export async function updateUserRole(userId, role, universityId) {
  // Platform-wide privilege is only established by a controlled bootstrap,
  // never by changing an ordinary account through the routine role API.
  if (!ROLES.includes(role) || role === 'platform_admin') return null;
  const [row] = await db('users').where({ id: userId, ...(universityId ? { university_id: universityId } : {}) }).update({ role }).returning('*');
  return row ? toPublicUser(row) : null;
}

/* ---- courses / timetable / exams / notices (shared with lecturerService reads) ---- */

export async function listCourses(universityId) {
  return db('courses').leftJoin('users', 'users.id', 'courses.lecturer_id').where('courses.university_id', universityId)
    .select('courses.*', 'users.full_name as assigned_lecturer_name')
    .orderBy('courses.code');
}

export async function createCourse(data, universityId) {
  const [row] = await db('courses').insert({
    university_id: universityId, code: data.code, title: data.title, lecturer_name: data.lecturerName, icon: data.icon, color_key: data.colorKey,
  }).returning('*');
  return row;
}

export async function updateCourse(id, data, universityId) {
  const patch = {};
  if (data.code !== undefined) patch.code = data.code;
  if (data.title !== undefined) patch.title = data.title;
  if (data.lecturerName !== undefined) patch.lecturer_name = data.lecturerName;
  if (data.icon !== undefined) patch.icon = data.icon;
  if (data.colorKey !== undefined) patch.color_key = data.colorKey;
  const [row] = await db('courses').where({ id, university_id: universityId }).update(patch).returning('*');
  return row ?? null;
}

export async function deleteCourse(id, universityId) {
  const count = await db('courses').where({ id, university_id: universityId }).del();
  return count > 0;
}

export async function assignCourseLecturer(courseId, lecturerId, universityId) {
  const lecturer = await db('users').where({ id: lecturerId, role: 'lecturer', university_id: universityId }).first();
  if (!lecturer) return null;
  const [row] = await db('courses').where({ id: courseId, university_id: universityId }).update({ lecturer_id: lecturerId, lecturer_name: lecturer.full_name }).returning('*');
  return row ?? null;
}

export async function createTimetableSlot(data, universityId) {
  const course = await db('courses').where({ id: data.courseId, university_id: universityId }).first('id');
  if (!course) return null;
  const [row] = await db('timetable_slots').insert({
    course_id: data.courseId, day_of_week: data.dayOfWeek, start_time: data.startTime, end_time: data.endTime, room: data.room, type: data.type || 'Lecture',
  }).returning('*');
  return row;
}

export async function updateTimetableSlot(id, data, universityId) {
  const patch = {};
  if (data.dayOfWeek !== undefined) patch.day_of_week = data.dayOfWeek;
  if (data.startTime !== undefined) patch.start_time = data.startTime;
  if (data.endTime !== undefined) patch.end_time = data.endTime;
  if (data.room !== undefined) patch.room = data.room;
  if (data.type !== undefined) patch.type = data.type;
  const [row] = await db('timetable_slots').where({ id }).whereIn('course_id', db('courses').select('id').where({ university_id: universityId })).update(patch).returning('*');
  return row ?? null;
}

export async function deleteTimetableSlot(id, universityId) {
  const count = await db('timetable_slots').where({ id }).whereIn('course_id', db('courses').select('id').where({ university_id: universityId })).del();
  return count > 0;
}

export async function createExam(data, universityId) {
  const course = await db('courses').where({ id: data.courseId, university_id: universityId }).first('id');
  if (!course) return null;
  const [row] = await db('exams').insert({
    course_id: data.courseId, type: data.type || 'Final', exam_date: data.examDate, exam_time: data.examTime, duration: data.duration, venue: data.venue, room: data.room,
  }).returning('*');
  return row;
}

export async function updateExam(id, data, universityId) {
  const patch = {};
  if (data.type !== undefined) patch.type = data.type;
  if (data.examDate !== undefined) patch.exam_date = data.examDate;
  if (data.examTime !== undefined) patch.exam_time = data.examTime;
  if (data.duration !== undefined) patch.duration = data.duration;
  if (data.venue !== undefined) patch.venue = data.venue;
  if (data.room !== undefined) patch.room = data.room;
  const [row] = await db('exams').where({ id }).whereIn('course_id', db('courses').select('id').where({ university_id: universityId })).update(patch).returning('*');
  return row ?? null;
}

export async function deleteExam(id, universityId) {
  const count = await db('exams').where({ id }).whereIn('course_id', db('courses').select('id').where({ university_id: universityId })).del();
  return count > 0;
}

/** Auto-assigns sequential seats (row of 10) to every student for an exam's course. */
export async function generateExamSeating(examId, universityId) {
  const exam = await db('exams').join('courses', 'courses.id', 'exams.course_id').where('exams.id', examId).andWhere('courses.university_id', universityId).first('exams.*');
  if (!exam) return null;

  const students = await db('users').join('student_course_enrollments as enrollment', 'enrollment.student_id', 'users.id')
    .where({ 'users.role': 'student', 'users.status': 'active', 'users.university_id': universityId, 'enrollment.university_id': universityId, 'enrollment.course_id': exam.course_id, 'enrollment.status': 'active' })
    .orderBy('users.student_id').select('users.id');
  await db('exam_seats').where({ exam_id: examId }).del();

  const seats = students.map((s, idx) => {
    const row = Math.floor(idx / 10) + 1;
    const col = (idx % 10) + 1;
    return { exam_id: examId, user_id: s.id, seat_row: row, seat_col: col, seat_label: `R${row} · S${col}` };
  });
  if (seats.length) await db('exam_seats').insert(seats);
  return { assigned: seats.length };
}

export async function createNotice(data, universityId, allowNational = false) {
  const visibility = data.visibility || 'university';
  if (!['national', 'university', 'department', 'course'].includes(visibility)) return null;
  if (visibility === 'national' && !allowNational) return null;
  if (visibility === 'department' && !(await db('departments').where({ id: data.departmentId, university_id: universityId }).first('id'))) return null;
  if (visibility === 'course' && !(await db('courses').where({ id: data.courseId, university_id: universityId }).first('id'))) return null;
  const [row] = await db('notices').insert({
    university_id: universityId, visibility, department_id: data.departmentId || null, course_id: data.courseId || null,
    title: data.title, body: data.body, category: data.category, priority: data.priority || 'Normal', icon: data.icon, color_key: data.colorKey,
  }).returning('*');
  return row;
}

export async function updateNotice(id, data, universityId) {
  const patch = {};
  if (data.title !== undefined) patch.title = data.title;
  if (data.body !== undefined) patch.body = data.body;
  if (data.category !== undefined) patch.category = data.category;
  if (data.priority !== undefined) patch.priority = data.priority;
  const [row] = await db('notices').where({ id, university_id: universityId }).update(patch).returning('*');
  return row ?? null;
}

export async function deleteNotice(id, universityId) {
  const count = await db('notices').where({ id, university_id: universityId }).del();
  return count > 0;
}

/* ---- clubs / companies / timetable change requests ---- */

export async function assignClubOwner(clubId, ownerId, universityId) {
  const owner = await db('users').where({ id: ownerId, role: 'club_admin', university_id: universityId }).first();
  if (!owner) return null;
  const [row] = await db('clubs').where({ id: clubId, university_id: universityId }).update({ owner_id: ownerId }).returning('*');
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
    .where('courses.university_id', universityId)
    .select('timetable_change_requests.*', 'courses.code as course_code', 'courses.title as course_title', 'users.full_name as lecturer_name')
    .orderBy('timetable_change_requests.created_at', 'desc');
  if (status) query = query.where('timetable_change_requests.status', status);
  return query;
}

export async function resolveTimetableChangeRequest(id, status, adminNote, universityId) {
  if (!['approved', 'rejected'].includes(status)) return null;
  const [row] = await db('timetable_change_requests').where({ id }).whereIn('course_id', db('courses').select('id').where({ university_id: universityId })).update({ status, admin_note: adminNote }).returning('*');
  return row ?? null;
}

/* ---- stats / settings ---- */

export async function getStats(universityId) {
  const [usersByRole, usersByStatus, [{ count: posts }], [{ count: clubs }], [{ count: opportunities }], [{ count: pending }]] = await Promise.all([
    db('users').where({ university_id: universityId }).select('role').count('* as count').groupBy('role'),
    db('users').where({ university_id: universityId }).select('status').count('* as count').groupBy('status'),
    db('posts').join('chambers', 'chambers.id', 'posts.chamber_id').where('chambers.university_id', universityId).count('* as count'),
    db('clubs').where({ university_id: universityId }).count('* as count'),
    db('opportunities').where({ university_id: universityId }).count('* as count'),
    db('users').where({ status: 'pending', university_id: universityId }).count('* as count'),
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
