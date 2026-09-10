import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

const ACCESS_TOKEN_TTL = '15m';
const REFRESH_TOKEN_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export function signAccessToken(user) {
  return jwt.sign({ sub: user.id, studentId: user.student_id, role: user.role }, env.jwtAccessSecret, {
    expiresIn: ACCESS_TOKEN_TTL,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtAccessSecret);
}

export function generateRefreshToken() {
  const token = crypto.randomBytes(48).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_TTL_MS);
  return { token, tokenHash, expiresAt };
}

export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export function generateResetCode() {
  const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
  const codeHash = hashToken(code);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  return { code, codeHash, expiresAt };
}
