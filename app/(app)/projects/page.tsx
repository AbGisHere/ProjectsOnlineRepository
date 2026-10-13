'use client';

import { Plus, Search } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { EntityForm, toBody, type FormValues } from '@/components/EntityForm';
import { Shelf } from '@/components/Shelf';
import { useToast } from '@/components/Toast';
import { Chip, ConfirmDelete, Empty, Notice, PageHead, StatusTag } from '@/components/ui';
import { api } from '@/lib/api';
import { fmtScore, STATUS_LABEL } from '@/lib/format';
import { nextId, useApi } from '@/lib/hooks';
import { currentAcademicYear, projectFields, projectToForm } from '@/lib/projectForm';
import { useMyTeams } from '@/lib/scope';
import { useSession } from '@/lib/session';
import { STATUSES, type Department, type Domain, type Evaluation, type Project, type Status, type Technology } from '@/lib/types';

export default function RepositoryPage() {
  return (
    <Suspense>
      <Repository />
    </Suspense>
  );
}

function Repository() {
  const { session } = useSession();
  const toast = useToast();
  const router = useRouter();
  const params = useSearchParams();

  const [title, setTitle] = useState(params.get('title') ?? '');
  const [domain, setDomain] = useState(params.get('domain') ?? '');
  const [technology, setTechnology] = useState(params.get('technology') ?? '');
  const [department, setDepartment] = useState(params.get('department') ?? '');
  const [year, setYear] = useState(params.get('year') ?? '');
  const [status, setStatus] = useState<Status | ''>((params.get('status') as Status) ?? '');

  const qs = new URLSearchParams();
  if (title.trim()) qs.set('title', title.trim());
  if (domain) qs.set('domain', domain);
  if (technology) qs.set('technology', technology);
  if (department) qs.set('department', department);
  if (year) qs.set('year', year);
  const filtered = qs.toString().length > 0;

  const all = useApi<Project[]>('/projects');
  const found = useApi<Project[]>(filtered ? `/projects/search?${qs}` : null);
  const domains = useApi<Domain[]>('/domains');
  const techs = useApi<Technology[]>('/technologies');
  const depts = useApi<Department[]>('/departments');
  const evals = useApi<Evaluation[]>('/evaluations');
  const mine = useMyTeams();

  const [lit, setLit] = useState<Set<number> | null>(null);
  const [mode, setMode] = useState<null | { kind: 'create' } | { kind: 'edit'; row: Project }>(params.get('register') ? { kind: 'create' } : null);
  const [listError, setListError] = useState<string | null>(null);

  const source = filtered ? found : all;
  const rows = useMemo(() => (source.data ?? undefined)?.filter((p) => !status || p.STATUS === status), [source.data, status]);
  const years = useMemo(() => [...new Set((all.data ?? []).map((p) => p.ACADEMIC_YEAR))].sort().reverse(), [all.data]);

  const scores = useMemo(() => {
    const m = new Map<number, { sum: number; n: number }>();
    for (const e of evals.data ?? []) {
      const s = m.get(e.PROJECT_ID) ?? { sum: 0, n: 0 };
      s.sum += Number(e.SCORE);
      s.n += 1;
      m.set(e.PROJECT_ID, s);
    }
    return m;
  }, [evals.data]);

  const teamProjects = (teamId: number) => new Set((rows ?? []).filter((p) => p.TEAM_ID === teamId).map((p) => p.PROJECT_ID));
  const canWrite = (p: Project) => mine.ids.has(p.TEAM_ID);
  const canCreate = session?.role === 'admin' || mine.ids.size > 0;
  const teamOptions = (mine.teams.data ?? []).filter((t) => mine.ids.has(t.TEAM_ID));
  const editing = mode?.kind === 'edit' ? mode.row : undefined;

  function clear() {
    setTitle(''); setDomain(''); setTechnology(''); setDepartment(''); setYear(''); setStatus('');
    router.replace('/projects');
  }

  async function save(values: FormValues) {
    const fields = projectFields(teamOptions);
    if (mode?.kind === 'edit') {
      await api.put(`/projects/${mode.row.PROJECT_ID}`, toBody(fields, values, 'edit'));
      toast('Project updated.');
    } else {
      const body = toBody(fields, values, 'create');
      await api.post('/projects', body);
      toast('Project added to the shelf.');
      router.push(`/projects/${body.project_id}`);
    }
    setMode(null);
    await Promise.all([all.reload(), found.reload()]);
  }

  async function remove(p: Project) {
    setListError(null);
    try {
      await api.del(`/projects/${p.PROJECT_ID}`);
      toast('Project deleted.');
      await Promise.all([all.reload(), found.reload(), evals.reload()]);
    } catch (e) {
      setListError(`Couldn't delete “${p.TITLE}”: ${(e as Error).message}`);
    }
  }

  return (
    <>
      <PageHead
        title="Repository"
        hue="project"
        lede="Every project the department has on record, shelved by academic year. Filter by domain, technology, department or year. Pull any report to read its full record."
        actions={canCreate && (
          <button className="btn btn-primary" onClick={() => setMode({ kind: 'create' })}>
            <Plus size={16} aria-hidden />
            Register a project
          </button>
        )}
      />

      <Shelf
        projects={rows}
        title={filtered || status ? 'Matching reports' : 'The department shelf'}
        lit={lit}
        onHover={(id) => setLit(id ? new Set([id]) : null)}
        emptyText="No reports match these filters."
      />

      <div className={`bench${mode ? ' open' : ''}`} style={{ marginTop: 20 }}>
        <div className="sheet">
          <form className="toolbar" role="search" onSubmit={(e) => e.preventDefault()} aria-label="Filter projects">
            <label className="search grow">
              <span className="sr-only">Search project titles</span>
              <Search size={15} aria-hidden />
              <input className="input" type="search" placeholder="Search titles…" value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <FilterSelect label="Domain" value={domain} onChange={setDomain} options={(domains.data ?? []).map((d) => d.DOMAIN_NAME)} />
            <FilterSelect label="Technology" value={technology} onChange={setTechnology} options={(techs.data ?? []).map((t) => t.TECHNOLOGY_NAME)} />
            <FilterSelect label="Department" value={department} onChange={setDepartment} options={(depts.data ?? []).map((d) => d.DEPARTMENT_NAME)} />
            <FilterSelect label="Year" value={year} onChange={setYear} options={years} />
            <FilterSelect label="Status" value={status} onChange={(v) => setStatus(v as Status | '')} options={STATUSES} labels={STATUS_LABEL} />
            {(filtered || status) && <button type="button" className="btn btn-text" onClick={clear}>Clear filters</button>}
            <span className="count" aria-live="polite">{rows ? `${rows.length} ${rows.length === 1 ? 'project' : 'projects'}` : ''}</span>
          </form>
          {(source.error || listError) && <div style={{ padding: '14px 16px 0' }}><Notice>{listError ?? source.error?.message}</Notice></div>}
          <DataTable
            caption="Projects"
            rows={rows}
            loading={source.loading}
            rowKey={(p) => p.PROJECT_ID}
            activeKey={editing?.PROJECT_ID ?? null}
            litKeys={lit}
            initialSort={{ key: 'ACADEMIC_YEAR', dir: 'desc' }}
            columns={[
              { key: 'PROJECT_ID', label: 'ID', mono: true, width: 70 },
              {
                key: 'TITLE', label: 'Title',
                render: (p) => <Link className="title-link" href={`/projects/${p.PROJECT_ID}`}>{p.TITLE}</Link>,
              },
              {
                key: 'TEAM_NAME', label: 'Team',
                render: (p) => (
                  <Chip hue="team" href={`/teams/${p.TEAM_ID}`} onHover={(on) => setLit(on ? teamProjects(p.TEAM_ID) : null)}>
                    {p.TEAM_NAME}
                  </Chip>
                ),
              },
              { key: 'ACADEMIC_YEAR', label: 'Year', mono: true, width: 110 },
              { key: 'STATUS', label: 'Status', render: (p) => <StatusTag s={p.STATUS} />, width: 130 },
              {
                key: 'avg', label: 'Avg score', numeric: true, width: 100,
                sort: (p) => { const s = scores.get(p.PROJECT_ID); return s ? s.sum / s.n : null; },
                render: (p) => { const s = scores.get(p.PROJECT_ID); return s ? fmtScore(s.sum / s.n) : <span style={{ color: 'var(--muted)' }}>—</span>; },
              },
            ]}
            empty={
              source.error ? null : filtered || status ? (
                <Empty title="No projects match" action={<button className="btn btn-quiet" onClick={clear}>Clear filters</button>}>
                  Nothing on record fits every filter at once. Loosen one, or search a shorter title.
                </Empty>
              ) : (
                <Empty title="The shelf is empty" action={canCreate ? <button className="btn btn-primary" onClick={() => setMode({ kind: 'create' })}><Plus size={16} aria-hidden />Register the first project</button> : undefined}>
                  Projects appear here once a team registers one.
                </Empty>
              )
            }
            actions={(p) =>
              canWrite(p) ? (
                <>
                  <button className="btn btn-text" onClick={() => setMode({ kind: 'edit', row: p })} aria-label={`Edit ${p.TITLE}`}>Edit</button>
                  {(session?.role === 'admin' || session?.role === 'student') && <ConfirmDelete what={p.TITLE} onConfirm={() => remove(p)} />}
                </>
              ) : null
            }
          />
        </div>
        {mode && (
          <EntityForm
            key={mode.kind === 'edit' ? `e${mode.row.PROJECT_ID}` : 'c'}
            title={mode.kind === 'edit' ? 'Edit project' : 'Register a project'}
            subtitle={mode.kind === 'edit' ? mode.row.TITLE : 'Technologies, domains and categories are added on the project page after it is saved.'}
            fields={projectFields(teamOptions)}
            mode={mode.kind}
            initial={
              mode.kind === 'edit'
                ? projectToForm(mode.row)
                : {
                    project_id: String(nextId(all.data, 'PROJECT_ID', 7001)),
                    academic_year: currentAcademicYear(),
                    status: 'ONGOING',
                    team_id: teamOptions.length === 1 ? String(teamOptions[0].TEAM_ID) : '',
                  }
            }
            submitLabel={mode.kind === 'edit' ? 'Save changes' : 'Register project'}
            onSubmit={save}
            onCancel={() => setMode(null)}
          />
        )}
      </div>
    </>
  );
}

function FilterSelect({ label, value, onChange, options, labels }: {
  label: string; value: string; onChange: (v: string) => void; options: readonly string[]; labels?: Record<string, string>;
}) {
  return (
    <label>
      <span className="sr-only">{label}</span>
      <select className="select filter-select" value={value} onChange={(e) => onChange(e.target.value)} style={value ? { borderColor: 'var(--cloth)', fontWeight: 600 } : undefined}>
        <option value="">{`Any ${label.toLowerCase()}`}</option>
        {options.map((o) => <option key={o} value={o}>{labels?.[o] ?? o}</option>)}
      </select>
    </label>
  );
}
