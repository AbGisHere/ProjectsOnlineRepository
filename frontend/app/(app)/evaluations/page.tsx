'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CrudPage } from '@/components/CrudPage';
import { Chip } from '@/components/ui';
import { fmtDate, fmtScore } from '@/lib/format';
import { nextId, useApi } from '@/lib/hooks';
import { useSession } from '@/lib/session';
import type { Evaluation, Faculty, Project } from '@/lib/types';

export default function EvaluationsPage() {
  const { session } = useSession();
  const projects = useApi<Project[]>('/projects');
  const faculty = useApi<Faculty[]>('/faculty');
  const [onlyMine, setOnlyMine] = useState(session?.role === 'faculty');
  const role = session?.role;
  const own = (e: Evaluation) => role === 'admin' || (role === 'faculty' && e.FACULTY_ID === session?.id);

  return (
    <CrudPage<Evaluation>
      noun="evaluation"
      title="Evaluations"
      hue="eval"
      lede="Faculty scores (0–100) and written feedback on each project. A project's certificate averages every evaluation it has."
      endpoint="/evaluations"
      rowKey={(e) => e.EVALUATION_ID}
      rowLabel={(e) => `evaluation #${e.EVALUATION_ID}`}
      search={(e) => `${e.PROJECT_TITLE} ${e.FACULTY_NAME} ${e.FEEDBACK ?? ''}`}
      searchLabel="Search by project, evaluator or feedback…"
      filter={onlyMine && role === 'faculty' ? (e) => e.FACULTY_ID === session?.id : undefined}
      filters={role === 'faculty' && (
        <label style={{ display: 'inline-flex', gap: 8, alignItems: 'center', fontSize: 14 }}>
          <input type="checkbox" checked={onlyMine} onChange={(e) => setOnlyMine(e.target.checked)} />
          Only mine
        </label>
      )}
      initialSort={{ key: 'EVALUATION_ID', dir: 'asc' }}
      columns={[
        { key: 'EVALUATION_ID', label: 'ID', mono: true, width: 70 },
        { key: 'PROJECT_TITLE', label: 'Project', render: (e) => <Link className="title-link" href={`/projects/${e.PROJECT_ID}`}>{e.PROJECT_TITLE}</Link> },
        { key: 'FACULTY_NAME', label: 'Evaluator', render: (e) => <Chip hue="people" href={`/faculty/${e.FACULTY_ID}`}>{e.FACULTY_NAME}</Chip> },
        { key: 'FEEDBACK', label: 'Feedback', sort: false, render: (e) => <span style={{ color: e.FEEDBACK ? 'var(--ink-2)' : 'var(--muted)', fontSize: 13.5, display: 'block', maxWidth: '44ch' }}>{e.FEEDBACK || 'No feedback'}</span> },
        { key: 'EVALUATION_DATE', label: 'Date', width: 120, sort: (e) => e.EVALUATION_DATE ?? '', render: (e) => fmtDate(e.EVALUATION_DATE) },
        { key: 'SCORE', label: 'Score', numeric: true, width: 80, render: (e) => fmtScore(e.SCORE) },
      ]}
      fields={[
        { name: 'evaluation_id', label: 'Evaluation ID', type: 'int', required: true, createOnly: true },
        { name: 'project_id', label: 'Project', type: 'select', required: true, lockOnEdit: true, wide: true, options: (projects.data ?? []).map((p) => ({ value: p.PROJECT_ID, label: `${p.TITLE} (#${p.PROJECT_ID})` })) },
        {
          name: 'faculty_id', label: 'Evaluator', type: 'select', required: true, lockOnEdit: true, wide: true,
          options: (faculty.data ?? []).filter((f) => role !== 'faculty' || f.FACULTY_ID === session?.id).map((f) => ({ value: f.FACULTY_ID, label: f.NAME })),
        },
        { name: 'score', label: 'Score (0–100)', type: 'decimal', required: true, min: 0, max: 100 },
        { name: 'feedback', label: 'Feedback', type: 'textarea' },
      ]}
      blank={(rows) => ({ evaluation_id: String(nextId(rows, 'EVALUATION_ID', 1)), faculty_id: role === 'faculty' ? String(session?.id) : '' })}
      toForm={(e) => ({ evaluation_id: String(e.EVALUATION_ID), project_id: String(e.PROJECT_ID), faculty_id: String(e.FACULTY_ID), score: String(e.SCORE), feedback: e.FEEDBACK ?? '' })}
      canCreate={role === 'admin' || role === 'faculty'}
      canEdit={own}
      canDelete={own}
      emptyHint="Faculty add evaluations from a project's page, or here."
    />
  );
}
