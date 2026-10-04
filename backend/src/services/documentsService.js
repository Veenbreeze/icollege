import path from 'node:path';
import fs from 'node:fs';
import { db } from '../db/pool.js';
import { env } from '../config/env.js';
import { signedDocumentUrl } from '../middleware/upload.js';

function inferDocType(mimeType) {
  if (mimeType === 'application/pdf') return 'pdf';
  if (mimeType?.startsWith('image/')) return 'image';
  return 'doc';
}

function toPublic(row, userId = row.user_id) {
  return {
    id: `doc-${row.id}`,
    name: row.name,
    type: row.doc_type,
    category: row.category,
    size: formatSize(row.size_bytes),
    date: row.created_at,
    url: signedDocumentUrl(row.id, userId),
  };
}

function formatSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export async function listDocuments(userId) {
  const rows = await db('documents').where({ user_id: userId }).orderBy('created_at', 'desc').limit(200);
  return rows.map((row) => toPublic(row, userId));
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
  return toPublic(row, userId);
}

export async function listCourseMaterials(user, courseId) {
  const course = await db('courses').where({ id: courseId, university_id: user.universityId }).first('id', 'lecturer_id');
  if (!course) return null;
  if (user.role === 'student') {
    const enrollment = await db('student_course_enrollments').where({ course_id: courseId, student_id: user.id, university_id: user.universityId, status: 'active' }).first();
    if (!enrollment) return null;
  } else if (user.role === 'lecturer' && course.lecturer_id !== user.id) return null;
  else if (!['lecturer', 'university_admin', 'platform_admin'].includes(user.role)) return null;
  return db('documents').where({ course_id: courseId, visibility: 'course' }).orderBy('created_at', 'desc').limit(100)
    .then((rows) => rows.map((row) => toPublic(row, user.id)));
}

export async function resolveDownload(documentId, user) {
  const row = await db('documents').where({ id: documentId }).first();
  if (!row) return null;
  if (row.user_id !== user.id) {
    if (!row.course_id || row.visibility !== 'course') return null;
    const course = await db('courses').where({ id: row.course_id, university_id: user.universityId }).first('id', 'lecturer_id');
    if (!course) return null;
    if (user.role === 'student') {
      if (!(await db('student_course_enrollments').where({ course_id: row.course_id, student_id: user.id, university_id: user.universityId, status: 'active' }).first())) return null;
    } else if (user.role === 'lecturer') {
      if (course.lecturer_id !== user.id) return null;
    } else if (!['university_admin', 'platform_admin'].includes(user.role)) return null;
  }
  const root = path.resolve(env.uploadDir);
  const filePath = path.resolve(root, row.storage_path);
  const relative = path.relative(root, filePath);
  if (relative.startsWith('..') || path.isAbsolute(relative)) return null;
  return filePath;
}

export async function deleteDocument(userId, documentId) {
  const row = await db('documents').where({ id: documentId, user_id: userId }).first();
  if (!row) return false;
  await db('documents').where({ id: documentId }).del();
  const absolutePath = path.resolve(env.uploadDir, row.storage_path);
  fs.promises.unlink(absolutePath).catch(() => {});
  return true;
}
