import { execute } from '../db';
import { ApiError } from '../errors';
import { intParams, ok, route } from '../http';
import { check, isInt, isString, notEmpty, optional } from '../validate';

const TEAM_SELECT = `SELECT t.*, s.Name AS Leader_Name, f.Name AS Guide_Name
     FROM Team t
     JOIN Student s ON s.Student_ID = t.Leader_ID
     JOIN Faculty f ON f.Faculty_ID = t.Guide_ID`;

async function assertLeader(id: unknown) {
  const r = await execute('SELECT Student_ID FROM Student WHERE Student_ID = :id', { id });
  if (!r.rows?.length) throw new ApiError(400, 'Leader_ID must reference an existing Student');
}
async function assertGuide(id: unknown) {
  const r = await execute('SELECT Faculty_ID FROM Faculty WHERE Faculty_ID = :id', { id });
  if (!r.rows?.length) throw new ApiError(400, 'Guide_ID must reference an existing Faculty');
}

export const teams = {
  getAll: route(async () => {
    const result = await execute(`${TEAM_SELECT} ORDER BY t.Team_ID`);
    return ok({ data: result.rows });
  }),

  getById: route(async ({ params }) => {
    intParams(params, 'id');
    const result = await execute(`${TEAM_SELECT} WHERE t.Team_ID = :id`, { id: params.id });
    if (!result.rows?.length) throw new ApiError(404, 'Team not found');
    return ok({ data: result.rows[0] });
  }),

  // Validates Leader_ID is a Student and Guide_ID is a Faculty before
  // inserting, so the client gets a clear 400 instead of a raw FK error.
  create: route(async ({ body }) => {
    check(body, { team_id: [isInt()], team_name: [isString, notEmpty], leader_id: [isInt()], guide_id: [isInt()] });
    const { team_id, leader_id, guide_id } = body;
    const team_name = String(body.team_name).trim();
    await assertLeader(leader_id);
    await assertGuide(guide_id);

    await execute('INSERT INTO Team (Team_ID, Team_Name, Leader_ID, Guide_ID) VALUES (:team_id, :team_name, :leader_id, :guide_id)', {
      team_id, team_name, leader_id, guide_id,
    });
    // The team leader is automatically a team member.
    await execute('INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (:team_id, :leader_id)', { team_id, leader_id });

    return ok({ data: { team_id, team_name, leader_id, guide_id } }, 201);
  }),

  update: route(async ({ params, body }) => {
    intParams(params, 'id');
    check(body, { team_name: [isString, notEmpty], leader_id: [optional, isInt()], guide_id: [optional, isInt()] });
    const { leader_id, guide_id } = body;
    if (leader_id) await assertLeader(leader_id);
    if (guide_id) await assertGuide(guide_id);

    // Only fields actually sent, so an omitted leader_id/guide_id isn't
    // overwritten with NULL (they're NOT NULL columns).
    const sets: string[] = [];
    const binds: Record<string, unknown> = { id: params.id };
    if (body.team_name !== undefined) {
      sets.push('Team_Name = :team_name');
      binds.team_name = String(body.team_name).trim();
    }
    if (leader_id !== undefined) {
      sets.push('Leader_ID = :leader_id');
      binds.leader_id = leader_id;
    }
    if (guide_id !== undefined) {
      sets.push('Guide_ID = :guide_id');
      binds.guide_id = guide_id;
    }
    if (!sets.length) throw new ApiError(400, 'No fields to update');

    const result = await execute(`UPDATE Team SET ${sets.join(', ')} WHERE Team_ID = :id`, binds);
    if (!result.rowsAffected) throw new ApiError(404, 'Team not found');
    return ok({ message: 'Team updated' });
  }),

  remove: route(async ({ params }) => {
    intParams(params, 'id');
    const result = await execute('DELETE FROM Team WHERE Team_ID = :id', { id: params.id });
    if (!result.rowsAffected) throw new ApiError(404, 'Team not found');
    return ok({ message: 'Team deleted' });
  }),
};

export const members = {
  // GET /api/team-members -> every Team_Member row across all teams.
  getAll: route(async () => {
    const result = await execute(
      `SELECT tm.Team_ID, tm.Student_ID, t.Team_Name, s.Name AS Student_Name
       FROM Team_Member tm
       JOIN Team t ON t.Team_ID = tm.Team_ID
       JOIN Student s ON s.Student_ID = tm.Student_ID
       ORDER BY tm.Team_ID, tm.Student_ID`
    );
    return ok({ data: result.rows });
  }),

  // GET /api/teams/:id/members
  getByTeam: route(async ({ params }) => {
    intParams(params, 'id');
    const result = await execute(
      `SELECT tm.Team_ID, tm.Student_ID, s.Name, s.Email
       FROM Team_Member tm
       JOIN Student s ON s.Student_ID = tm.Student_ID
       WHERE tm.Team_ID = :teamId
       ORDER BY tm.Student_ID`,
      { teamId: params.id }
    );
    return ok({ data: result.rows });
  }),

  // POST /api/teams/:id/members  body: { student_id }
  add: route(async ({ params, body }) => {
    intParams(params, 'id');
    check(body, { student_id: [isInt()] });
    await execute('INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (:teamId, :student_id)', {
      teamId: params.id,
      student_id: body.student_id,
    });
    return ok({ data: { team_id: Number(params.id), student_id: body.student_id } }, 201);
  }),

  // DELETE /api/teams/:id/members/:studentId
  remove: route(async ({ params }) => {
    intParams(params, 'id', 'studentId');
    const result = await execute('DELETE FROM Team_Member WHERE Team_ID = :teamId AND Student_ID = :studentId', {
      teamId: params.id,
      studentId: params.studentId,
    });
    if (!result.rowsAffected) throw new ApiError(404, 'Team membership not found');
    return ok({ message: 'Member removed from team' });
  }),
};
