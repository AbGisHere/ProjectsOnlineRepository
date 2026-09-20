const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const getAll = asyncHandler(async (req, res) => {
  const result = await db.execute(
    `SELECT tm.Team_ID, tm.Student_ID, t.Team_Name, s.Name AS Student_Name
     FROM Team_Member tm
     JOIN Team t ON t.Team_ID = tm.Team_ID
     JOIN Student s ON s.Student_ID = tm.Student_ID
     ORDER BY tm.Team_ID, tm.Student_ID`
  );
  res.json({ success: true, data: result.rows });
});

// GET /teams/:teamId/members
const getByTeam = asyncHandler(async (req, res) => {
  const result = await db.execute(
    `SELECT tm.Team_ID, tm.Student_ID, s.Name, s.Email
     FROM Team_Member tm
     JOIN Student s ON s.Student_ID = tm.Student_ID
     WHERE tm.Team_ID = :teamId
     ORDER BY tm.Student_ID`,
    { teamId: req.params.teamId }
  );
  res.json({ success: true, data: result.rows });
});

// POST /teams/:teamId/members  body: { student_id }
const addMember = asyncHandler(async (req, res) => {
  const { teamId } = req.params;
  const { student_id } = req.body;
  await db.execute('INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (:teamId, :student_id)', {
    teamId,
    student_id,
  });
  res.status(201).json({ success: true, data: { team_id: Number(teamId), student_id } });
});

// DELETE /teams/:teamId/members/:studentId
const removeMember = asyncHandler(async (req, res) => {
  const { teamId, studentId } = req.params;
  const result = await db.execute(
    'DELETE FROM Team_Member WHERE Team_ID = :teamId AND Student_ID = :studentId',
    { teamId, studentId }
  );
  if (!result.rowsAffected) throw new ApiError(404, 'Team membership not found');
  res.json({ success: true, message: 'Member removed from team' });
});

module.exports = { getAll, getByTeam, addMember, removeMember };
