import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import crypto from 'node:crypto';
import { env } from '../config/env.js';

/** Builds a multer instance that stores files under uploads/<subfolder>/<userId>/. */
const allowedMimeTypes = new Set([
  'image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/heic', 'image/heif',
  'video/mp4', 'video/quicktime', 'video/webm',
  'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/plain', 'text/csv',
]);
const extensionByMime = new Map([
  ['image/jpeg', '.jpg'], ['image/png', '.png'], ['image/webp', '.webp'], ['image/gif', '.gif'], ['image/heic', '.heic'], ['image/heif', '.heif'],
  ['video/mp4', '.mp4'], ['video/quicktime', '.mov'], ['video/webm', '.webm'],
  ['application/pdf', '.pdf'], ['application/msword', '.doc'],
  ['application/vnd.openxmlformats-officedocument.wordprocessingml.document', '.docx'],
  ['application/vnd.ms-excel', '.xls'], ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', '.xlsx'],
  ['text/plain', '.txt'], ['text/csv', '.csv'],
]);

export function createUploader(subfolder, { maxSizeMb = 15 } = {}) {
  const storage = multer.diskStorage({
    destination(req, _file, cb) {
      const dir = path.resolve(env.uploadDir, subfolder, String(req.user.id));
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(_req, file, cb) {
      const ext = extensionByMime.get(file.mimetype) || '';
      cb(null, `${randomUUID()}${ext}`);
    },
  });

  return multer({
    storage,
    limits: { fileSize: maxSizeMb * 1024 * 1024, files: 1 },
    fileFilter(_req, file, cb) {
      if (!allowedMimeTypes.has(file.mimetype)) {
        const error = new Error('Unsupported file type');
        error.status = 415;
        error.publicMessage = 'Unsupported file type';
        return cb(error);
      }
      cb(null, true);
    },
  });
}

export function signedDocumentUrl(documentId, userId, ttlSeconds = 600) {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${documentId}:${userId}:${expires}`;
  const signature = crypto.createHmac('sha256', env.jwtAccessSecret).update(payload).digest('hex');
  return `/api/documents/${documentId}/download?user=${userId}&expires=${expires}&signature=${signature}`;
}

export function signedMediaUrl(kind, id, userId, ttlSeconds = 120) {
  const expires = Math.floor(Date.now() / 1000) + ttlSeconds;
  const payload = `${kind}:${id}:${userId}:${expires}`;
  const signature = crypto.createHmac('sha256', env.jwtAccessSecret).update(payload).digest('hex');
  return `/api/media/${kind}/${id}?user=${userId}&expires=${expires}&signature=${signature}`;
}

export function verifyMediaUrl(kind, id, userId, expires, signature) {
  const expiry = Number(expires);
  if (!Number.isSafeInteger(expiry) || expiry < Math.floor(Date.now() / 1000) || expiry > Math.floor(Date.now() / 1000) + 180) return false;
  const expected = crypto.createHmac('sha256', env.jwtAccessSecret).update(`${kind}:${id}:${userId}:${expiry}`).digest();
  let actual;
  try { actual = Buffer.from(signature, 'hex'); } catch { return false; }
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}

export function verifyDocumentUrl(documentId, userId, expires, signature) {
  const expiry = Number(expires);
  if (!Number.isSafeInteger(expiry) || expiry < Math.floor(Date.now() / 1000) || expiry > Math.floor(Date.now() / 1000) + 660) return false;
  const expected = crypto.createHmac('sha256', env.jwtAccessSecret).update(`${documentId}:${userId}:${expiry}`).digest();
  let actual;
  try { actual = Buffer.from(signature, 'hex'); } catch { return false; }
  return actual.length === expected.length && crypto.timingSafeEqual(actual, expected);
}
