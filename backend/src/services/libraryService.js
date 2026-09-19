import { db } from '../db/pool.js';
import { publicUrlFor } from '../middleware/upload.js';

function formatSize(bytes) {
  if (bytes == null) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function toPublic(row) {
  return {
    id: `mat-${row.id}`,
    name: row.name,
    type: row.doc_type, // 'pdf' | 'image' | 'doc'
    size: formatSize(row.size_bytes),
    url: publicUrlFor(row.storage_path),
    courseCode: row.course_code,
    courseTitle: row.course_title,
    uploadedBy: row.uploaded_by,
    createdAt: row.created_at,
  };
}

/**
 * iLibrary — course materials lecturers have shared (documents with
 * visibility='course'). Optionally filtered by course.
 */
export async function listMaterials({ courseId } = {}) {
  const rows = await db('documents')
    .join('courses', 'courses.id', 'documents.course_id')
    .join('users', 'users.id', 'documents.user_id')
    .where('documents.visibility', 'course')
    .modify((q) => {
      if (courseId) q.andWhere('documents.course_id', courseId);
    })
    .select(
      'documents.id',
      'documents.name',
      'documents.doc_type',
      'documents.size_bytes',
      'documents.storage_path',
      'documents.created_at',
      'courses.code as course_code',
      'courses.title as course_title',
      'users.full_name as uploaded_by',
    )
    .orderBy('documents.created_at', 'desc');

  return rows.map(toPublic);
}
