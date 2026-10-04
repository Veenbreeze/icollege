import { HttpError } from '../middleware/errorHandler.js';

const APPLE_SEARCH_URL = 'https://itunes.apple.com/search';
const MAX_RESULTS = 25;
const MAX_QUERY_LENGTH = 100;

function isHttpsUrl(value, allowedHosts) {
  if (typeof value !== 'string') return false;
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && allowedHosts.some((host) => url.hostname === host || url.hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function mapTrack(track) {
  if (!track || !isHttpsUrl(track.previewUrl, ['itunes.apple.com', 'mzstatic.com'])) return null;
  if (!isHttpsUrl(track.trackViewUrl, ['itunes.apple.com', 'music.apple.com'])) return null;
  return {
    id: Number.isInteger(track.trackId) ? track.trackId : String(track.trackId ?? ''),
    title: String(track.trackName ?? '').slice(0, 200),
    artist: String(track.artistName ?? '').slice(0, 200),
    album: String(track.collectionName ?? '').slice(0, 200),
    artworkUrl: isHttpsUrl(track.artworkUrl100, ['mzstatic.com']) ? track.artworkUrl100 : null,
    previewUrl: track.previewUrl,
    storeUrl: track.trackViewUrl,
    genre: String(track.primaryGenreName ?? '').slice(0, 100),
    durationMs: Number.isFinite(track.trackTimeMillis) ? track.trackTimeMillis : null,
  };
}

export async function searchTracks(query, storefront = 'tz') {
  const term = String(query ?? '').trim().slice(0, MAX_QUERY_LENGTH);
  if (term.length < 2) throw new HttpError(400, 'Enter at least 2 characters to search for songs');
  const country = String(storefront).toLowerCase();
  if (!/^[a-z]{2}$/.test(country)) throw new HttpError(400, 'Storefront must be a two-letter country code');

  const url = new URL(APPLE_SEARCH_URL);
  url.searchParams.set('term', term);
  url.searchParams.set('entity', 'song');
  url.searchParams.set('country', country);
  url.searchParams.set('limit', String(MAX_RESULTS));

  let response;
  try {
    response = await fetch(url, { signal: AbortSignal.timeout(5000), headers: { Accept: 'application/json' } });
  } catch {
    throw new HttpError(503, 'Music search is temporarily unavailable. Please try again.');
  }
  if (!response.ok) throw new HttpError(502, 'The music catalog did not return results. Please try again.');
  const payload = await response.json();
  const tracks = Array.isArray(payload.results) ? payload.results.map(mapTrack).filter(Boolean) : [];
  return { provider: 'Apple Music', country: country.toUpperCase(), tracks };
}
