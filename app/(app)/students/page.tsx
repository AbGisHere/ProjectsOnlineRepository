'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CrudPage } from '@/components/CrudPage';
import { fmtScore } from '@/lib/format';
import { nextId } from '@/lib/hooks';
import { useSession } from '@/lib/session';
import { useDepartments } from '@/lib/useDepartments';
import type { Student } from '@/lib/types';

export default function StudentsPage() {
  const { session } = useSession();
  const depts = useDepartments();
  const [dept, setDept] = useState('');
  const admin = session?.role === 'admin';

  return (
    <CrudPage<Student>
      noun="student"
      title="Students"
      hue="people"
      lede="Every registered student, their department, year of study, credits and score."
      endpoint="/students"
      rowKey={(s) => s.STUDENT_ID}
      rowLabel={(s) => s.NAME}
      search={(s) => `${s.NAME} ${s.EMAIL} ${s.STUDENT_ID}`}
      searchLabel="Search by name, email or ID…"
      filter={dept ? (s) => s.DEPARTMENT_ID === Number(dept) : undefined}
      filters={
        <label>
          <span className="sr-only">Department</span>
          <select className="select filter-select" value={dept} onChange={(e) => setDept(e.target.value)}>
            <option value="">Any department</option>
            {depts.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </label>
      }
      initialSort={{ key: 'STUDENT_ID', dir: 'asc' }}
      columns={[
        { key: 'STUDENT_ID', label: 'ID', mono: true, width: 80 },
        { key: 'NAME', label: 'Name', render: (s) => <Link className="title-link" href={`/students/${s.STUDENT_ID}`}>{s.NAME}</Link> },
        { key: 'EMAIL', label: 'Email' },
        { key: 'DEPARTMENT_ID', label: 'Department', sort: (s) => depts.name(s.DEPARTMENT_ID), render: (s) => depts.name(s.DEPARTMENT_ID) },
        { key: 'YEAR', label: 'Year', numeric: true, width: 70 },
        { key: 'CREDITS', label: 'Credits', numeric: true, width: 90, render: (s) => s.CREDITS ?? '—' },
        { key: 'SCORE', label: 'Score', numeric: true, width: 80, render: (s) => fmtScore(s.SCORE) },
      ]}
      fields={[
        { name: 'student_id', label: 'Student ID', type: 'int', required: true, createOnly: true },
        { name: 'name', label: 'Full name', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true, wide: true },
        { name: 'department_id', label: 'Department', type: 'select', required: true, options: depts.options },
        { name: 'year', label: 'Year of study', type: 'int', required: true, min: 1, max: 5 },
        { name: 'credits', label: 'Credits', type: 'int', min: 0 },
        { name: 'score', label: 'Score', type: 'decimal', min: 0, max: 100 },
        { name: 'password', label: 'Initial password', type: 'password', required: true, createOnly: true, hint: 'At least 6 characters. Stored as a bcrypt hash.' },
      ]}
      blank={(rows) => ({ student_id: String(nextId(rows, 'STUDENT_ID', 1001)), year: '1', credits: '0' })}
      toForm={(s) => ({
        student_id: String(s.STUDENT_ID), name: s.NAME, email: s.EMAIL, department_id: String(s.DEPARTMENT_ID),
        year: String(s.YEAR), credits: s.CREDITS == null ? '' : String(s.CREDITS), score: s.SCORE == null ? '' : String(s.SCORE),
      })}
      canCreate={admin}
      canEdit={(s) => admin || (session?.role === 'student' && s.STUDENT_ID === session.id)}
      canDelete={() => admin}
      emptyHint="Students appear here when an admin adds them or they register."
    />
  );
}
