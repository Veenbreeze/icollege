import { apiFetch } from './client';

export function fetchStats() {
  return apiFetch('/api/admin/stats');
}
export function fetchUsers({ status, role } = {}) {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (role) params.set('role', role);
  const qs = params.toString();
  return apiFetch(`/api/admin/users${qs ? `?${qs}` : ''}`);
}
export function updateUserStatus(id, status) {
  return apiFetch(`/api/admin/users/${id}/status`, { method: 'PATCH', body: { status } });
}
export function updateUserRole(id, role) {
  return apiFetch(`/api/admin/users/${id}/role`, { method: 'PATCH', body: { role } });
}
export function fetchCourses() {
  return apiFetch('/api/admin/courses');
}
export function createCourse(data) {
  return apiFetch('/api/admin/courses', { method: 'POST', body: data });
}
export function assignCourseLecturer(courseId, lecturerId) {
  return apiFetch(`/api/admin/courses/${courseId}/lecturer`, { method: 'PATCH', body: { lecturerId } });
}
export function fetchTimetableChangeRequests(status) {
  const qs = status ? `?status=${status}` : '';
  return apiFetch(`/api/admin/timetable-change-requests${qs}`);
}
export function resolveTimetableChangeRequest(id, status, adminNote) {
  return apiFetch(`/api/admin/timetable-change-requests/${id}`, { method: 'PATCH', body: { status, adminNote } });
}
export function createNotice(data) {
  return apiFetch('/api/admin/notices', { method: 'POST', body: data });
}
export function createExam(data) {
  return apiFetch('/api/admin/exams', { method: 'POST', body: data });
}
export function createTimetableSlot(data) {
  return apiFetch('/api/admin/timetable-slots', { method: 'POST', body: data });
}
export function assignClubOwner(clubId, ownerId) {
  return apiFetch(`/api/admin/clubs/${clubId}/owner`, { method: 'PATCH', body: { ownerId } });
}
export function verifyCompany(companyId, verified) {
  return apiFetch(`/api/admin/companies/${companyId}/verify`, { method: 'PATCH', body: { verified } });
}
export function fetchSettings() {
  return apiFetch('/api/admin/settings');
}
export function updateSettings(data) {
  return apiFetch('/api/admin/settings', { method: 'PATCH', body: data });
}
