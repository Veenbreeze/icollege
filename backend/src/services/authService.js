import bcrypt from 'bcryptjs';
import { db } from '../db/pool.js';
import { HttpError } from '../middleware/errorHandler.js';
import { signAccessToken, generateRefreshToken, hashToken, generateResetCode } from '../utils/jwt.js';
import { signedMediaUrl } from '../middleware/upload.js';
import { sendMail, isMailerConfigured } from '../utils/mailer.js';

const USERNAME_FORMAT = /^[a-z0-9_]{3,20}$/;

export function toPublicUser(user, viewerId = user.id) {
  return {
    id: user.id,
    studentId: user.student_id,
    username: user.username,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    year: user.year,
    programme: user.programme,
    universityId: user.university_id,
    universitySlug: user.university_slug,
    universityName: user.university_name,
    campusName: user.campus_name,
    departmentName: user.department_name,
    programmeName: user.programme_name,
    campusId: user.campus_id,
    departmentId: user.department_id,
    programmeId: user.programme_id,
    studentYear: user.student_year ?? user.year,
    avatarUrl: user.avatar_url ? signedMediaUrl('avatar', user.id, viewerId) : null,
    successScore: user.success_score,
    role: user.role,
    status: user.status,
  };
}

async function getEnrichedUser(connection, id) {
  return connection('users').join('universities', 'universities.id', 'users.university_id')
    .leftJoin('campuses', 'campuses.id', 'users.campus_id')
    .leftJoin('departments', 'departments.id', 'users.department_id')
    .leftJoin('programmes', 'programmes.id', 'users.programme_id')
    .where('users.id', id).select('users.*', 'universities.slug as university_slug', 'universities.name as university_name',
      'campuses.name as campus_name', 'departments.name as department_name', 'programmes.name as programme_name').first();
}

export async function listUniversities() {
  return db('universities').where({ status: 'active' }).select('id', 'slug', 'name').orderBy('name');
}

export async function updateProfile(userId, { fullName, username, email, phone }) {
  const patch = {};
  if (fullName !== undefined && fullName.trim()) patch.full_name = fullName.trim();
  if (email !== undefined) patch.email = email.trim() || null;
  if (phone !== undefined) patch.phone = phone.trim() || null;
  if (username !== undefined) {
    const clean = username.trim().toLowerCase();
    if (clean && !USERNAME_FORMAT.test(clean)) {
      throw new HttpError(400, 'Username must be 3-20 characters: letters, numbers and underscores only');
    }
    patch.username = clean || null;
  }

  if (Object.keys(patch).length === 0) {
    return toPublicUser(await getEnrichedUser(db, userId));
  }

  try {
    await db('users').where({ id: userId }).update(patch);
    return toPublicUser(await getEnrichedUser(db, userId));
  } catch (e) {
    if (e.code === '23505') throw new HttpError(409, 'That username is already taken');
    throw e;
  }
}

export async function updateAvatar(userId, avatarPath) {
  await db('users').where({ id: userId }).update({ avatar_url: avatarPath });
  return toPublicUser(await getEnrichedUser(db, userId));
}

export async function login(studentId, password, universitySlug) {
  if (typeof studentId !== 'string' || typeof password !== 'string' || studentId.length > 80 || password.length > 128) {
    throw new HttpError(400, 'Student ID or password is invalid');
  }
  if (universitySlug !== undefined && universitySlug !== null && (typeof universitySlug !== 'string' || universitySlug.length > 50)) throw new HttpError(400, 'University is invalid');
  studentId = studentId.trim();
  let query = db('users').join('universities', 'universities.id', 'users.university_id')
    .select('users.*', 'universities.slug as university_slug', 'universities.name as university_name')
    .where('users.student_id', studentId).andWhere('universities.status', 'active');
  if (universitySlug) query = query.andWhere('universities.slug', universitySlug);
  const matches = await query;
  if (matches.length === 0) throw new HttpError(401, 'Invalid ID or password');

  // Student/staff IDs are unique within an institution, not nationally. When
  // the login form omits institution selection, use the password to resolve
  // the account rather than asking the frontend to choose a university.
  const validUsers = [];
  for (const candidate of matches) {
    if (await bcrypt.compare(password, candidate.password_hash)) validUsers.push(candidate);
  }
  if (validUsers.length === 0) throw new HttpError(401, 'Invalid ID or password');
  if (validUsers.length > 1) {
    throw new HttpError(409, 'These credentials match more than one account. Contact your institution administrator.');
  }
  const user = validUsers[0];

  if (user.status === 'pending') throw new HttpError(403, 'Your account is awaiting admin approval');
  if (user.status === 'suspended') throw new HttpError(403, 'Your account has been suspended');

  return issueSession(user);
}

