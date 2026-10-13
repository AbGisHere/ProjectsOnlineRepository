'use client';

import { ExternalLink, Pencil, Plus } from 'lucide-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useMemo, useState } from 'react';
import { EntityForm, toBody, type FieldDef, type FormValues } from '@/components/EntityForm';
import { useToast } from '@/components/Toast';
import { Chip, ConfirmDelete, Notice, PageHead, StatusTag } from '@/components/ui';
import { api } from '@/lib/api';
import { fmtDate, fmtScore } from '@/lib/format';
import { nextId, useApi } from '@/lib/hooks';
import { projectFields, projectToForm } from '@/lib/projectForm';
import { useMyTeams } from '@/lib/scope';
import { useSession } from '@/lib/session';
import type {
  AverageScore, Category, Domain, Evaluation, Project, ProjectEvaluation, Team, TeamMemberDetail, Technology,
} from '@/lib/types';

type LinkKind = 'technologies' | 'domains' | 'categories';

export default function ProjectRecord() {
  const { id } = useParams<{ id: string }>();
  const { session } = useSession();
  const toast = useToast();
  const router = useRouter();

  const project = useApi<Project>(`/projects/${id}`);
  const p = project.data;
  const team = useApi<Team>(p ? `/teams/${p.TEAM_ID}` : null);
  const members = useApi<TeamMemberDetail[]>(p ? `/teams/${p.TEAM_ID}/members` : null);
  const techs = useApi<Technology[]>(`/projects/${id}/technologies`);
  const doms = useApi<Domain[]>(`/projects/${id}/domains`);
  const cats = useApi<Category[]>(`/projects/${id}/categories`);
  const evals = useApi<ProjectEvaluation[]>(`/projects/${id}/evaluations`);
  const avg = useApi<AverageScore>(`/projects/${id}/average-score`);
  const allEvals = useApi<Evaluation[]>('/evaluations');
  const mine = useMyTeams();

  const [editing, setEditing] = useState(false);
  const [evalMode, setEvalMode] = useState<null | { kind: 'create' } | { kind: 'edit'; row: ProjectEvaluation }>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  const canWrite = !!p && mine.ids.has(p.TEAM_ID);
  const isFaculty = session?.role === 'faculty';
  const isAdmin = session?.role === 'admin';
  const myEval = evals.data?.find((e) => isFaculty && e.FACULTY_ID === session?.id);
  const teamOptions = (mine.teams.data ?? []).filter((t) => mine.ids.has(t.TEAM_ID));

  async function saveProject(values: FormValues) {
    await api.put(`/projects/${id}`, toBody(projectFields(teamOptions), values, 'edit'));
    toast('Project record updated.');
    setEditing(false);
    await project.reload();
  }

  async function deleteProject() {
    try {
      await api.del(`/projects/${id}`);
      toast('Project deleted.');
      router.replace('/projects');
    } catch (e) {
      setLinkError((e as Error).message);
    }
  }

  const evalFields: FieldDef[] = [
    { name: 'score', label: 'Score (0–100)', type: 'decimal', required: true, min: 0, max: 100 },
    { name: 'feedback', label: 'Feedback', type: 'textarea', placeholder: 'What worked, what to fix before final submission.' },
  ];

  async function saveEval(values: FormValues) {
    const body = toBody(evalFields, values, 'create');
    if (evalMode?.kind === 'edit') {
      await api.put(`/evaluations/${evalMode.row.EVALUATION_ID}`, body);
      toast('Evaluation updated.');
    } else {
      await api.post('/evaluations', {
        evaluation_id: nextId(allEvals.data, 'EVALUATION_ID', 1),
        project_id: Number(id),
        faculty_id: session!.id,
        ...body,
      });
      toast('Evaluation recorded.');
    }
    setEvalMode(null);
    await Promise.all([evals.reload(), avg.reload(), allEvals.reload()]);
  }

  async function deleteEval(e: ProjectEvaluation) {
    await api.del(`/evaluations/${e.EVALUATION_ID}`);
    toast('Evaluation removed.');
    await Promise.all([evals.reload(), avg.reload(), allEvals.reload()]);
  }

  if (project.error) {
    return (
      <>
        <PageHead title="Project not found" crumbs={[{ href: '/projects', label: 'Repository' }]} />
        <Notice>{project.error.status === 404 ? `There is no project #${id} on record. It may have been deleted.` : project.error.message}</Notice>
      </>
    );
  }

  const a = avg.data;

  return (
    <>
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link href="/projects">Repository</Link>
        <span aria-hidden>/</span>
        <span>{p?.ACADEMIC_YEAR ?? '…'}</span>
      </nav>

      <div className="record">
        <div className="record-main">
          <div className="record-title">
            <div className="spine record-spine" data-s={p?.STATUS ?? 'ONGOING'} aria-hidden style={{ transform: 'none' }}>
              <span className="spine-id" style={{ marginTop: 'auto' }}>{String(id).slice(-3)}</span>
            </div>
            <div style={{ minWidth: 0, flex: 1 }}>
              <h1>{p?.TITLE ?? <span className="sk" style={{ width: 320, height: 28 }} />}</h1>
              <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginTop: 12, flexWrap: 'wrap' }}>
                {p && <StatusTag s={p.STATUS} />}
                <span className="num" style={{ color: 'var(--muted)', fontSize: 13 }}>Project #{id}</span>
                {canWrite && !editing && (
                  <button className="btn btn-quiet btn-sm" onClick={() => setEditing(true)}>
                    <Pencil size={13} aria-hidden />
                    Edit record
                  </button>
                )}
                {canWrite && (isAdmin || session?.role === 'student') && <ConfirmDelete what={p?.TITLE ?? 'project'} label="Delete project" onConfirm={deleteProject} />}
              </div>
            </div>
          </div>

          {linkError && <Notice>{linkError}</Notice>}

          {editing && p && (
            <EntityForm
              title="Edit project record"
              fields={projectFields(teamOptions)}
              mode="edit"
              initial={projectToForm(p)}
              submitLabel="Save changes"
              onSubmit={saveProject}
              onCancel={() => setEditing(false)}
            />
          )}

          <section className="sheet sheet-pad" aria-label="Record">
            <dl className="meta">
              <div><dt>Academic year</dt><dd className="num">{p?.ACADEMIC_YEAR ?? '—'}</dd></div>
              <div><dt>Team</dt><dd>{p ? <Chip hue="team" href={`/teams/${p.TEAM_ID}`}>{p.TEAM_NAME}</Chip> : '—'}</dd></div>
              <div><dt>Team leader</dt><dd>{team.data ? <Chip hue="people" href={`/students/${team.data.LEADER_ID}`}>{team.data.LEADER_NAME}</Chip> : '—'}</dd></div>
              <div><dt>Guide</dt><dd>{team.data ? <Chip hue="people" href={`/faculty/${team.data.GUIDE_ID}`}>{team.data.GUIDE_NAME}</Chip> : '—'}</dd></div>
              <div><dt>Submitted</dt><dd>{fmtDate(p?.SUBMISSION_DATE)}</dd></div>
              <div>
                <dt>Repository</dt>
                <dd>
                  {p?.GITURL ? (
                    <a href={p.GITURL} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', gap: 5, alignItems: 'center', wordBreak: 'break-all' }}>
                      {p.GITURL.replace(/^https?:\/\/(www\.)?/, '')}
                      <ExternalLink size={13} aria-hidden style={{ flex: 'none' }} />
                    </a>
                  ) : '—'}
                </dd>
              </div>
            </dl>
            <h2 style={{ fontSize: 14, color: 'var(--muted)', marginTop: 24, marginBottom: 8 }}>Abstract</h2>
            <p className="abstract">{p?.ABSTRACT || (p ? 'No abstract on record yet.' : '')}</p>
          </section>

          <section className="sheet sheet-pad" aria-labelledby="tr-h">
            <div className="section-head" style={{ marginBottom: 16 }}>
              <h2 id="tr-h">Tracings</h2>
              <p>Every record this project is linked to.</p>
            </div>
            <div className="trace">
              <LinkRow kind="domains" label="Domains" hue="subject" projectId={id} canEdit={canWrite} q={doms}
                idKey="DOMAIN_ID" nameKey="DOMAIN_NAME" allPath="/domains" onError={setLinkError} filterParam="domain" />
              <LinkRow kind="technologies" label="Technologies" hue="subject" projectId={id} canEdit={canWrite} q={techs}
                idKey="TECHNOLOGY_ID" nameKey="TECHNOLOGY_NAME" allPath="/technologies" onError={setLinkError} filterParam="technology" />
              <LinkRow kind="categories" label="Categories" hue="subject" projectId={id} canEdit={canWrite} q={cats}
                idKey="CATEGORY_ID" nameKey="CATEGORY_NAME" allPath="/categories" onError={setLinkError} />
              <div className="trace-row">
                <span>Members</span>
                <div className="chips">
                  {members.data?.length
                    ? members.data.map((m) => (
                        <Chip key={m.STUDENT_ID} hue="people" href={`/students/${m.STUDENT_ID}`}>{m.NAME}</Chip>
                      ))
                    : <span style={{ color: 'var(--muted)', fontSize: 14 }}>{members.loading ? 'Loading…' : 'No members listed.'}</span>}
                </div>
              </div>
            </div>
          </section>
        </div>

        <aside style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
          <section className="sheet cert" aria-labelledby="cert-h">
            <h2 id="cert-h">Evaluation Certificate</h2>
            <p className="lede">
              {a && a.EVALUATION_COUNT > 0
                ? `Assessed by ${a.EVALUATION_COUNT} ${a.EVALUATION_COUNT === 1 ? 'member' : 'members'} of faculty.`
                : 'Not yet evaluated by any member of faculty.'}
            </p>
            <div className="big" aria-label={a?.AVERAGE_SCORE != null ? `Average score ${fmtScore(a.AVERAGE_SCORE)} out of 100` : 'No average score yet'}>
              {a?.AVERAGE_SCORE != null ? fmtScore(a.AVERAGE_SCORE) : '—'}
              <small> / 100</small>
            </div>
            {a && a.EVALUATION_COUNT > 1 && (
              <p className="range num">Range {fmtScore(a.MIN_SCORE)}–{fmtScore(a.MAX_SCORE)}</p>
            )}
            {evals.data && evals.data.length > 0 && (
              <div className="sigs">
                {evals.data.map((e) => (
                  <div className="sig" key={e.EVALUATION_ID}>
                    <b>{e.FACULTY_NAME}</b>
                    <span className="num">{fmtScore(e.SCORE)}</span>
                    {e.FEEDBACK && <p>{e.FEEDBACK}</p>}
                    <p className="num" style={{ fontSize: 12 }}>{fmtDate(e.EVALUATION_DATE)}</p>
                    {(isAdmin || (isFaculty && e.FACULTY_ID === session?.id)) && (
                      <div className="acts">
                        <button className="btn btn-text" onClick={() => setEvalMode({ kind: 'edit', row: e })}>Edit</button>
                        <ConfirmDelete what={`evaluation by ${e.FACULTY_NAME}`} onConfirm={() => deleteEval(e)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
            {isFaculty && !myEval && !evalMode && (
              <button className="btn btn-primary" style={{ marginTop: 20, position: 'relative', zIndex: 1 }} onClick={() => setEvalMode({ kind: 'create' })}>
                <Plus size={16} aria-hidden />
                Add your evaluation
              </button>
            )}
          </section>
          {evalMode && (
            <EntityForm
              title={evalMode.kind === 'edit' ? 'Edit evaluation' : 'Evaluate this project'}
              subtitle={evalMode.kind === 'edit' ? `By ${evalMode.row.FACULTY_NAME}` : `Signed as ${session?.name}`}
              fields={evalFields}
              mode="create"
              initial={evalMode.kind === 'edit' ? { score: String(evalMode.row.SCORE), feedback: evalMode.row.FEEDBACK ?? '' } : { score: '', feedback: '' }}
              submitLabel={evalMode.kind === 'edit' ? 'Save evaluation' : 'Sign evaluation'}
              onSubmit={saveEval}
              onCancel={() => setEvalMode(null)}
            />
          )}
        </aside>
      </div>
    </>
  );
}

function LinkRow<T extends Record<string, unknown>>({
  kind, label, hue, projectId, canEdit, q, idKey, nameKey, allPath, onError, filterParam,
}: {
  kind: LinkKind; label: string; hue: 'subject'; projectId: string; canEdit: boolean;
  q: { data: T[] | undefined; loading: boolean; reload: () => Promise<void> };
  idKey: keyof T & string; nameKey: keyof T & string; allPath: string;
  onError: (m: string | null) => void; filterParam?: string;
}) {
  const toast = useToast();
  const all = useApi<T[]>(canEdit ? allPath : null);
  const [pick, setPick] = useState('');
  const [busy, setBusy] = useState(false);
  const linked = useMemo(() => new Set((q.data ?? []).map((r) => Number(r[idKey]))), [q.data, idKey]);
  const available = (all.data ?? []).filter((r) => !linked.has(Number(r[idKey])));
  const bodyKey = idKey.toLowerCase();

  async function add() {
    if (!pick) return;
    setBusy(true);
    onError(null);
    try {
      await api.post(`/projects/${projectId}/${kind}`, { [bodyKey]: Number(pick) });
      setPick('');
      toast(`${label.replace(/ies$/, 'y').replace(/s$/, '')} linked.`);
      await q.reload();
    } catch (e) {
      onError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(otherId: number) {
    onError(null);
    try {
      await api.del(`/projects/${projectId}/${kind}/${otherId}`);
      await q.reload();
    } catch (e) {
      onError((e as Error).message);
    }
  }

  return (
    <div className="trace-row">
      <span>{label}</span>
      <div>
        <div className="chips">
          {q.data?.length ? (
            q.data.map((r) => {
              const name = String(r[nameKey]);
              return (
                <Chip
                  key={String(r[idKey])}
                  hue={hue}
                  href={filterParam ? `/projects?${filterParam}=${encodeURIComponent(name)}` : undefined}
                  onRemove={canEdit ? () => remove(Number(r[idKey])) : undefined}
                  removeLabel={`Unlink ${name}`}
                >
                  {name}
                </Chip>
              );
            })
          ) : (
            <span style={{ color: 'var(--muted)', fontSize: 14 }}>{q.loading ? 'Loading…' : `No ${label.toLowerCase()} linked.`}</span>
          )}
        </div>
        {canEdit && (
          <div className="link-add">
            <label className="sr-only" htmlFor={`add-${kind}`}>Link a {label.toLowerCase()} entry</label>
            <select id={`add-${kind}`} className="select" value={pick} onChange={(e) => setPick(e.target.value)} disabled={busy || available.length === 0}>
              <option value="">{available.length ? `Link ${label.toLowerCase()}…` : `All ${label.toLowerCase()} linked`}</option>
              {available.map((r) => <option key={String(r[idKey])} value={String(r[idKey])}>{String(r[nameKey])}</option>)}
            </select>
            <button type="button" className="btn btn-quiet btn-sm" onClick={add} disabled={!pick || busy}>Link</button>
          </div>
        )}
      </div>
    </div>
  );
}
