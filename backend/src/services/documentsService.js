import path from 'node:path';
import fs from 'node:fs';
import { db } from '../db/pool.js';
import { env } from '../config/env.js';
import { publicUrlFor } from '../middleware/upload.js';

function inferDocType(mimeType) {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType?.startsWith('image/')) return 'image';
  return 'doc';
}

function toPublic(row) {
  return {
    id: `doc-${row.id}`,
    name: row.name,
    type: row.doc_type,
    category: row.category,
    size: formatSize(row.size_bytes),
    date: row.created_at,
    url: publicUrlFor(row.storage_path),
  };
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function listDocuments(userId) {
  const rows = await db('documents').where({ user_id: userId }).orderBy('created_at', 'desc');
  return rows.map(toPublic);
}

export async function createDocument(userId, file, category) {
  const relativePath = path.relative(path.resolve(env.uploadDir), file.path);
  const [row] = await db('documents')
    .insert({
      user_id: userId,
      name: file.originalname,
      doc_type: inferDocType(file.mimetype),
      category: category || 'all',
      size_bytes: file.size,
      mime_type: file.mimetype,
      storage_path: relativePath,
    })
    .returning('*');
  return toPublic(row);
}

export async function deleteDocument(userId, documentId) {
  const row = await db('documents').where({ id: documentId, user_id: userId }).first();
  if (!row) return false;
  await db('documents').where({ id: documentId }).del();
  const absolutePath = path.resolve(env.uploadDir, row.storage_path);
  fs.promises.unlink(absolutePath).catch(() => {});
  return true;
}
