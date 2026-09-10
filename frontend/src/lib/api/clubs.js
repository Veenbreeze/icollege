import { apiFetch } from './client';
export function fetchClubs() {
  return apiFetch('/api/clubs');
}
export function joinClub(id) {
  return apiFetch(`/api/clubs/${id}/join`, {
    method: 'POST',
  });
}
export function fetchEvents() {
  return apiFetch('/api/events');
}
export function registerForEvent(id) {
  return apiFetch(`/api/events/${id}/register`, {
    method: 'POST',
  });
}
export function createEvent(data) {
  return apiFetch('/api/events', {
    method: 'POST',
    body: data,
  });
}
