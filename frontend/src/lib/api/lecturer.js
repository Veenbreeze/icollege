import { apiFetch } from './client';

export function fetchMyCourses() {
  return apiFetch('/api/lecturer/courses');
}
export function postNotice(data) {
  return apiFetch('/api/lecturer/notices', { method: 'POST', body: data });
}
export function uploadMaterial(formData) {
  return apiFetch('/api/lecturer/materials', { method: 'POST', body: formData });
}
export function postLectureUpdate(data) {
  return apiFetch('/api/lecturer/lecture-updates', { method: 'POST', body: data });
}
export function fetchMyTimetableChangeRequests() {
  return apiFetch('/api/lecturer/timetable-change-requests');
}
export function requestTimetableChange(data) {
  return apiFetch('/api/lecturer/timetable-change-requests', { method: 'POST', body: data });
}
