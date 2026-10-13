'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DataTable } from '@/components/DataTable';
import { Chip, Notice, PageHead } from '@/components/ui';
import { fmtDate, fmtScore } from '@/lib/format';
import { useApi } from '@/lib/hooks';
import { useDepartments } from '@/lib/useDepartments';
import type { Evaluation, Faculty, GuidedTeam } from '@/lib/types';

export default function FacultyRecord() {
  const { id } = useParams<{ id: string }>();
  const fac = useApi<Faculty>(`/faculty/${id}`);
  const guided = useApi<GuidedTeam[]>(`/faculty/${id}/guided-teams`);
  const evals = useApi<Evaluation[]>('/evaluations');
  const depts = useDepartments();
  const f = fac.data;
  const given = (evals.data ?? []).filter((e) => e.FACULTY_ID === Number(id));

  if (fac.error) {
    return (
      <>
        <PageHead title="Faculty member not found" crumbs={[{ href: '/faculty', label: 'Faculty' }]} />
        <Notice>{fac.error.status === 404 ? `There is no faculty member #${id}.` : fac.error.message}</Notice>
      </>
    );
  }

  return (
    <>
      <PageHead crumbs={[{ href: '/faculty', label: 'Faculty' }]} title={f?.NAME ?? '…'} hue="people" lede={f && `${f.DESIGNATION ?? 'Faculty'} · ${depts.name(f.DEPARTMENT_ID)}`} />
      <section className="sheet sheet-pad">
        <dl className="meta">
          <div><dt>Faculty ID</dt><dd className="num">{f?.FACULTY_ID ?? '—'}</dd></div>
          <div><dt>Email</dt><dd>{f?.EMAIL ?? '—'}</dd></div>
          <div><dt>Score</dt><dd className="num">{fmtScore(f?.SCORE)}</dd></div>
          <div><dt>Teams guided</dt><dd className="num">{guided.data?.length ?? '—'}</dd></div>
          <div><dt>Evaluations given</dt><dd className="num">{evals.data ? given.length : '—'}</dd></div>
        </dl>
      </section>

      <div className="desk-grid section">
        <section className="span-6" aria-labelledby="g-h">
          <div className="section-head"><h2 id="g-h">Guided teams</h2></div>
          <div className="sheet">
            <DataTable
              caption="Guided teams"
              rows={guided.data}
              loading={guided.loading}
              rowKey={(t) => t.TEAM_ID}
              columns={[
                { key: 'TEAM_NAME', label: 'Team', render: (t) => <Chip hue="team" href={`/teams/${t.TEAM_ID}`}>{t.TEAM_NAME}</Chip> },
                { key: 'LEADER_NAME', label: 'Leader', render: (t) => <Chip hue="people" href={`/students/${t.LEADER_ID}`}>{t.LEADER_NAME}</Chip> },
              ]}
              empty={<p className="empty">Not guiding any team.</p>}
            />
          </div>
        </section>
        <section className="span-6" aria-labelledby="e-h">
          <div className="section-head"><h2 id="e-h">Evaluations given</h2></div>
          <div className="sheet">
            <DataTable
              caption="Evaluations given"
              rows={evals.data ? given : undefined}
              loading={evals.loading}
              rowKey={(e) => e.EVALUATION_ID}
              columns={[
                { key: 'PROJECT_TITLE', label: 'Project', render: (e) => <Link className="title-link" href={`/projects/${e.PROJECT_ID}`}>{e.PROJECT_TITLE}</Link> },
                { key: 'EVALUATION_DATE', label: 'Date', render: (e) => fmtDate(e.EVALUATION_DATE) },
                { key: 'SCORE', label: 'Score', numeric: true, render: (e) => fmtScore(e.SCORE) },
              ]}
              empty={<p className="empty">No evaluations yet.</p>}
            />
          </div>
        </section>
      </div>
    </>
  );
}
