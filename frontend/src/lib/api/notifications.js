import { apiFetch } from './client';

/** The current user's in-app notification feed (newest first). */
export function fetchNotifications() {
  return apiFetch('/api/notifications');
}

export function fetchUnreadCount() {
  return apiFetch('/api/notifications/unread-count');
}

export function markNotificationRead(id) {
  return apiFetch(`/api/notifications/${id}/read`, { method: 'PATCH' });
}

export function markAllNotificationsRead() {
  return apiFetch('/api/notifications/read-all', { method: 'POST' });
}

/**
 * Register this device's push token. Wired for later — the OS-level Expo push
 * token is only obtainable in a native device build (needs `expo-notifications`).
 * The backend endpoint is ready; call this once that module is added.
 */
export function registerPushToken(token, platform) {
  return apiFetch('/api/notifications/register-token', { method: 'POST', body: { token, platform } });
}
