'use client';

import Link from 'next/link';
import { CrudPage } from '@/components/CrudPage';
import { Chip } from '@/components/ui';
import { nextId, useApi } from '@/lib/hooks';
import { useSession } from '@/lib/session';
import type { Faculty, Student, Team, TeamMember } from '@/lib/types';

export default function TeamsPage() {
  const { session } = useSession();
  const students = useApi<Student[]>('/students');
  const faculty = useApi<Faculty[]>('/faculty');
  const members = useApi<TeamMember[]>('/team-members');

  const role = session?.role;
  const memberCount = (id: number) => (members.data ?? []).filter((m) => m.TEAM_ID === id).length;
  const leaderOpts = (students.data ?? [])
    .filter((s) => role !== 'student' || s.STUDENT_ID === session?.id)
    .map((s) => ({ value: s.STUDENT_ID, label: `${s.NAME} (#${s.STUDENT_ID})` }));
  const guideOpts = (faculty.data ?? [])
    .filter((f) => role !== 'faculty' || f.FACULTY_ID === session?.id)
    .map((f) => ({ value: f.FACULTY_ID, label: `${f.NAME} (#${f.FACULTY_ID})` }));

  const isMine = (t: Team) => role === 'admin' || (role === 'faculty' && t.GUIDE_ID === session?.id) || (role === 'student' && t.LEADER_ID === session?.id);

  return (
    <CrudPage<Team>
      noun="team"
      title="Teams"
      hue="team"
      lede="Each team has one student leader and one faculty guide. The leader is added as a member automatically."
      endpoint="/teams"
      rowKey={(t) => t.TEAM_ID}
      rowLabel={(t) => t.TEAM_NAME}
      search={(t) => `${t.TEAM_NAME} ${t.LEADER_NAME} ${t.GUIDE_NAME} ${t.TEAM_ID}`}
      searchLabel="Search teams, leaders, guides…"
      initialSort={{ key: 'TEAM_ID', dir: 'asc' }}
      onChanged={() => void members.reload()}
      columns={[
        { key: 'TEAM_ID', label: 'ID', mono: true, width: 80 },
        { key: 'TEAM_NAME', label: 'Team', render: (t) => <Link className="title-link" href={`/teams/${t.TEAM_ID}`}>{t.TEAM_NAME}</Link> },
        { key: 'LEADER_NAME', label: 'Leader', render: (t) => <Chip hue="people" href={`/students/${t.LEADER_ID}`}>{t.LEADER_NAME}</Chip> },
        { key: 'GUIDE_NAME', label: 'Guide', render: (t) => <Chip hue="people" href={`/faculty/${t.GUIDE_ID}`}>{t.GUIDE_NAME}</Chip> },
        { key: 'members', label: 'Members', numeric: true, width: 100, sort: (t) => memberCount(t.TEAM_ID), render: (t) => (members.data ? memberCount(t.TEAM_ID) : '—') },
      ]}
      fields={[
        { name: 'team_id', label: 'Team ID', type: 'int', required: true, createOnly: true },
        { name: 'team_name', label: 'Team name', required: true },
        { name: 'leader_id', label: 'Leader', type: 'select', required: true, options: leaderOpts, hint: role === 'student' ? 'You lead the teams you create.' : 'Must be an existing student.' },
        { name: 'guide_id', label: 'Guide', type: 'select', required: true, options: guideOpts, hint: role === 'faculty' ? 'You guide the teams you create.' : 'Must be an existing faculty member.' },
      ]}
      blank={(rows) => ({
        team_id: String(nextId(rows, 'TEAM_ID', 3001)),
        team_name: '',
        leader_id: role === 'student' ? String(session?.id) : '',
        guide_id: role === 'faculty' ? String(session?.id) : '',
      })}
      toForm={(t) => ({ team_id: String(t.TEAM_ID), team_name: t.TEAM_NAME, leader_id: String(t.LEADER_ID), guide_id: String(t.GUIDE_ID) })}
      canCreate={!!session}
      canEdit={isMine}
      canDelete={(t) => role === 'admin' || (role === 'faculty' && t.GUIDE_ID === session?.id)}
      emptyHint="A team needs a leader and a guide before it can register projects."
    />
  );
}
