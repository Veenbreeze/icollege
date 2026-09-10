import { apiFetch } from './client';
export function login(studentId, password) {
  return apiFetch('/api/auth/login', {
    method: 'POST',
    body: {
      studentId,
      password,
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
export function forgotPassword(studentId) {
  return apiFetch('/api/auth/forgot-password', {
    method: 'POST',
    body: {
      studentId,
    },
    auth: false,
  });
}
export function resetPassword(studentId, code, newPassword) {
  return apiFetch('/api/auth/reset-password', {
    method: 'POST',
    body: {
      studentId,
      code,
      newPassword,
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
