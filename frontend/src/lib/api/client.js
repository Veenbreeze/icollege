import { getSession, saveSession, clearSession } from '@/lib/auth/session';
export const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';
/** Turns a server-relative path (e.g. an avatar/media `url`) into an absolute URL. */
export function resolveMediaUrl(url) {
  if (!url) return null;
  return url.startsWith('http') ? url : `${BASE_URL}${url}`;
}
export class ApiError extends Error {
  status;
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
let onSessionExpired = null;
/** Registered once by AuthContext so the client can force a logout on an unrecoverable 401. */
export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}
let refreshPromise = null;
async function tryRefresh() {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const session = await getSession();
      if (!session) return false;
      try {
        const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            refreshToken: session.refreshToken,
          }),
        });
        if (!res.ok) return false;
        const data = await res.json();
        await saveSession({
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
        });
        return true;
      } catch {
        return false;
      }
    })();
  }
  const result = await refreshPromise;
  refreshPromise = null;
  return result;
}
export async function apiFetch(path, options = {}) {
  const { method = 'GET', body, auth = true, headers = {} } = options;
  const doRequest = async () => {
    const finalHeaders = {
      ...headers,
    };
    let finalBody;
    if (body instanceof FormData) {
      finalBody = body;
    } else if (body !== undefined) {
      finalHeaders['Content-Type'] = 'application/json';
      finalBody = JSON.stringify(body);
    }
    if (auth) {
      const session = await getSession();
      if (session) finalHeaders.Authorization = `Bearer ${session.accessToken}`;
    }
    return fetch(`${BASE_URL}${path}`, {
      method,
      headers: finalHeaders,
      body: finalBody,
    });
  };
  let res = await doRequest();
  if (res.status === 401 && auth) {
    const refreshed = await tryRefresh();
    if (refreshed) {
      res = await doRequest();
    } else {
      await clearSession();
      onSessionExpired?.();
    }
  }
  if (!res.ok) {
    let message = res.statusText;
    try {
      const data = await res.json();
      message = data.error ?? message;
    } catch {
      // response had no JSON body
    }
    throw new ApiError(res.status, message);
  }
  if (res.status === 204) return undefined;
  return res.json();
}
