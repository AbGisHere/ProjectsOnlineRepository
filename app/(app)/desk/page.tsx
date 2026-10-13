'use client';

import { ArrowRight, Plus } from 'lucide-react';
import Link from 'next/link';
import { useMemo, type ReactNode } from 'react';
import { Shelf } from '@/components/Shelf';
import { Chip, Empty, HUE_VAR, Notice, PageHead, StatusTag } from '@/components/ui';
import { fmtDate, fmtScore } from '@/lib/format';
import { useApi } from '@/lib/hooks';
import { ROLE_LABEL, useSession } from '@/lib/session';
import { TABLES } from '@/lib/tables';
import type { Evaluation, GuidedTeam, Project, StudentProject, Team, TeamMember } from '@/lib/types';

export default function DeskPage() {
  const { session } = useSession();
  if (!session) return null;
  if (session.role === 'student') return <StudentDesk id={session.id} name={session.name} />;
  if (session.role === 'faculty') return <FacultyDesk id={session.id} name={session.name} />;
  return <AdminDesk name={session.name} />;
}

function Panel({ title, sub, action, children, className = 'span-6' }: { title: string; sub?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`${className} sheet sheet-pad`} aria-label={title}>
      <div className="section-head">
        <div>
          <h2>{title}</h2>
          {sub && <p style={{ marginTop: 3 }}>{sub}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/* ───────── Student ───────── */

function StudentDesk({ id, name }: { id: number; name: string }) {
  const history = useApi<StudentProject[]>(`/students/${id}/projects`);
  const members = useApi<TeamMember[]>('/team-members');
  const teams = useApi<Team[]>('/teams');
  const evals = useApi<Evaluation[]>('/evaluations');

  const myTeamIds = useMemo(() => new Set((members.data ?? []).filter((m) => m.STUDENT_ID === id).map((m) => m.TEAM_ID)), [members.data, id]);
  const myTeams = (teams.data ?? []).filter((t) => myTeamIds.has(t.TEAM_ID));
  const myProjectIds = new Set((history.data ?? []).map((p) => p.PROJECT_ID));
  const feedback = (evals.data ?? []).filter((e) => myProjectIds.has(e.PROJECT_ID)).sort((a, b) => String(b.EVALUATION_DATE).localeCompare(String(a.EVALUATION_DATE)));
  const teamSize = (tid: number) => (members.data ?? []).filter((m) => m.TEAM_ID === tid).length;

  return (
    <>
      <PageHead
        title={`${name}'s desk`}
        lede="Your teams, your reports and what faculty said about them."
        actions={
          <>
            <Link className="btn btn-quiet" href="/projects">Browse the repository</Link>
            {myTeams.length > 0 && <Link className="btn btn-primary" href="/projects?register=1"><Plus size={16} aria-hidden />Register a project</Link>}
          </>
        }
      />
      {history.error && <Notice>{history.error.message}</Notice>}
      <Shelf projects={history.data} title="Your reports" emptyText="You haven't got a report on the shelf yet. Join or create a team, then register a project." />
      <div className="desk-grid section">
        <Panel title="Your teams" sub="Teams you belong to, with their guide." action={<Link className="btn btn-text" href="/teams">All teams</Link>}>
          {myTeams.length ? (
            <div className="list">
              {myTeams.map((t) => (
                <div className="list-item" key={t.TEAM_ID}>
                  <div>
                    <Link href={`/teams/${t.TEAM_ID}`}>{t.TEAM_NAME}</Link>
                    <span className="sub">Guide: {t.GUIDE_NAME} · {t.LEADER_ID === id ? 'You lead this team' : `Led by ${t.LEADER_NAME}`}</span>
                  </div>
                  <span className="num" style={{ color: 'var(--muted)', fontSize: 13 }}>{teamSize(t.TEAM_ID)} members</span>
                </div>
              ))}
            </div>
          ) : (
            <Empty title={members.loading ? 'Loading…' : 'You’re not on a team yet'} action={!members.loading && <Link className="btn btn-primary" href="/teams"><Plus size={16} aria-hidden />Create a team</Link>}>
              {!members.loading && 'Create a team with yourself as leader and pick a faculty guide. Then you can register projects.'}
            </Empty>
          )}
        </Panel>
        <Panel title="Feedback on your work" sub="Faculty evaluations of your team's projects, newest first.">
          {feedback.length ? (
            <div className="list">
              {feedback.slice(0, 6).map((e) => (
                <div className="list-item" key={e.EVALUATION_ID}>
                  <div style={{ minWidth: 0 }}>
                    <Link href={`/projects/${e.PROJECT_ID}`}>{e.PROJECT_TITLE}</Link>
                    <span className="sub">{e.FACULTY_NAME} · {fmtDate(e.EVALUATION_DATE)}{e.FEEDBACK ? `: “${e.FEEDBACK}”` : ''}</span>
                  </div>
                  <span className="num" style={{ fontSize: 18, fontWeight: 600, color: 'var(--cloth)' }}>{fmtScore(e.SCORE)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>{evals.loading ? 'Loading…' : 'No evaluations yet. Your guide scores a project once it is submitted.'}</p>
          )}
        </Panel>
      </div>
    </>
  );
}

/* ───────── Faculty ───────── */

function FacultyDesk({ id, name }: { id: number; name: string }) {
  const guided = useApi<GuidedTeam[]>(`/faculty/${id}/guided-teams`);
  const projects = useApi<Project[]>('/projects');
  const evals = useApi<Evaluation[]>('/evaluations');

  const guidedIds = useMemo(() => new Set((guided.data ?? []).map((t) => t.TEAM_ID)), [guided.data]);
  const guidedProjects = (projects.data ?? []).filter((p) => guidedIds.has(p.TEAM_ID));
  const evaluatedByMe = new Set((evals.data ?? []).filter((e) => e.FACULTY_ID === id).map((e) => e.PROJECT_ID));
  const awaiting = (projects.data ?? []).filter((p) => (p.STATUS === 'SUBMITTED' || p.STATUS === 'COMPLETED') && !evaluatedByMe.has(p.PROJECT_ID))
    .sort((a, b) => Number(guidedIds.has(b.TEAM_ID)) - Number(guidedIds.has(a.TEAM_ID)));
  const mine = (evals.data ?? []).filter((e) => e.FACULTY_ID === id);

  return (
    <>
      <PageHead
        title={`${name}'s desk`}
        lede="Teams you guide, reports waiting for your evaluation, and the scores you've given."
        actions={<Link className="btn btn-quiet" href="/projects">Browse the repository</Link>}
      />
      <Shelf projects={projects.data ? guidedProjects : undefined} title="Reports from teams you guide" emptyText="None of your guided teams has registered a project yet." />
      <div className="desk-grid section">
        <Panel title="Awaiting your evaluation" sub="Submitted or completed projects you haven't scored. Your teams' projects come first." className="span-8">
          {awaiting.length ? (
            <div className="list">
              {awaiting.slice(0, 8).map((p) => (
                <div className="list-item" key={p.PROJECT_ID}>
                  <div style={{ minWidth: 0 }}>
                    <Link href={`/projects/${p.PROJECT_ID}`}>{p.TITLE}</Link>
                    <span className="sub">{p.TEAM_NAME} · {p.ACADEMIC_YEAR}{guidedIds.has(p.TEAM_ID) ? ' · your team' : ''}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                    <StatusTag s={p.STATUS} />
                    <Link className="btn btn-quiet btn-sm" href={`/projects/${p.PROJECT_ID}`} aria-label={`Evaluate ${p.TITLE}`}>Evaluate <ArrowRight size={13} aria-hidden /></Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>{projects.loading || evals.loading ? 'Loading…' : "You're up to date: every submitted project has your score."}</p>
          )}
        </Panel>
        <Panel title="Teams you guide" className="span-4" action={<Link className="btn btn-text" href="/teams">Manage</Link>}>
          {guided.data?.length ? (
            <div className="list">
              {guided.data.map((t) => (
                <div className="list-item" key={t.TEAM_ID}>
                  <div>
                    <Link href={`/teams/${t.TEAM_ID}`}>{t.TEAM_NAME}</Link>
                    <span className="sub">Led by {t.LEADER_NAME}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>{guided.loading ? 'Loading…' : 'You are not guiding a team yet.'}</p>
          )}
        </Panel>
        <Panel title="Your evaluations" sub={mine.length ? `${mine.length} given · average ${fmtScore(mine.reduce((s, e) => s + Number(e.SCORE), 0) / mine.length)}` : undefined} className="span-12" action={<Link className="btn btn-text" href="/evaluations">All evaluations</Link>}>
          {mine.length ? (
            <div className="list">
              {mine.slice(0, 5).map((e) => (
                <div className="list-item" key={e.EVALUATION_ID}>
                  <div style={{ minWidth: 0 }}>
                    <Link href={`/projects/${e.PROJECT_ID}`}>{e.PROJECT_TITLE}</Link>
                    <span className="sub">{fmtDate(e.EVALUATION_DATE)}{e.FEEDBACK ? ` · ${e.FEEDBACK}` : ''}</span>
                  </div>
                  <span className="num" style={{ fontSize: 18, fontWeight: 600, color: 'var(--cloth)' }}>{fmtScore(e.SCORE)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--muted)', fontSize: 14 }}>{evals.loading ? 'Loading…' : 'No evaluations yet.'}</p>
          )}
        </Panel>
      </div>
    </>
  );
}

/* ───────── Admin ───────── */

function Count({ path }: { path: string }) {
  const q = useApi<unknown[]>(path);
  return <>{q.error ? '!' : q.data ? q.data.length : '…'}</>;
}

function AdminDesk({ name }: { name: string }) {
  const projects = useApi<Project[]>('/projects');
  const evals = useApi<Evaluation[]>('/evaluations');
  const recent = [...(evals.data ?? [])].sort((a, b) => String(b.EVALUATION_DATE).localeCompare(String(a.EVALUATION_DATE))).slice(0, 6);
  const unscored = (projects.data ?? []).filter((p) => (p.STATUS === 'SUBMITTED' || p.STATUS === 'COMPLETED') && !(evals.data ?? []).some((e) => e.PROJECT_ID === p.PROJECT_ID));

  return (
    <>
      <PageHead
        title="The department shelf"
        lede={`Signed in as ${name} (${ROLE_LABEL.admin}). You can add, edit and delete every record.`}
        actions={
          <>
            <Link className="btn btn-quiet" href="/ledger">Open the ledger</Link>
            <Link className="btn btn-primary" href="/projects"><Plus size={16} aria-hidden />Register a project</Link>
          </>
        }
      />
      {projects.error && <Notice>{projects.error.message}</Notice>}
      <Shelf projects={projects.data} title="Every report, by academic year" />
      <div className="desk-grid section">
        <Panel title="Holdings" sub="Rows in each of the 13 tables." className="span-4" action={<Link className="btn btn-text" href="/ledger">Ledger</Link>}>
          <table className="holdings">
            <caption className="sr-only">Row counts per table</caption>
            <tbody>
              {TABLES.map((t) => (
                <tr key={t.table}>
                  <td>
                    <Link href={t.screen}>
                      <span className="hue-mark" style={{ background: HUE_VAR[t.hue], borderRadius: t.kind === 'junction' ? '50%' : 2 }} aria-hidden />
                      {t.table}
                    </Link>
                  </td>
                  <td><Count path={t.path} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </Panel>
        <div className="span-8" style={{ display: 'grid', gap: 20, alignContent: 'start' }}>
          <Panel title="Submitted but not yet evaluated" sub="Completed or submitted projects with no faculty score yet." className="">
            {unscored.length ? (
              <div className="list">
                {unscored.map((p) => (
                  <div className="list-item" key={p.PROJECT_ID}>
                    <div>
                      <Link href={`/projects/${p.PROJECT_ID}`}>{p.TITLE}</Link>
                      <span className="sub">{p.TEAM_NAME} · {p.ACADEMIC_YEAR}</span>
                    </div>
                    <StatusTag s={p.STATUS} />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>{projects.loading || evals.loading ? 'Loading…' : 'Every submitted project has at least one evaluation.'}</p>
            )}
          </Panel>
          <Panel title="Latest evaluations" className="" action={<Link className="btn btn-text" href="/evaluations">All</Link>}>
            {recent.length ? (
              <div className="list">
                {recent.map((e) => (
                  <div className="list-item" key={e.EVALUATION_ID}>
                    <div style={{ minWidth: 0 }}>
                      <Link href={`/projects/${e.PROJECT_ID}`}>{e.PROJECT_TITLE}</Link>
                      <span className="sub" style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 4 }}>
                        <Chip hue="people" href={`/faculty/${e.FACULTY_ID}`}>{e.FACULTY_NAME}</Chip>
                        {fmtDate(e.EVALUATION_DATE)}
                      </span>
                    </div>
                    <span className="num" style={{ fontSize: 18, fontWeight: 600, color: 'var(--cloth)' }}>{fmtScore(e.SCORE)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>{evals.loading ? 'Loading…' : 'No evaluations on record.'}</p>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
