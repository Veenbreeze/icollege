import { apiFetch } from './client';

/**
 * iLibrary — course materials uploaded by lecturers (documents with
 * visibility 'course'). Backend endpoint pending (see docs/API_CONTRACT.md,
 * Cycle 3). The screen degrades gracefully to an empty state until it exists.
 */
export function fetchLibrary({ courseId } = {}) {
  const qs = courseId ? `?courseId=${courseId}` : '';
  return apiFetch(`/api/library${qs}`);
}
