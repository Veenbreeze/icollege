import path from 'node:path';
import { Router } from 'express';
import { db } from '../db/pool.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { requireAuth } from '../middleware/auth.js';
import { createUploader } from '../middleware/upload.js';
import { env } from '../config/env.js';
import { HttpError } from '../middleware/errorHandler.js';
import * as authService from '../services/authService.js';

export const authRouter = Router();
const avatarUpload = createUploader('avatars', { maxSizeMb: 8 });

authRouter.post('/signup', asyncHandler(async (req, res) => {
  const { studentId, password, fullName, email, role, companyName } = req.body;
  if (!studentId || !password || !fullName) throw new HttpError(400, 'studentId, password and fullName are required');
  const result = await authService.signup({ studentId, password, fullName, email, role, companyName });
  res.status(201).json(result);
}));

authRouter.post('/login', asyncHandler(async (req, res) => {
  const { studentId, password } = req.body;
  if (!studentId || !password) throw new HttpError(400, 'studentId and password are required');
  const session = await authService.login(studentId, password);
  res.json(session);
}));

authRouter.post('/refresh', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (!refreshToken) throw new HttpError(400, 'refreshToken is required');
  const session = await authService.refresh(refreshToken);
  res.json(session);
}));

authRouter.post('/logout', asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  if (refreshToken) await authService.logout(refreshToken);
  res.status(204).end();
}));

authRouter.post('/forgot-password', asyncHandler(async (req, res) => {
  const { studentId } = req.body;
  if (!studentId) throw new HttpError(400, 'studentId is required');
  const { devCode } = await authService.forgotPassword(studentId);
  res.json({ message: 'If that account exists, a reset code has been sent.', devCode });
}));

authRouter.post('/reset-password', asyncHandler(async (req, res) => {
  const { studentId, code, newPassword } = req.body;
  if (!studentId || !code || !newPassword) throw new HttpError(400, 'studentId, code and newPassword are required');
  if (newPassword.length < 8) throw new HttpError(400, 'Password must be at least 8 characters');
  await authService.resetPassword(studentId, code, newPassword);
  res.status(204).end();
}));

authRouter.get('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await db('users').where({ id: req.user.id }).first();
  if (!user) throw new HttpError(404, 'User not found');
  res.json(authService.toPublicUser(user));
}));

authRouter.patch('/me', requireAuth, asyncHandler(async (req, res) => {
  const user = await authService.updateProfile(req.user.id, req.body);
  res.json(user);
}));

authRouter.post('/me/avatar', requireAuth, avatarUpload.single('avatar'), asyncHandler(async (req, res) => {
  if (!req.file) throw new HttpError(400, 'No file uploaded');
  const relativePath = path.relative(path.resolve(env.uploadDir), req.file.path);
  const user = await authService.updateAvatar(req.user.id, relativePath);
  res.json(user);
}));
