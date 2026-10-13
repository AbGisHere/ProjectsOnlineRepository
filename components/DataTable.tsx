'use client';

import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { SkeletonRows } from './ui';

export type Column<T> = {
  key: string;
  label: string;
  render?: (row: T) => ReactNode;
  /** Value used for sorting; defaults to row[key]. `false` disables sorting. */
  sort?: ((row: T) => string | number | null) | false;
  numeric?: boolean;
  mono?: boolean;
  width?: number | string;
};

export function DataTable<T>({
  rows, columns, rowKey, loading, empty, actions, activeKey, litKeys, caption, initialSort,
}: {
  rows: T[] | undefined;
  columns: Column<T>[];
  rowKey: (row: T) => string | number;
  loading?: boolean;
  empty?: ReactNode;
  actions?: (row: T) => ReactNode;
  activeKey?: string | number | null;
  /** When set, matching rows stay lit and the rest dim. */
  litKeys?: Set<string | number> | null;
  caption: string;
  initialSort?: { key: string; dir: 'asc' | 'desc' };
}) {
  const [sort, setSort] = useState<{ key: string; dir: 'asc' | 'desc' } | null>(initialSort ?? null);

  const sorted = useMemo(() => {
    if (!rows) return [];
    if (!sort) return rows;
    const col = columns.find((c) => c.key === sort.key);
    if (!col || col.sort === false) return rows;
    const get = typeof col.sort === 'function' ? col.sort : (r: T) => (r as Record<string, unknown>)[col.key] as string | number | null;
    const dir = sort.dir === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = get(a);
      const vb = get(b);
      if (va === vb) return 0;
      if (va === null || va === undefined) return 1;
      if (vb === null || vb === undefined) return -1;
      if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
      return String(va).localeCompare(String(vb), 'en', { numeric: true }) * dir;
    });
  }, [rows, sort, columns]);

  const colCount = columns.length + (actions ? 1 : 0);
  const dimming = !!litKeys && litKeys.size > 0;

  return (
    <div className="table-wrap" tabIndex={0} role="region" aria-label={`${caption} table`}>
      <table className={`data${dimming ? ' dimming' : ''}`}>
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => {
              const active = sort?.key === c.key;
              const ariaSort = active ? (sort!.dir === 'asc' ? 'ascending' : 'descending') : 'none';
              return (
                <th key={c.key} className={c.numeric ? 'n' : undefined} style={{ width: c.width }} aria-sort={c.sort === false ? undefined : ariaSort}>
                  {c.sort === false ? (
                    <span>{c.label}</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSort(active && sort!.dir === 'asc' ? { key: c.key, dir: 'desc' } : { key: c.key, dir: 'asc' })}
                    >
                      {c.label}
                      {active ? (sort!.dir === 'asc' ? <ArrowUp size={12} aria-hidden /> : <ArrowDown size={12} aria-hidden />) : <ArrowUpDown size={12} aria-hidden style={{ opacity: 0.4 }} />}
                    </button>
                  )}
                </th>
              );
            })}
            {actions && <th style={{ width: 1 }}><span className="sr-only">Actions</span></th>}
          </tr>
        </thead>
        <tbody>
          {loading && !rows ? (
            <SkeletonRows cols={colCount} />
          ) : sorted.length === 0 ? (
            <tr>
              <td colSpan={colCount}>{empty}</td>
            </tr>
          ) : (
            sorted.map((row) => {
              const k = rowKey(row);
              return (
                <tr key={k} data-active={activeKey === k ? 'true' : undefined} data-lit={litKeys?.has(k) ? 'true' : undefined}>
                  {columns.map((c) => (
                    <td key={c.key} className={c.numeric ? 'n' : c.mono ? 'num' : undefined}>
                      {c.render ? c.render(row) : String((row as Record<string, unknown>)[c.key] ?? '—')}
                    </td>
                  ))}
                  {actions && <td><div className="row-actions">{actions(row)}</div></td>}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
