import { apiFetch } from './client';
export function searchAll(query) {
  return apiFetch(`/api/ai/search?q=${encodeURIComponent(query)}`);
}
export function fetchStudyCourses() {
  return apiFetch('/api/ai/study/courses');
}
export function fetchCourseStudy(id) {
  return apiFetch(`/api/ai/study/courses/${id}`);
}
export function chatReply(text) {
  return apiFetch('/api/ai/chat', {
    method: 'POST',
    body: {
      text,
    },
  });
}
