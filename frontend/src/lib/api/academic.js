import { apiFetch } from './client';
export function fetchTodayTimetable() {
  return apiFetch('/api/timetable/today');
}
export function fetchWeekTimetable() {
  return apiFetch('/api/timetable/week');
}
export function fetchExams() {
  return apiFetch('/api/exams');
}
export function fetchExamSeating(examId) {
  return apiFetch(`/api/exams/${examId}/seating`);
}
export function fetchNotices() {
  return apiFetch('/api/notices');
}
export function markNoticeRead(noticeId) {
  return apiFetch(`/api/notices/${noticeId}/read`, {
    method: 'POST',
  });
}
