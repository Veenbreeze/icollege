import { apiFetch } from '@/lib/api/client';

export function searchSongs(query, country = 'tz') {
  const params = new URLSearchParams({ q: query, country });
  return apiFetch(`/api/music/search?${params.toString()}`);
}
