import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { env } from '../config/env.js';

/** Builds a multer instance that stores files under uploads/<subfolder>/<userId>/. */
export function createUploader(subfolder, { maxSizeMb = 15 } = {}) {
  const storage = multer.diskStorage({
    destination(req, _file, cb) {
      const dir = path.resolve(env.uploadDir, subfolder, String(req.user.id));
      fs.mkdirSync(dir, { recursive: true });
      cb(null, dir);
    },
    filename(_req, file, cb) {
      const ext = path.extname(file.originalname);
      cb(null, `${randomUUID()}${ext}`);
    },
  });

  return multer({ storage, limits: { fileSize: maxSizeMb * 1024 * 1024 } });
}

export function publicUrlFor(storagePath) {
  return `/uploads/${storagePath.split(path.sep).join('/')}`;
}
