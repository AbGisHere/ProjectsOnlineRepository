'use client';

import { useMemo } from 'react';
import { useApi } from './hooks';
import { useSession } from './session';
import type { Team, TeamMember } from './types';

/**
 * The teams the signed-in user can act for: every team for admins, guided
 * teams for faculty, and teams the student belongs to.
 */
export function useMyTeams() {
  const { session } = useSession();
  const teams = useApi<Team[]>('/teams');
  const members = useApi<TeamMember[]>(session?.role === 'student' ? '/team-members' : null);

  const ids = useMemo(() => {
    if (!session || !teams.data) return new Set<number>();
    if (session.role === 'admin') return new Set(teams.data.map((t) => t.TEAM_ID));
    if (session.role === 'faculty') return new Set(teams.data.filter((t) => t.GUIDE_ID === session.id).map((t) => t.TEAM_ID));
    return new Set((members.data ?? []).filter((m) => m.STUDENT_ID === session.id).map((m) => m.TEAM_ID));
  }, [session, teams.data, members.data]);

  return {
    teams,
    ids,
    loading: teams.loading || members.loading,
    reload: async () => {
      await Promise.all([teams.reload(), members.reload()]);
    },
  };
}
