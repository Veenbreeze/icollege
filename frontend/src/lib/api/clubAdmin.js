import { apiFetch } from './client';

export function fetchMyClubs() {
  return apiFetch('/api/club-admin/clubs');
}
export function updateClub(clubId, data) {
  return apiFetch(`/api/club-admin/clubs/${clubId}`, { method: 'PATCH', body: data });
}
export function fetchClubMembers(clubId) {
  return apiFetch(`/api/club-admin/clubs/${clubId}/members`);
}
export function removeClubMember(clubId, userId) {
  return apiFetch(`/api/club-admin/clubs/${clubId}/members/${userId}`, { method: 'DELETE' });
}
export function createClubEvent(clubId, data) {
  return apiFetch(`/api/club-admin/clubs/${clubId}/events`, { method: 'POST', body: data });
}
export function fetchClubAnnouncements(clubId) {
  return apiFetch(`/api/club-admin/clubs/${clubId}/announcements`);
}
export function postClubAnnouncement(clubId, data) {
  return apiFetch(`/api/club-admin/clubs/${clubId}/announcements`, { method: 'POST', body: data });
}
export function createClubCompetition(clubId, data) {
  return apiFetch(`/api/club-admin/clubs/${clubId}/competitions`, { method: 'POST', body: data });
}
