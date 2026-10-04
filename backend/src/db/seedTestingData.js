import bcrypt from 'bcryptjs';
import { db } from './pool.js';
import { env } from '../config/env.js';

const institutions = [
  { slug: 'icu-test', name: 'iCollege Test University', department: 'Computing (Test)', programme: 'BSc Computing (Test)', adminId: 'ADMIN/TEST', studentName: 'Test Student ICU', campusCode: 'ICU-TEST', password: 'Testing123!' },
  { slug: 'aru-test', name: 'Ardhi Test University', department: 'Built Environment (Test)', programme: 'BSc Planning (Test)', adminId: 'ADMIN/TEST', studentName: 'Test Student ARU', campusCode: 'ARU-TEST', password: 'Testing456!' },
];

async function ensureTenant(connection, { slug, name }) {
  let row = await connection('universities').where({ slug }).first('id', 'name', 'status');
  if (!row) [row] = await connection('universities').insert({ slug, name, status: 'active' }).returning(['id', 'name', 'status']);
  if (row.name !== name || row.status !== 'active') throw new Error(`Refusing to change existing university ${slug}; verify it manually before testing.`);
  return row.id;
}

async function seed() {
  if (env.isProduction) throw new Error('Test fixtures are disabled when NODE_ENV=production.');
  const result = [];
  await db.transaction(async (trx) => {
    for (const institution of institutions) {
      const passwordHash = await bcrypt.hash(institution.password, 10);
      const universityId = await ensureTenant(trx, { slug: institution.slug, name: institution.name });
      const [campus] = await trx('campuses').insert({ university_id: universityId, name: 'Main Test Campus', code: institution.campusCode })
        .onConflict(['university_id', 'name']).merge({ code: institution.campusCode }).returning('id');
      const campusId = campus?.id ?? (await trx('campuses').where({ university_id: universityId, name: 'Main Test Campus' }).first('id')).id;
      const [department] = await trx('departments').insert({ university_id: universityId, name: institution.department, code: 'TEST' })
        .onConflict(['university_id', 'name']).merge({ code: 'TEST' }).returning('id');
      const departmentId = department?.id ?? (await trx('departments').where({ university_id: universityId, name: institution.department }).first('id')).id;
      const [programme] = await trx('programmes').insert({ university_id: universityId, department_id: departmentId, name: institution.programme, code: 'TEST-BSC' })
        .onConflict(['university_id', 'name']).merge({ department_id: departmentId, code: 'TEST-BSC' }).returning('id');
      const programmeId = programme?.id ?? (await trx('programmes').where({ university_id: universityId, name: institution.programme }).first('id')).id;
      const [course] = await trx('courses').insert({ university_id: universityId, department_id: departmentId, programme_id: programmeId, code: 'TEST101', title: 'Introduction to Testing', lecturer_name: 'Demo Lecturer', icon: 'flask', color_key: 'primary' })
        .onConflict(['university_id', 'code']).merge({ title: 'Introduction to Testing', department_id: departmentId, programme_id: programmeId }).returning('id');
      const courseId = course?.id ?? (await trx('courses').where({ university_id: universityId, code: 'TEST101' }).first('id')).id;

      const lecturerStudentId = 'LECTURER/TEST';
      const lecturerName = `${institution.slug.toUpperCase()} Demo Lecturer`;
      const accounts = [
        { student_id: institution.adminId, full_name: `${institution.slug.toUpperCase()} Test Admin`, email: `admin@${institution.slug}.test`, role: 'university_admin', status: 'active', campus_id: campusId },
        { student_id: lecturerStudentId, full_name: lecturerName, email: `lecturer@${institution.slug}.test`, role: 'lecturer', status: 'active', campus_id: campusId, department_id: departmentId },
        { student_id: 'TEST/SHARED/0001', full_name: institution.studentName, email: `student@${institution.slug}.test`, role: 'student', status: 'active', campus_id: campusId, department_id: departmentId, programme_id: programmeId, year: 'Year 1', student_year: 'Year 1' },
      ];
      const ids = {};
      for (const account of accounts) {
        const [user] = await trx('users').insert({ university_id: universityId, password_hash: passwordHash, success_score: 0, ...account })
          .onConflict(['university_id', 'student_id']).merge({
            password_hash: passwordHash, full_name: account.full_name, email: account.email,
            role: account.role, status: account.status, campus_id: account.campus_id,
            department_id: account.department_id ?? null, programme_id: account.programme_id ?? null,
            year: account.year ?? null, student_year: account.student_year ?? null,
          }).returning('id');
        ids[account.role] = user?.id ?? (await trx('users').where({ university_id: universityId, student_id: account.student_id }).first('id')).id;
      }
      await trx('courses').where({ id: courseId, university_id: universityId }).update({ lecturer_id: ids.lecturer, lecturer_name: lecturerName });
      const chamberFixtures = [
        { slug: `${institution.slug}-computing`, name: 'Computing Test Chamber', visibility: 'department', department_id: departmentId, tagline: 'Discuss study, technology, and projects.', theme_key: 'technology', emoji: '💻' },
        { slug: `${institution.slug}-student-lounge`, name: 'Student Test Lounge', visibility: 'university', department_id: null, tagline: 'Connect with students across campus.', theme_key: 'community', emoji: '🎓' },
      ];
      const chamberIds = {};
      for (const chamber of chamberFixtures) {
        const [row] = await trx('chambers').insert({ university_id: universityId, ...chamber })
          .onConflict('slug').merge({ university_id: universityId, name: chamber.name, visibility: chamber.visibility,
            department_id: chamber.department_id, tagline: chamber.tagline, theme_key: chamber.theme_key, emoji: chamber.emoji }).returning('id');
        chamberIds[chamber.slug] = row?.id ?? (await trx('chambers').where({ slug: chamber.slug, university_id: universityId }).first('id')).id;
      }
      await trx('chamber_members').insert({ chamber_id: chamberIds[chamberFixtures[0].slug], user_id: ids.student, role: 'member' })
        .onConflict(['chamber_id', 'user_id']).ignore();
      await trx('student_course_enrollments').insert({ university_id: universityId, student_id: ids.student, course_id: courseId, academic_year: '2026', term: 'Testing Term', status: 'active' })
        .onConflict().ignore();
      const existingSlot = await trx('timetable_slots').where({ course_id: courseId, day_of_week: 1, start_time: '09:00' }).first('id');
      if (!existingSlot) await trx('timetable_slots').insert({ course_id: courseId, day_of_week: 1, start_time: '09:00', end_time: '10:00', room: 'Test Room 1', type: 'Lecture' });
      const noticeTitle = `${institution.name} test notice`;
      const existingNotice = await trx('notices').where({ university_id: universityId }).whereIn('title', ['Test university notice', noticeTitle]).first('id');
      if (existingNotice) await trx('notices').where({ id: existingNotice.id }).update({ title: noticeTitle, body: `Visible only to ${institution.name}.`, visibility: 'university' });
      else await trx('notices').insert({ university_id: universityId, visibility: 'university', title: noticeTitle, body: `Visible only to ${institution.name}.`, category: 'Testing', priority: 'Normal', icon: 'flask', color_key: 'primary' });
      const courseNoticeTitle = `${institution.name} lecturer course notice`;
      const existingCourseNotice = await trx('notices').where({ university_id: universityId, course_id: courseId, title: courseNoticeTitle }).first('id');
      if (!existingCourseNotice) await trx('notices').insert({
        university_id: universityId, visibility: 'course', course_id: courseId,
        title: courseNoticeTitle, body: `Course update from ${lecturerName}, visible to students enrolled in TEST101.`,
        category: 'Course: TEST101', priority: 'Normal', icon: 'megaphone-outline', color_key: 'primary',
      });
      result.push({ university: institution.slug, universityId, adminId: ids.university_admin, lecturerId: ids.lecturer, studentId: ids.student, chambers: Object.keys(chamberIds) });
    }
  });
  console.log(JSON.stringify({ seeded: true, credentials: institutions.map(({ slug, adminId, password }) => ({ university: slug, studentId: 'TEST/SHARED/0001', universityAdminId: adminId, lecturerId: 'LECTURER/TEST', password })), accounts: result }, null, 2));
}

seed().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(() => db.destroy());
