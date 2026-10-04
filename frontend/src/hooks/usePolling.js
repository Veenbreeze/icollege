import { useEffect, useRef } from 'react';

/** Calls `callback` on a fixed interval — the chat screen's only consumer,
 * since this app uses REST + polling rather than WebSockets. */
export function usePolling(callback, intervalMs, enabled = true) {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => savedCallback.current(), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs, enabled]);
}
