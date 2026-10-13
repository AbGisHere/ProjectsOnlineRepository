'use client';

import { UserPlus } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useMemo, useState } from 'react';
import { DataTable } from '@/components/DataTable';
import { Shelf } from '@/components/Shelf';
import { useToast } from '@/components/Toast';
import { Chip, ConfirmDelete, Notice, PageHead } from '@/components/ui';
import { api } from '@/lib/api';
import { useApi } from '@/lib/hooks';
import { useSession } from '@/lib/session';
import type { Project, Student, Team, TeamMemberDetail } from '@/lib/types';

export default function TeamRecord() {
  const { id } = useParams<{ id: string }>();
  const { session } = useSession();
  const toast = useToast();
  const team = useApi<Team>(`/teams/${id}`);
  const members = useApi<TeamMemberDetail[]>(`/teams/${id}/members`);
  const projects = useApi<Project[]>('/projects');
  const students = useApi<Student[]>('/students');
  const [pick, setPick] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const t = team.data;
  const canManage = !!t && (session?.role === 'admin' || (session?.role === 'faculty' && t.GUIDE_ID === session.id) || (session?.role === 'student' && t.LEADER_ID === session.id));
  const teamProjects = useMemo(() => (projects.data ?? []).filter((p) => p.TEAM_ID === Number(id)), [projects.data, id]);
  const memberIds = new Set((members.data ?? []).map((m) => m.STUDENT_ID));
  const available = (students.data ?? []).filter((s) => !memberIds.has(s.STUDENT_ID));

  async function add() {
    if (!pick) return;
    setBusy(true);
    setErr(null);
    try {
      await api.post(`/teams/${id}/members`, { student_id: Number(pick) });
      toast('Member added.');
      setPick('');
      await members.reload();
    } catch (e) {
      setErr((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function remove(m: TeamMemberDetail) {
    setErr(null);
    try {
      await api.del(`/teams/${id}/members/${m.STUDENT_ID}`);
      toast(`${m.NAME} removed from the team.`);
      await members.reload();
    } catch (e) {
      setErr((e as Error).message);
    }
  }

  if (team.error) {
    return (
      <>
        <PageHead title="Team not found" crumbs={[{ href: '/teams', label: 'Teams' }]} />
        <Notice>{team.error.status === 404 ? `There is no team #${id}.` : team.error.message}</Notice>
      </>
    );
  }

  return (
    <>
      <PageHead
        crumbs={[{ href: '/teams', label: 'Teams' }]}
        title={t?.TEAM_NAME ?? '…'}
        hue="team"
        lede={t && (
          <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            Led by <Chip hue="people" href={`/students/${t.LEADER_ID}`}>{t.LEADER_NAME}</Chip>
            guided by <Chip hue="people" href={`/faculty/${t.GUIDE_ID}`}>{t.GUIDE_NAME}</Chip>
            <span className="num">· Team #{t.TEAM_ID}</span>
          </span>
        )}
      />

      <Shelf projects={projects.data ? teamProjects : undefined} title="This team's reports" maxHeight={130} emptyText="This team hasn't registered a project yet." />

      <section className="section" aria-labelledby="mem-h">
        <div className="section-head">
          <h2 id="mem-h">Members</h2>
          <p>Rows in the Team_Member table for this team.</p>
        </div>
        <div className="sheet">
          {canManage && (
            <div className="toolbar">
              <label htmlFor="add-member" className="sr-only">Student to add</label>
              <select id="add-member" className="select filter-select" style={{ maxWidth: 320 }} value={pick} onChange={(e) => setPick(e.target.value)} disabled={busy}>
                <option value="">Choose a student to add…</option>
                {available.map((s) => <option key={s.STUDENT_ID} value={s.STUDENT_ID}>{s.NAME} (#{s.STUDENT_ID})</option>)}
              </select>
              <button className="btn btn-primary btn-sm" onClick={add} disabled={!pick || busy}>
                <UserPlus size={14} aria-hidden />
                Add member
              </button>
            </div>
          )}
          {err && <div style={{ padding: '14px 16px 0' }}><Notice>{err}</Notice></div>}
          <DataTable
            caption="Team members"
            rows={members.data}
            loading={members.loading}
            rowKey={(m) => m.STUDENT_ID}
            columns={[
              { key: 'STUDENT_ID', label: 'Student ID', mono: true, width: 120 },
              { key: 'NAME', label: 'Name', render: (m) => <Chip hue="people" href={`/students/${m.STUDENT_ID}`}>{m.NAME}</Chip> },
              { key: 'EMAIL', label: 'Email' },
              { key: 'role', label: 'Role', sort: false, render: (m) => (m.STUDENT_ID === t?.LEADER_ID ? <b>Leader</b> : 'Member') },
            ]}
            empty={<p className="empty">No members yet.</p>}
            actions={canManage ? (m) => (m.STUDENT_ID === t?.LEADER_ID ? null : <ConfirmDelete label="Remove" what={m.NAME} onConfirm={() => remove(m)} />) : undefined}
          />
        </div>
      </section>
    </>
  );
}
