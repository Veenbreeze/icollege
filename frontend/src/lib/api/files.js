import { apiFetch, resolveMediaUrl } from './client';

/**
 * Exchange a protected download path (e.g. "/api/files/3/download") for a
 * short-lived signed absolute URL that can be opened directly (no auth header).
 */
export async function getSignedFileUrl(downloadUrl) {
  if (!downloadUrl) return null;
  const signedPath = downloadUrl.replace(/\/download(\?.*)?$/, '/signed-url');
  const { url } = await apiFetch(signedPath);
  return resolveMediaUrl(url);
}
