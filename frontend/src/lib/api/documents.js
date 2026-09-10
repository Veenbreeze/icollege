import { apiFetch } from './client';
import { getSession } from '@/lib/auth/session';
import { appendFilePart } from '@/lib/media';
const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';
export function fetchDocuments() {
  return apiFetch('/api/documents');
}
export async function uploadDocument(file, category) {
  const session = await getSession();
  const form = new FormData();
  form.append('category', category);
  await appendFilePart(form, 'file', file, { fallbackName: file.name, fallbackType: 'application/octet-stream' });
  const res = await fetch(`${BASE_URL}/api/documents`, {
    method: 'POST',
    headers: session
      ? {
          Authorization: `Bearer ${session.accessToken}`,
        }
      : undefined,
    body: form,
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error ?? 'Upload failed');
  }
  return res.json();
}
export function deleteDocument(id) {
  return apiFetch(`/api/documents/${id}`, {
    method: 'DELETE',
  });
}
