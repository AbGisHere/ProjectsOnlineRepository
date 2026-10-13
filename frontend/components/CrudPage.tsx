'use client';

import { Plus, Search } from 'lucide-react';
import { useMemo, useState, type ReactNode } from 'react';
import { api } from '@/lib/api';
import { useApi, type Query } from '@/lib/hooks';
import { DataTable, type Column } from './DataTable';
import { EntityForm, toBody, type FieldDef, type FormValues } from './EntityForm';
import { useToast } from './Toast';
import { ConfirmDelete, Empty, Notice, PageHead, type Hue } from './ui';

export type CrudConfig<T> = {
  /** Singular noun, e.g. "department". */
  noun: string;
  title: string;
  lede?: ReactNode;
  hue: Hue;
  endpoint: string;
  rowKey: (row: T) => number;
  rowLabel: (row: T) => string;
  columns: Column<T>[];
  fields: FieldDef[];
  /** Values for a blank create form (e.g. the next free ID). */
  blank: (rows: T[] | undefined) => FormValues;
  toForm: (row: T) => FormValues;
  /** Adjust the request body before it is sent. */
  shape?: (body: Record<string, unknown>, mode: 'create' | 'edit', row?: T) => Record<string, unknown>;
  canCreate: boolean;
  canEdit: (row: T) => boolean;
  canDelete: (row: T) => boolean;
  search: (row: T) => string;
  searchLabel: string;
  filters?: ReactNode;
  filter?: (row: T) => boolean;
  emptyHint?: string;
  /** Extra content under the table (e.g. related junction rows). */
  below?: ReactNode;
  query?: Query<T[]>;
  initialSort?: { key: string; dir: 'asc' | 'desc' };
  headActions?: ReactNode;
  onChanged?: () => void;
};

export function CrudPage<T>(cfg: CrudConfig<T>) {
  const own = useApi<T[]>(cfg.query ? null : cfg.endpoint);
  const q = cfg.query ?? own;
  const toast = useToast();
  const [mode, setMode] = useState<null | { kind: 'create' } | { kind: 'edit'; row: T }>(null);
  const [term, setTerm] = useState('');
  const [listError, setListError] = useState<string | null>(null);

  const rows = useMemo(() => {
    if (!q.data) return undefined;
    const t = term.trim().toLowerCase();
    return q.data.filter((r) => (!cfg.filter || cfg.filter(r)) && (!t || cfg.search(r).toLowerCase().includes(t)));
  }, [q.data, term, cfg]);

  const editing = mode?.kind === 'edit' ? mode.row : undefined;

  async function save(values: FormValues) {
    const m = mode?.kind === 'edit' ? 'edit' : 'create';
    let body = toBody(cfg.fields, values, m);
    if (cfg.shape) body = cfg.shape(body, m, editing);
    if (m === 'create') {
      await api.post(cfg.endpoint, body);
      toast(`${cap(cfg.noun)} added.`);
    } else {
      await api.put(`${cfg.endpoint}/${cfg.rowKey(editing as T)}`, body);
      toast(`${cap(cfg.noun)} updated.`);
    }
    setMode(null);
    await q.reload();
    cfg.onChanged?.();
  }

  async function remove(row: T) {
    setListError(null);
    try {
      await api.del(`${cfg.endpoint}/${cfg.rowKey(row)}`);
      toast(`${cap(cfg.noun)} deleted.`);
      if (editing && cfg.rowKey(editing) === cfg.rowKey(row)) setMode(null);
      await q.reload();
      cfg.onChanged?.();
    } catch (e) {
      setListError(`Couldn't delete ${cfg.rowLabel(row)}: ${(e as Error).message}`);
    }
  }

  const hasActions = q.data?.some((r) => cfg.canEdit(r) || cfg.canDelete(r));

  return (
    <>
      <PageHead
        title={cfg.title}
        lede={cfg.lede}
        hue={cfg.hue}
        actions={
          <>
            {cfg.headActions}
            {cfg.canCreate && (
              <button className="btn btn-primary" onClick={() => setMode({ kind: 'create' })}>
                <Plus size={16} aria-hidden />
                Add {cfg.noun}
              </button>
            )}
          </>
        }
      />
      <div className={`bench${mode ? ' open' : ''}`}>
        <div className="sheet">
          <div className="toolbar">
            <label className="search grow">
              <span className="sr-only">{cfg.searchLabel}</span>
              <Search size={15} aria-hidden />
              <input className="input" type="search" placeholder={cfg.searchLabel} value={term} onChange={(e) => setTerm(e.target.value)} />
            </label>
            {cfg.filters}
            <span className="count" aria-live="polite">
              {rows ? `${rows.length} of ${q.data?.length ?? 0}` : ''}
            </span>
          </div>
          {(q.error || listError) && (
            <div style={{ padding: '14px 16px 0' }}>
              <Notice>{listError ?? q.error?.message}</Notice>
            </div>
          )}
          <DataTable
            caption={cfg.title}
            rows={rows}
            loading={q.loading}
            columns={cfg.columns}
            rowKey={cfg.rowKey}
            activeKey={editing ? cfg.rowKey(editing) : null}
            initialSort={cfg.initialSort}
            empty={
              q.error ? null : term || cfg.filter ? (
                <Empty title={`No ${cfg.noun} records match`}>Try a different search, or clear the filters.</Empty>
              ) : (
                <Empty
                  title={`No ${cfg.noun} records yet`}
                  action={cfg.canCreate ? <button className="btn btn-primary" onClick={() => setMode({ kind: 'create' })}><Plus size={16} aria-hidden />Add the first {cfg.noun}</button> : undefined}
                >
                  {cfg.emptyHint}
                </Empty>
              )
            }
            actions={
              hasActions
                ? (row) => (
                    <>
                      {cfg.canEdit(row) && (
                        <button className="btn btn-text" onClick={() => setMode({ kind: 'edit', row })} aria-label={`Edit ${cfg.rowLabel(row)}`}>
                          Edit
                        </button>
                      )}
                      {cfg.canDelete(row) && <ConfirmDelete what={cfg.rowLabel(row)} onConfirm={() => remove(row)} />}
                    </>
                  )
                : undefined
            }
          />
        </div>
        {mode && (
          <EntityForm
            key={mode.kind === 'edit' ? `e${cfg.rowKey(mode.row)}` : 'c'}
            title={mode.kind === 'edit' ? `Edit ${cfg.rowLabel(mode.row)}` : `New ${cfg.noun}`}
            subtitle={mode.kind === 'edit' ? `${cap(cfg.noun)} #${cfg.rowKey(mode.row)}` : undefined}
            fields={cfg.fields}
            mode={mode.kind}
            initial={mode.kind === 'edit' ? cfg.toForm(mode.row) : cfg.blank(q.data)}
            submitLabel={mode.kind === 'edit' ? 'Save changes' : `Add ${cfg.noun}`}
            onSubmit={save}
            onCancel={() => setMode(null)}
          />
        )}
      </div>
      {cfg.below}
    </>
  );
}

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
