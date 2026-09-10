import bcrypt from 'bcryptjs';
import { db } from '../db/pool.js';
import { HttpError } from '../middleware/errorHandler.js';
import { signAccessToken, generateRefreshToken, hashToken, generateResetCode } from '../utils/jwt.js';
import { ROLES } from '../utils/roles.js';
import { publicUrlFor } from '../middleware/upload.js';
import { sendMail, isMailerConfigured } from '../utils/mailer.js';

const USERNAME_FORMAT = /^[a-z0-9_]{3,20}$/;

export function toPublicUser(user) {
  return {
    id: user.id,
    studentId: user.student_id,
    username: user.username,
    fullName: user.full_name,
    email: user.email,
    phone: user.phone,
    year: user.year,
    programme: user.programme,
    avatarUrl: user.avatar_url ? publicUrlFor(user.avatar_url) : null,
    successScore: user.success_score,
    role: user.role,
    status: user.status,
  };
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
    return toPublicUser(await db('users').where({ id: userId }).first());
  }

  try {
    const [row] = await db('users').where({ id: userId }).update(patch).returning('*');
    return toPublicUser(row);
  } catch (e) {
    if (e.code === '23505') throw new HttpError(409, 'That username is already taken');
    throw e;
  }
}

export async function updateAvatar(userId, avatarPath) {
  const [row] = await db('users').where({ id: userId }).update({ avatar_url: avatarPath }).returning('*');
  return toPublicUser(row);
}

export async function login(studentId, password) {
  const user = await db('users').where({ student_id: studentId }).first();
  if (!user) throw new HttpError(401, 'Invalid student ID or password');

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new HttpError(401, 'Invalid student ID or password');

  if (user.status === 'pending') throw new HttpError(403, 'Your account is awaiting admin approval');
  if (user.status === 'suspended') throw new HttpError(403, 'Your account has been suspended');

  return issueSession(user);
}

export async function signup({ studentId, password, fullName, email, role, companyName }) {
  if (password.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');

  const requestedRole = ROLES.includes(role) ? role : 'student';
  const existing = await db('users').where({ student_id: studentId }).first();
  if (existing) throw new HttpError(409, 'That student/staff ID is already registered');

  const passwordHash = await bcrypt.hash(password, 10);

  if (requestedRole === 'student') {
    const [user] = await db('users')
      .insert({ student_id: studentId, password_hash: passwordHash, full_name: fullName, email, role: 'student', status: 'active' })
      .returning('*');
    return { pending: false, ...(await issueSession(user)) };
  }

  const result = await db.transaction(async (trx) => {
    let companyId = null;
    if (requestedRole === 'employer' && companyName) {
      const slug = companyName.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `company-${Date.now()}`;
      const [company] = await trx('companies').insert({ name: companyName, slug, verified: false }).returning('id');
      companyId = company.id;
    }

    const [user] = await trx('users')
      .insert({ student_id: studentId, password_hash: passwordHash, full_name: fullName, email, role: requestedRole, status: 'pending', company_id: companyId })
      .returning('id');

    if (companyId) await trx('companies').where({ id: companyId }).update({ created_by: user.id });

    return user;
  });

  return { pending: true, message: 'Your account was created and is awaiting admin approval.', userId: result.id };
}

async function issueSession(user) {
  const accessToken = signAccessToken(user);
  const { token: refreshToken, tokenHash, expiresAt } = generateRefreshToken();
  await db('refresh_tokens').insert({ user_id: user.id, token_hash: tokenHash, expires_at: expiresAt });
  return { accessToken, refreshToken, user: toPublicUser(user) };
}

export async function refresh(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  const row = await db('refresh_tokens').where({ token_hash: tokenHash }).whereNull('revoked_at').first();
  if (!row || new Date(row.expires_at) < new Date()) {
    throw new HttpError(401, 'Invalid or expired refresh token');
  }

  const user = await db('users').where({ id: row.user_id }).first();
  if (!user) throw new HttpError(401, 'Invalid refresh token');

  await db('refresh_tokens').where({ id: row.id }).update({ revoked_at: db.fn.now() });
  return issueSession(user);
}

export async function logout(refreshToken) {
  const tokenHash = hashToken(refreshToken);
  await db('refresh_tokens').where({ token_hash: tokenHash }).update({ revoked_at: db.fn.now() });
}

export async function forgotPassword(studentId) {
  const user = await db('users').where({ student_id: studentId }).first();
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

export async function resetPassword(studentId, code, newPassword) {
  const user = await db('users').where({ student_id: studentId }).first();
  if (!user) throw new HttpError(400, 'Invalid code or student ID');

  const codeHash = hashToken(code);
  const row = await db('password_reset_tokens')
    .where({ user_id: user.id, code_hash: codeHash })
    .whereNull('used_at')
    .orderBy('created_at', 'desc')
    .first();

  if (!row || new Date(row.expires_at) < new Date()) {
    throw new HttpError(400, 'Invalid or expired code');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await db.transaction(async (trx) => {
    await trx('users').where({ id: user.id }).update({ password_hash: passwordHash });
    await trx('password_reset_tokens').where({ id: row.id }).update({ used_at: trx.fn.now() });
    await trx('refresh_tokens').where({ user_id: user.id }).whereNull('revoked_at').update({ revoked_at: trx.fn.now() });
  });
}
