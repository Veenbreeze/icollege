import { apiFetch } from './client';
export function listUniversities() {
  return apiFetch('/api/auth/universities', { auth: false });
}
export function login(studentId, password, universitySlug) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: {
      studentId,
      password,
      universitySlug,
    },
    auth: false,
  });
}
export function signup(data) {
  return apiFetch('/api/auth/signup', {
    method: 'POST',
    body: data,
    auth: false,
  });
}
export function fetchMe() {
  return apiFetch('/api/auth/me');
}
export function updateProfile(data) {
  return apiFetch('/api/auth/me', {
    method: 'PATCH',
    body: data,
  });
}
export function uploadAvatar(formData) {
  return apiFetch('/api/auth/me/avatar', {
    method: 'POST',
    body: formData,
  });
}
export function forgotPassword(studentId, universitySlug) {
  return apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: {
      studentId,
      universitySlug,
    },
    auth: false,
  });
}
export function resetPassword(studentId, code, newPassword, universitySlug) {
  return apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: {
      studentId,
      code,
      newPassword,
      universitySlug,
    },
    auth: false,
  });
}
export function logoutRequest(refreshToken) {
  return apiFetch('/api/auth/logout', {
    method: 'POST',
    body: {
      refreshToken,
    },
    auth: false,
  });
}
