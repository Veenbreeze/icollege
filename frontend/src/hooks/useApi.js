import { useCallback, useEffect, useState } from 'react';
import { ApiError } from '@/lib/api/client';
/** Small hand-rolled fetch hook — no React Query, just loading/error/refetch. */
export function useApi(fetcher, deps = []) {
  const [state, setState] = useState({
    data: null,
    error: null,
    isLoading: true,
  });
  const load = useCallback(() => {
    let cancelled = false;
    setState((s) => ({
      ...s,
      isLoading: true,
      error: null,
    }));
    fetcher()
      .then((data) => {
        if (!cancelled)
          setState({
            data,
            error: null,
            isLoading: false,
          });
      })
      .catch((e) => {
        if (!cancelled)
          setState({
            data: null,
            error: e instanceof ApiError ? e.message : 'Something went wrong',
            isLoading: false,
          });
      });
    return () => {
      cancelled = true;
    };
    // The caller supplies semantic dependencies (such as a route ID) as an array.
    // eslint-disable-next-line react-hooks/exhaustive-deps, react-hooks/use-memo
  }, deps);
  useEffect(() => load(), [load]);
  return {
    ...state,
    refetch: load,
  };
}
