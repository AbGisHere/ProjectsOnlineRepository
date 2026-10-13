'use client';

import { useMemo } from 'react';
import { useApi } from './hooks';
import type { Department } from './types';

export function useDepartments() {
  const q = useApi<Department[]>('/departments');
  const byId = useMemo(() => new Map((q.data ?? []).map((d) => [d.DEPARTMENT_ID, d.DEPARTMENT_NAME])), [q.data]);
  const options = (q.data ?? []).map((d) => ({ value: d.DEPARTMENT_ID, label: d.DEPARTMENT_NAME }));
  return { q, byId, options, name: (id: number) => byId.get(id) ?? `#${id}` };
}
