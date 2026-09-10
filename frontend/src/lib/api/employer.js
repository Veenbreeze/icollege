import { apiFetch } from './client';

export function fetchMyCompany() {
  return apiFetch('/api/employer/company');
}
export function updateMyCompany(data) {
  return apiFetch('/api/employer/company', { method: 'PATCH', body: data });
}
export function fetchMyOpportunities() {
  return apiFetch('/api/employer/opportunities');
}
export function postOpportunity(data) {
  return apiFetch('/api/employer/opportunities', { method: 'POST', body: data });
}
export function fetchApplicants(opportunityId) {
  return apiFetch(`/api/employer/opportunities/${opportunityId}/applicants`);
}
export function postChallenge(data) {
  return apiFetch('/api/employer/competitions', { method: 'POST', body: data });
}
export function searchTalent({ skill, programme } = {}) {
  const params = new URLSearchParams();
  if (skill) params.set('skill', skill);
  if (programme) params.set('programme', programme);
  const qs = params.toString();
  return apiFetch(`/api/employer/talent-search${qs ? `?${qs}` : ''}`);
}
