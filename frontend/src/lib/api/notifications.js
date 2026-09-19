import { apiFetch } from './client';

export function fetchNotifications() {
  return apiFetch('/api/notifications');
}

export function fetchUnreadNotificationCount() {
  return apiFetch('/api/notifications/unread-count');
}

export function markNotificationRead(id) {
  return apiFetch(`/api/notifications/${id}/read`, {
    method: 'POST',
  });
}

export function markAllNotificationsRead() {
  return apiFetch('/api/notifications/read-all', {
    method: 'POST',
  });
}
