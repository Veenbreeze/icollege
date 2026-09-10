import { apiFetch } from './client';
export function fetchThreads() {
  return apiFetch('/api/chat/threads');
}
export function fetchThread(id) {
  return apiFetch(`/api/chat/threads/${id}`);
}
export function fetchMessages(threadId, afterId) {
  const qs = afterId ? `?after=${afterId}` : '';
  return apiFetch(`/api/chat/threads/${threadId}/messages${qs}`);
}
export function sendMessage(threadId, text) {
  return apiFetch(`/api/chat/threads/${threadId}/messages`, {
    method: 'POST',
    body: {
      text,
    },
  });
}
