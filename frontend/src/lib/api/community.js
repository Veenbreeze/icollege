import { apiFetch } from './client';
export function fetchChambers() {
  return apiFetch('/api/community/chambers');
}
export function fetchChamber(slug) {
  return apiFetch(`/api/community/chambers/${slug}`);
}
export function joinChamber(slug) {
  return apiFetch(`/api/community/chambers/${slug}/join`, {
    method: 'POST',
  });
}
export function fetchChamberPosts(slug, tag) {
  const qs = tag ? `?tag=${encodeURIComponent(tag)}` : '';
  return apiFetch(`/api/community/chambers/${slug}/posts${qs}`);
}
export function createPost(slug, data) {
  return apiFetch(`/api/community/chambers/${slug}/posts`, {
    method: 'POST',
    body: data,
  });
}
export function fetchPost(id) {
  return apiFetch(`/api/community/posts/${id}`);
}
export function fetchComments(postId) {
  return apiFetch(`/api/community/posts/${postId}/comments`);
}
export function addComment(postId, body) {
  return apiFetch(`/api/community/posts/${postId}/comments`, {
    method: 'POST',
    body: {
      body,
    },
  });
}
export function togglePostLike(postId) {
  return apiFetch(`/api/community/posts/${postId}/like`, {
    method: 'POST',
  });
}
