'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { api, ApiError } from './api';

export type Query<T> = { data: T | undefined; error: ApiError | null; loading: boolean; reload: () => Promise<void> };

/** GET a path and keep it in state. `null` skips the request. */
export function useApi<T>(path: string | null): Query<T> {
  const [data, setData] = useState<T | undefined>(undefined);
  const [error, setError] = useState<ApiError | null>(null);
  const [loading, setLoading] = useState<boolean>(!!path);
  const seq = useRef(0);

  const load = useCallback(async () => {
    if (!path) {
      setLoading(false);
      return;
    }
    const n = ++seq.current;
    setLoading(true);
    try {
      const d = await api.get<T>(path);
      if (n === seq.current) {
        setData(d);
        setError(null);
      }
    } catch (e) {
      if (n === seq.current) setError(e instanceof ApiError ? e : new ApiError(0, String(e)));
    } finally {
      if (n === seq.current) setLoading(false);
    }
  }, [path]);

  useEffect(() => {
    void load();
  }, [load]);

  return { data, error, loading, reload: load };
}

/** Next free numeric ID for tables whose keys are entered by hand. */
export function nextId<T>(rows: T[] | undefined, key: keyof T, floor = 1): number {
  if (!rows?.length) return floor;
  return Math.max(...rows.map((r) => Number(r[key]) || 0)) + 1;
}
