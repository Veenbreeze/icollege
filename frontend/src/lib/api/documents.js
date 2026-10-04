import { apiFetch } from './client';
import { appendFilePart } from '@/lib/media';
export function fetchDocuments() {
  return apiFetch('/api/documents');
}
export async function uploadDocument(file, category) {
  const form = new FormData();
  form.append('category', category);
  await appendFilePart(form, 'file', file, { fallbackName: file.name, fallbackType: 'application/octet-stream' });
  return apiFetch('/api/documents', {
    method: 'POST',
    body: form,
  });
}
export function deleteDocument(id) {
  return apiFetch(`/api/documents/${id}`, {
    method: 'DELETE',
  });
}
