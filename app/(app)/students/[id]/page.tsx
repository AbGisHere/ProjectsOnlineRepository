'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { DataTable } from '@/components/DataTable';
import { Shelf } from '@/components/Shelf';
import { Chip, Notice, PageHead, StatusTag } from '@/components/ui';
import { fmtDate, fmtScore } from '@/lib/format';
import { useApi } from '@/lib/hooks';
import { useDepartments } from '@/lib/useDepartments';
import type { Student, StudentProject, TeamMember } from '@/lib/types';

export default function StudentRecord() {
  const { id } = useParams<{ id: string }>();
  const student = useApi<Student>(`/students/${id}`);
  const history = useApi<StudentProject[]>(`/students/${id}/projects`);
  const members = useApi<TeamMember[]>('/team-members');
  const depts = useDepartments();
  const s = student.data;
  const teams = (members.data ?? []).filter((m) => m.STUDENT_ID === Number(id));

  if (student.error) {
    return (
      <>
        <PageHead title="Student not found" crumbs={[{ href: '/students', label: 'Students' }]} />
        <Notice>{student.error.status === 404 ? `There is no student #${id}.` : student.error.message}</Notice>
      </>
    );
  }

  return (
    <>
      <PageHead crumbs={[{ href: '/students', label: 'Students' }]} title={s?.NAME ?? '…'} hue="people" lede={s?.EMAIL} />
      <section className="sheet sheet-pad">
        <dl className="meta">
          <div><dt>Student ID</dt><dd className="num">{s?.STUDENT_ID ?? '—'}</dd></div>
          <div><dt>Department</dt><dd>{s ? depts.name(s.DEPARTMENT_ID) : '—'}</dd></div>
          <div><dt>Year of study</dt><dd className="num">{s?.YEAR ?? '—'}</dd></div>
          <div><dt>Credits</dt><dd className="num">{s?.CREDITS ?? '—'}</dd></div>
          <div><dt>Score</dt><dd className="num">{fmtScore(s?.SCORE)}</dd></div>
          <div>
            <dt>Teams</dt>
            <dd className="chips">
              {teams.length ? teams.map((t) => <Chip key={t.TEAM_ID} hue="team" href={`/teams/${t.TEAM_ID}`}>{t.TEAM_NAME}</Chip>) : '—'}
            </dd>
          </div>
        </dl>
      </section>

      <section className="section" aria-labelledby="hist-h">
        <div className="section-head">
          <h2 id="hist-h">Project history</h2>
          <p>Every project from every team this student has been on, across years.</p>
        </div>
        <Shelf projects={history.data} title="Their reports" maxHeight={130} emptyText="No projects yet: this student isn't on a team with a registered project." />
        <div className="sheet" style={{ marginTop: 16 }}>
          <DataTable
            caption="Project history"
            rows={history.data}
            loading={history.loading}
            rowKey={(p) => p.PROJECT_ID}
            initialSort={{ key: 'ACADEMIC_YEAR', dir: 'desc' }}
            columns={[
              { key: 'TITLE', label: 'Project', render: (p) => <Link className="title-link" href={`/projects/${p.PROJECT_ID}`}>{p.TITLE}</Link> },
              { key: 'TEAM_NAME', label: 'Team', render: (p) => <Chip hue="team" href={`/teams/${p.TEAM_ID}`}>{p.TEAM_NAME}</Chip> },
              { key: 'ACADEMIC_YEAR', label: 'Year', mono: true },
              { key: 'STATUS', label: 'Status', render: (p) => <StatusTag s={p.STATUS} /> },
              { key: 'SUBMISSION_DATE', label: 'Submitted', render: (p) => fmtDate(p.SUBMISSION_DATE) },
            ]}
            empty={<p className="empty">No project history.</p>}
          />
        </div>
      </section>
    </>
  );
}
