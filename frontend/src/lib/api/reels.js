import { apiFetch } from './client';
export function fetchStories() {
  return apiFetch('/api/stories');
}
export function fetchReels() {
  return apiFetch('/api/reels');
}
export function fetchMyReels() {
  return apiFetch('/api/users/me/reels');
}
export function toggleReelLike(id) {
  return apiFetch(`/api/reels/${id}/like`, {
    method: 'POST',
  });
}
export function shareReel(id) {
  return apiFetch(`/api/reels/${id}/share`, {
    method: 'POST',
  });
}
export function createReel(formData) {
  return apiFetch('/api/reels', {
    method: 'POST',
    body: formData,
  });
}
export function createStory(formData) {
  return apiFetch('/api/stories', {
    method: 'POST',
    body: formData,
  });
}
export function viewStory(id) {
  return apiFetch(`/api/stories/${id}/view`, {
    method: 'POST',
  });
}
