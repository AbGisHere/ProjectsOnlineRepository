'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { DataTable } from '@/components/DataTable';
import { HUE_VAR, Notice, PageHead } from '@/components/ui';
import { useApi } from '@/lib/hooks';
import { TABLES } from '@/lib/tables';


export default function LedgerPage() {
  return (
    <Suspense>
      <Ledger />
    </Suspense>
  );
}

function Ledger() {
  const params = useSearchParams();
  const router = useRouter();
  const selected = TABLES.find((t) => t.table === params.get('t')) ?? TABLES[5];
  const rows = useApi<Record<string, unknown>[]>(selected.path);
  const keys = rows.data?.[0] ? Object.keys(rows.data[0]) : [];

  return (
    <>
      <PageHead
        title="Ledger"
        lede="All 13 tables in the schema, exactly as the API returns them. Pick a table to read its rows; use the linked screen to change them."
      />
      <div className="desk-grid">
        <section className="span-4 sheet sheet-pad" aria-labelledby="tbl-h" style={{ alignSelf: 'start' }}>
          <h2 id="tbl-h" style={{ fontSize: 16, marginBottom: 8 }}>Tables</h2>
          <table className="holdings">
            <tbody>
              {TABLES.map((t) => (
                <tr key={t.table}>
                  <td>
                    <button
                      type="button"
                      onClick={() => router.replace(`/ledger?t=${t.table}`)}
                      aria-pressed={t.table === selected.table}
                      style={{
                        background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'inline-flex', alignItems: 'center',
                        fontWeight: t.table === selected.table ? 700 : 500, color: t.table === selected.table ? 'var(--cloth)' : 'var(--ink)',
                        textDecoration: t.table === selected.table ? 'underline' : 'none', textUnderlineOffset: 3,
                      }}
                    >
                      <span className="hue-mark" style={{ background: HUE_VAR[t.hue], borderRadius: t.kind === 'junction' ? '50%' : 2 }} aria-hidden />
                      {t.table}
                    </button>
                    {t.kind === 'junction' && <span className="kind">link table</span>}
                  </td>
                  <td><Link href={t.screen} style={{ fontSize: 13, color: 'var(--muted)' }}>Manage</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: 13, color: 'var(--muted)', marginTop: 14, lineHeight: 1.55 }}>
            The extra <b>Admin</b> table holds admin logins only. The API doesn&apos;t list it, so it doesn&apos;t appear here.
          </p>
        </section>

        <section className="span-8" aria-labelledby="rows-h">
          <div className="section-head">
            <h2 id="rows-h">{selected.table}</h2>
            <p className="num">GET /api{selected.path} · {rows.data ? `${rows.data.length} rows` : '…'}</p>
          </div>
          {rows.error && <Notice>{rows.error.message}</Notice>}
          <div className="sheet">
            <DataTable
              key={selected.table}
              caption={`${selected.table} rows`}
              rows={rows.data}
              loading={rows.loading}
              rowKey={(r) => keys.map((k) => String(r[k])).slice(0, 2).join('-')}
              columns={keys.map((k) => ({
                key: k,
                label: k,
                mono: /_ID$|YEAR|SCORE|CREDITS/.test(k),
                render: (r: Record<string, unknown>) => {
                  const v = r[k];
                  if (v === null || v === undefined) return <span style={{ color: 'var(--muted)' }}>NULL</span>;
                  const s = String(v);
                  return s.length > 80 ? `${s.slice(0, 80)}…` : s;
                },
              }))}
              empty={<p className="empty">This table has no rows.</p>}
            />
          </div>
        </section>
      </div>
    </>
  );
}
