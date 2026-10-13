'use client';

import { CrudPage } from '@/components/CrudPage';
import { nextId, useApi } from '@/lib/hooks';
import { useSession } from '@/lib/session';
import type { Department, Faculty, Student } from '@/lib/types';

export default function DepartmentsPage() {
  const { session } = useSession();
  const students = useApi<Student[]>('/students');
  const faculty = useApi<Faculty[]>('/faculty');
  const admin = session?.role === 'admin';
  const nStudents = (id: number) => (students.data ?? []).filter((s) => s.DEPARTMENT_ID === id).length;
  const nFaculty = (id: number) => (faculty.data ?? []).filter((f) => f.DEPARTMENT_ID === id).length;

  return (
    <CrudPage<Department>
      noun="department"
      title="Departments"
      hue="people"
      lede="Every student and faculty member belongs to one department. A department with people in it can't be deleted until they are moved."
      endpoint="/departments"
      rowKey={(d) => d.DEPARTMENT_ID}
      rowLabel={(d) => d.DEPARTMENT_NAME}
      search={(d) => `${d.DEPARTMENT_NAME} ${d.DEPARTMENT_ID}`}
      searchLabel="Search departments…"
      initialSort={{ key: 'DEPARTMENT_ID', dir: 'asc' }}
      columns={[
        { key: 'DEPARTMENT_ID', label: 'ID', mono: true, width: 80 },
        { key: 'DEPARTMENT_NAME', label: 'Department', render: (d) => <b>{d.DEPARTMENT_NAME}</b> },
        { key: 'students', label: 'Students', numeric: true, width: 110, sort: (d) => nStudents(d.DEPARTMENT_ID), render: (d) => (students.data ? nStudents(d.DEPARTMENT_ID) : '—') },
        { key: 'faculty', label: 'Faculty', numeric: true, width: 110, sort: (d) => nFaculty(d.DEPARTMENT_ID), render: (d) => (faculty.data ? nFaculty(d.DEPARTMENT_ID) : '—') },
      ]}
      fields={[
        { name: 'department_id', label: 'Department ID', type: 'int', required: true, createOnly: true },
        { name: 'department_name', label: 'Department name', required: true, wide: true },
      ]}
      blank={(rows) => ({ department_id: String(nextId(rows, 'DEPARTMENT_ID', 1)) })}
      toForm={(d) => ({ department_id: String(d.DEPARTMENT_ID), department_name: d.DEPARTMENT_NAME })}
      canCreate={admin}
      canEdit={() => admin}
      canDelete={() => admin}
      emptyHint="Add departments before adding students or faculty."
    />
  );
}