export async function signup({ studentId, password, fullName, email, universitySlug, campusId, departmentId, programmeId, studentYear }) {
  if (typeof studentId !== 'string' || studentId.length > 80) throw new HttpError(400, 'Student ID is invalid');
  if (typeof password !== 'string' || password.length < 8 || password.length > 128) throw new HttpError(400, 'Password must be 8-128 characters');
  if (typeof fullName !== 'string' || fullName.trim().length < 2 || fullName.trim().length > 160) throw new HttpError(400, 'Full name is invalid');
  if (typeof universitySlug !== 'string' || universitySlug.length > 50) throw new HttpError(400, 'Choose an active university');
  if (email !== undefined && email !== null && (typeof email !== 'string' || email.length > 254)) throw new HttpError(400, 'Email is invalid');
  const university = await db('universities').where({ slug: universitySlug, status: 'active' }).first();
  if (!university) throw new HttpError(400, 'Choose an active university');
  const cleanStudentId = studentId.trim();
  if (cleanStudentId.length < 3 || cleanStudentId.length > 80) throw new HttpError(400, 'Student ID length is invalid');
  for (const [label, value] of [['Campus', campusId], ['Department', departmentId], ['Programme', programmeId]]) {
    if (value !== undefined && value !== null && value !== '' && (!Number.isSafeInteger(Number(value)) || Number(value) <= 0)) throw new HttpError(400, `${label} is invalid`);
  }
  campusId = campusId ? Number(campusId) : null;
  departmentId = departmentId ? Number(departmentId) : null;
  programmeId = programmeId ? Number(programmeId) : null;
  if (studentYear !== undefined && studentYear !== null && String(studentYear).trim().length > 32) throw new HttpError(400, 'Student year is invalid');
  const existing = await db('users').where({ student_id: cleanStudentId, university_id: university.id }).first();
  if (existing) throw new HttpError(409, 'That student/staff ID is already registered');

  // Placement identifiers are accepted only when they belong to the selected
  // institution. Enrollment verification with an SIS is an institution-specific integration.
  if (campusId && !(await db('campuses').where({ id: campusId, university_id: university.id }).first())) throw new HttpError(400, 'Campus does not belong to this university');
  if (departmentId && !(await db('departments').where({ id: departmentId, university_id: university.id }).first())) throw new HttpError(400, 'Department does not belong to this university');
  if (programmeId) {
    const programme = await db('programmes').where({ id: programmeId, university_id: university.id }).first('id', 'department_id');
    if (!programme) throw new HttpError(400, 'Programme does not belong to this university');
    if (programme.department_id && departmentId && programme.department_id !== departmentId) throw new HttpError(400, 'Programme does not belong to this department');
    if (programme.department_id && !departmentId) departmentId = programme.department_id;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const [user] = await db('users').insert({
    student_id: cleanStudentId, password_hash: passwordHash, full_name: fullName.trim(), email: email?.trim() || null,
    role: 'student', status: 'pending', university_id: university.id, campus_id: campusId || null,
    department_id: departmentId || null, programme_id: programmeId || null, student_year: studentYear || null,
  }).returning('*');
  return { pending: true, message: 'Your account is awaiting university verification.', userId: user.id };
}

async function issueSession(user, connection = db) {
  const { token: refreshToken, tokenHash, expiresAt } = generateRefreshToken();
  await connection('refresh_tokens').insert({ user_id: user.id, token_hash: tokenHash, expires_at: expiresAt });
  const enrichedUser = await getEnrichedUser(connection, user.id);
  return { accessToken: signAccessToken(enrichedUser), refreshToken, user: toPublicUser(enrichedUser) };
}

export async function refresh(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  return db.transaction(async (trx) => {
    const row = await trx('refresh_tokens').where({ token_hash: tokenHash }).whereNull('revoked_at').first();
    if (!row || new Date(row.expires_at) < new Date()) throw new HttpError(401, 'Invalid or expired refresh token');
    const [claimed] = await trx('refresh_tokens').where({ id: row.id }).whereNull('revoked_at').update({ revoked_at: trx.fn.now() }).returning('user_id');
    if (!claimed) throw new HttpError(401, 'Invalid or expired refresh token');
    const user = await trx('users').join('universities', 'universities.id', 'users.university_id')
      .where({ 'users.id': claimed.user_id, 'users.status': 'active', 'universities.status': 'active' })
      .select('users.*').first();
    if (!user) throw new HttpError(401, 'Invalid refresh token');
    return issueSession(user, trx);
  });
}

export async function logout(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  await db('refresh_tokens').where({ token_hash: tokenHash }).update({ revoked_at: db.fn.now() });
}

async function resolveAccountByStudentId(studentId, universitySlug) {
  let query = db('users').join('universities', 'universities.id', 'users.university_id').where('users.student_id', studentId)
    .select('users.*');
  if (universitySlug) query = query.andWhere('universities.slug', universitySlug);
  const rows = await query;
  if (rows.length > 1) throw new HttpError(400, 'Select your university to continue');
  return rows[0] ?? null;
}

export async function forgotPassword(studentId, universitySlug) {
  if (typeof studentId !== 'string' || studentId.length > 80) throw new HttpError(400, 'Student ID is invalid');
  studentId = studentId.trim();
  if (universitySlug !== undefined && universitySlug !== null && (typeof universitySlug !== 'string' || universitySlug.length > 50)) throw new HttpError(400, 'University is invalid');
  const user = await resolveAccountByStudentId(studentId, universitySlug);
  // Always behave the same way whether or not the account exists, so login
  // enumeration isn't possible via this endpoint's response shape.
  if (!user) return { devCode: null };

  const { code, codeHash, expiresAt } = generateResetCode();
  await db('password_reset_tokens').insert({ user_id: user.id, code_hash: codeHash, expires_at: expiresAt });

  if (isMailerConfigured && user.email) {
    await sendMail({
      to: user.email,
      subject: 'Your iCollege password reset code',
      text: `Your password reset code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
    });
    return { devCode: null };
  }

  // No email is configured — surface the code directly outside production so
  // the reset flow stays testable end to end without a mail provider.
  return { devCode: process.env.NODE_ENV === 'production' ? null : code };
}

export async function resetPassword(studentId, code, newPassword, universitySlug) {
  if (typeof studentId !== 'string' || typeof code !== 'string' || studentId.length > 80 || !/^\d{6}$/.test(code)) throw new HttpError(400, 'Invalid code or student ID');
  if (universitySlug !== undefined && universitySlug !== null && (typeof universitySlug !== 'string' || universitySlug.length > 50)) throw new HttpError(400, 'University is invalid');
  studentId = studentId.trim();
  if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 128) throw new HttpError(400, 'Password must be 8-128 characters');
  const user = await resolveAccountByStudentId(studentId, universitySlug);
  if (!user) throw new HttpError(400, 'Invalid code or student ID');

  const codeHash = hashToken(code);
  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.transaction(async (trx) => {
    const row = await trx('password_reset_tokens').where({ user_id: user.id, code_hash: codeHash })
      .whereNull('used_at').where('expires_at', '>', trx.fn.now()).orderBy('created_at', 'desc').forUpdate().first('id');
    if (!row) throw new HttpError(400, 'Invalid or expired code');
    const [used] = await trx('password_reset_tokens').where({ id: row.id }).whereNull('used_at')
      .update({ used_at: trx.fn.now() }).returning('id');
    if (!used) throw new HttpError(400, 'Invalid or expired code');
    await trx('users').where({ id: user.id }).update({ password_hash: passwordHash });
    await trx('refresh_tokens').where({ user_id: user.id }).whereNull('revoked_at').update({ revoked_at: trx.fn.now() });
  });
}
