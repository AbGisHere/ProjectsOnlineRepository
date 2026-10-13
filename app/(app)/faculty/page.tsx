'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CrudPage } from '@/components/CrudPage';
import { fmtScore } from '@/lib/format';
import { nextId } from '@/lib/hooks';
import { useSession } from '@/lib/session';
import { useDepartments } from '@/lib/useDepartments';
import type { Faculty } from '@/lib/types';

export default function FacultyPage() {
  const { session } = useSession();
  const depts = useDepartments();
  const [dept, setDept] = useState('');
  const admin = session?.role === 'admin';

  return (
    <CrudPage<Faculty>
      noun="faculty member"
      title="Faculty"
      hue="people"
      lede="Guides and evaluators, with their department and designation."
      endpoint="/faculty"
      rowKey={(f) => f.FACULTY_ID}
      rowLabel={(f) => f.NAME}
      search={(f) => `${f.NAME} ${f.EMAIL} ${f.DESIGNATION ?? ''} ${f.FACULTY_ID}`}
      searchLabel="Search by name, email or designation…"
      filter={dept ? (f) => f.DEPARTMENT_ID === Number(dept) : undefined}
      filters={
        <label>
          <span className="sr-only">Department</span>
          <select className="select filter-select" value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">Any department</option>
            {depts.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      }
      initialSort={{ key: 'FACULTY_ID', dir: 'asc' }}
      columns={[
        { key: 'FACULTY_ID', label: 'ID', mono: true, width: 80 },
        { key: 'NAME', label: 'Name', render: (f) => <Link className="title-link" href={`/faculty/${f.FACULTY_ID}`}>{f.NAME}</Link> },
        { key: 'DESIGNATION', label: 'Designation', render: (f) => f.DESIGNATION ?? '—' },
        { key: 'EMAIL', label: 'Email' },
        { key: 'DEPARTMENT_ID', label: 'Department', sort: (f) => depts.name(f.DEPARTMENT_ID), render: (f) => depts.name(f.DEPARTMENT_ID) },
        { key: 'SCORE', label: 'Score', numeric: true, width: 80, render: (f) => fmtScore(f.SCORE) },
      ]}
      fields={[
        { name: 'faculty_id', label: 'Faculty ID', type: 'int', required: true, createOnly: true },
        { name: 'name', label: 'Full name', required: true, placeholder: 'Dr. …' },
        { name: 'email', label: 'Email', type: 'email', required: true, wide: true, hint: 'Must be a @vit.ac.in address.' },
        { name: 'department_id', label: 'Department', type: 'select', required: true, options: depts.options },
        { name: 'designation', label: 'Designation', placeholder: 'Assistant Professor' },
        { name: 'score', label: 'Score', type: 'decimal', min: 0, max: 100 },
        { name: 'password', label: 'Initial password', type: 'password', required: true, createOnly: true, hint: 'At least 6 characters. Stored as a bcrypt hash.' },
      ]}
      blank={(rows) => ({ faculty_id: String(nextId(rows, 'FACULTY_ID', 2001)) })}
      toForm={(f) => ({
        faculty_id: String(f.FACULTY_ID), name: f.NAME, email: f.EMAIL, department_id: String(f.DEPARTMENT_ID),
        designation: f.DESIGNATION ?? '', score: f.SCORE == null ? '' : String(f.SCORE),
      })}
      canCreate={admin}
      canEdit={(f) => admin || (session?.role === 'faculty' && f.FACULTY_ID === session.id)}
      canDelete={() => admin}
      emptyHint="Faculty appear here when an admin adds them."
    />
  );
}
