import { apiFetch } from './client';
export function fetchOpportunities(category) {
  const qs = category && category !== 'All' ? `?category=${encodeURIComponent(category)}` : '';
  return apiFetch(`/api/opportunities${qs}`);
}
export function fetchOpportunity(id) {
  return apiFetch(`/api/opportunities/${id}`);
}
export function saveOpportunity(id) {
  return apiFetch(`/api/opportunities/${id}/save`, {
    method: 'POST',
  });
}
export function applyToOpportunity(id) {
  return apiFetch(`/api/opportunities/${id}/apply`, {
    method: 'POST',
  });
}
export function fetchProjects() {
  return apiFetch('/api/projects');
}
export function joinProject(id) {
  return apiFetch(`/api/projects/${id}/join`, {
    method: 'POST',
  });
}
export function createProject(data) {
  return apiFetch('/api/projects', {
    method: 'POST',
    body: data,
  });
}
export function fetchPortfolio() {
  return apiFetch('/api/portfolio');
}
