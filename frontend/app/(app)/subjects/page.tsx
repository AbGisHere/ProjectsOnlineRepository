'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, type KeyboardEvent } from 'react';
import { CrudPage } from '@/components/CrudPage';
import { DataTable } from '@/components/DataTable';
import { Chip } from '@/components/ui';
import { nextId, useApi } from '@/lib/hooks';
import { useSession } from '@/lib/session';
import type { Project } from '@/lib/types';

type Kind = 'technologies' | 'domains' | 'categories';
type Row = Record<string, string | number>;

const KINDS: Record<Kind, { title: string; noun: string; id: string; name: string; table: string; filter?: string; floor: number; lede: string }> = {
  technologies: { title: 'Technologies', noun: 'technology', id: 'TECHNOLOGY_ID', name: 'TECHNOLOGY_NAME', table: 'Project_Technology', filter: 'technology', floor: 4001, lede: 'Languages, frameworks and platforms that projects are built with.' },
  domains: { title: 'Domains', noun: 'domain', id: 'DOMAIN_ID', name: 'DOMAIN_NAME', table: 'Project_Domain', filter: 'domain', floor: 5001, lede: 'Subject areas such as AI, IoT or Blockchain.' },
  categories: { title: 'Categories', noun: 'category', id: 'CATEGORY_ID', name: 'CATEGORY_NAME', table: 'Project_Category', floor: 6001, lede: 'The kind of project: research, capstone, hackathon, industry-sponsored and so on.' },
};

export default function SubjectsPage() {
  return (
    <Suspense>
      <Subjects />
    </Suspense>
  );
}

function Subjects() {
  const params = useSearchParams();
  const router = useRouter();
  const kind = (params.get('tab') as Kind) in KINDS ? (params.get('tab') as Kind) : 'technologies';
  const order = Object.keys(KINDS) as Kind[];

  function onKey(e: KeyboardEvent<HTMLButtonElement>) {
    const i = order.indexOf(kind);
    if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      const next = order[(i + (e.key === 'ArrowRight' ? 1 : order.length - 1)) % order.length];
      router.replace(`/subjects?tab=${next}`);
      document.getElementById(`tab-${next}`)?.focus();
    }
  }

  return (
    <>
      <div className="tabs" role="tablist" aria-label="Subject headings">
        {order.map((k) => (
          <button
            key={k}
            id={`tab-${k}`}
            role="tab"
            aria-selected={k === kind}
            aria-controls="subject-panel"
            tabIndex={k === kind ? 0 : -1}
            onClick={() => router.replace(`/subjects?tab=${k}`)}
            onKeyDown={onKey}
          >
            {KINDS[k].title}
          </button>
        ))}
      </div>
      <div id="subject-panel" role="tabpanel" aria-labelledby={`tab-${kind}`}>
        <SubjectTable key={kind} kind={kind} />
      </div>
    </>
  );
}

function SubjectTable({ kind }: { kind: Kind }) {
  const { session } = useSession();
  const k = KINDS[kind];
  const admin = session?.role === 'admin';
  const links = useApi<Row[]>(`/${kind}/links/all`);
  const projects = useApi<Project[]>('/projects');
  const list = useApi<Row[]>(`/${kind}`);

  const titleOf = useMemo(() => new Map((projects.data ?? []).map((p) => [p.PROJECT_ID, p.TITLE])), [projects.data]);
  const nameOf = useMemo(() => new Map((list.data ?? []).map((r) => [Number(r[k.id]), String(r[k.name])])), [list.data, k]);
  const uses = (id: number) => (links.data ?? []).filter((l) => Number(l[k.id]) === id).length;

  return (
    <CrudPage<Row>
      query={list}
      noun={k.noun}
      title={k.title}
      hue="subject"
      lede={k.lede}
      endpoint={`/${kind}`}
      rowKey={(r) => Number(r[k.id])}
      rowLabel={(r) => String(r[k.name])}
      search={(r) => `${r[k.name]} ${r[k.id]}`}
      searchLabel={`Search ${k.title.toLowerCase()}…`}
      initialSort={{ key: k.id, dir: 'asc' }}
      onChanged={() => void links.reload()}
      columns={[
        { key: k.id, label: 'ID', mono: true, width: 90 },
        {
          key: k.name, label: 'Name',
          render: (r) => k.filter
            ? <Chip hue="subject" href={`/projects?${k.filter}=${encodeURIComponent(String(r[k.name]))}`}>{String(r[k.name])}</Chip>
            : <Chip hue="subject">{String(r[k.name])}</Chip>,
        },
        { key: 'uses', label: 'Projects', numeric: true, width: 110, sort: (r) => uses(Number(r[k.id])), render: (r) => (links.data ? uses(Number(r[k.id])) : '—') },
      ]}
      fields={[
        { name: k.id.toLowerCase(), label: `${k.noun.charAt(0).toUpperCase()}${k.noun.slice(1)} ID`, type: 'int', required: true, createOnly: true },
        { name: k.name.toLowerCase(), label: 'Name', required: true, wide: true },
      ]}
      blank={(rows) => ({ [k.id.toLowerCase()]: String(nextId(rows, k.id, k.floor)) })}
      toForm={(r) => ({ [k.id.toLowerCase()]: String(r[k.id]), [k.name.toLowerCase()]: String(r[k.name]) })}
      canCreate={admin || session?.role === 'faculty'}
      canEdit={() => admin}
      canDelete={() => admin}
      emptyHint={`Add ${k.title.toLowerCase()} so teams can tag their projects.`}
      below={
        <section className="section" aria-labelledby="links-h">
          <div className="section-head">
            <h2 id="links-h">{k.table} links</h2>
            <p>Every row of the junction table. Link and unlink from a project&apos;s page.</p>
          </div>
          <div className="sheet">
            <DataTable
              caption={`${k.table} rows`}
              rows={links.data}
              loading={links.loading}
              rowKey={(l) => `${l.PROJECT_ID}-${l[k.id]}`}
              initialSort={{ key: 'PROJECT_ID', dir: 'asc' }}
              columns={[
                { key: 'PROJECT_ID', label: 'Project ID', mono: true, width: 110 },
                { key: 'title', label: 'Project', sort: (l) => titleOf.get(Number(l.PROJECT_ID)) ?? '', render: (l) => <Link className="title-link" href={`/projects/${l.PROJECT_ID}`}>{titleOf.get(Number(l.PROJECT_ID)) ?? `Project #${l.PROJECT_ID}`}</Link> },
                { key: k.id, label: `${k.noun.charAt(0).toUpperCase()}${k.noun.slice(1)} ID`, mono: true, width: 130 },
                { key: 'name', label: k.noun.charAt(0).toUpperCase() + k.noun.slice(1), sort: (l) => nameOf.get(Number(l[k.id])) ?? '', render: (l) => <Chip hue="subject">{nameOf.get(Number(l[k.id])) ?? `#${l[k.id]}`}</Chip> },
              ]}
              empty={<p className="empty">No projects are linked yet.</p>}
            />
          </div>
        </section>
      }
    />
  );
}
