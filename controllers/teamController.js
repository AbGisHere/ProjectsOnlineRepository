const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const getAll = asyncHandler(async (req, res) => {
  const result = await db.execute(
    `SELECT t.*, s.Name AS Leader_Name, f.Name AS Guide_Name
     FROM Team t
     JOIN Student s ON s.Student_ID = t.Leader_ID
     JOIN Faculty f ON f.Faculty_ID = t.Guide_ID
     ORDER BY t.Team_ID`
  );
  res.json({ success: true, data: result.rows });
});

const getById = asyncHandler(async (req, res) => {
  const result = await db.execute(
    `SELECT t.*, s.Name AS Leader_Name, f.Name AS Guide_Name
     FROM Team t
     JOIN Student s ON s.Student_ID = t.Leader_ID
     JOIN Faculty f ON f.Faculty_ID = t.Guide_ID
     WHERE t.Team_ID = :id`,
    { id: req.params.id }
  );
  if (!result.rows.length) throw new ApiError(404, 'Team not found');
  res.json({ success: true, data: result.rows[0] });
});

// POST /teams -> creates a team, validating Leader_ID is a Student and
// Guide_ID is a Faculty before insert (belt-and-braces on top of the FKs,
// so we can return a clear 400 instead of a raw Oracle FK error).
const create = asyncHandler(async (req, res) => {
  const { team_id, team_name, leader_id, guide_id } = req.body;

  const leader = await db.execute('SELECT Student_ID FROM Student WHERE Student_ID = :id', {
    id: leader_id,
  });
  if (!leader.rows.length) throw new ApiError(400, 'Leader_ID must reference an existing Student');

  const guide = await db.execute('SELECT Faculty_ID FROM Faculty WHERE Faculty_ID = :id', {
    id: guide_id,
  });
  if (!guide.rows.length) throw new ApiError(400, 'Guide_ID must reference an existing Faculty');

  await db.execute(
    'INSERT INTO Team (Team_ID, Team_Name, Leader_ID, Guide_ID) VALUES (:team_id, :team_name, :leader_id, :guide_id)',
    { team_id, team_name, leader_id, guide_id }
  );

  // The team leader is automatically a team member.
  await db.execute('INSERT INTO Team_Member (Team_ID, Student_ID) VALUES (:team_id, :leader_id)', {
    team_id,
    leader_id,
  });

  res.status(201).json({ success: true, data: { team_id, team_name, leader_id, guide_id } });
});

const update = asyncHandler(async (req, res) => {
  const { team_name, leader_id, guide_id } = req.body;

  if (leader_id) {
    const leader = await db.execute('SELECT Student_ID FROM Student WHERE Student_ID = :id', {
      id: leader_id,
    });
    if (!leader.rows.length) throw new ApiError(400, 'Leader_ID must reference an existing Student');
  }
  if (guide_id) {
    const guide = await db.execute('SELECT Faculty_ID FROM Faculty WHERE Faculty_ID = :id', {
      id: guide_id,
    });
    if (!guide.rows.length) throw new ApiError(400, 'Guide_ID must reference an existing Faculty');
  }

  // Build the SET clause from only the fields actually sent, so an omitted
  // leader_id/guide_id isn't overwritten with NULL (which would violate the
  // NOT NULL constraint on those columns).
  const sets = [];
  const binds = { id: req.params.id };
  if (team_name !== undefined) {
    sets.push('Team_Name = :team_name');
    binds.team_name = team_name;
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

  const result = await db.execute(`UPDATE Team SET ${sets.join(', ')} WHERE Team_ID = :id`, binds);
  if (!result.rowsAffected) throw new ApiError(404, 'Team not found');
  res.json({ success: true, message: 'Team updated' });
});

const remove = asyncHandler(async (req, res) => {
  const result = await db.execute('DELETE FROM Team WHERE Team_ID = :id', { id: req.params.id });
  if (!result.rowsAffected) throw new ApiError(404, 'Team not found');
  res.json({ success: true, message: 'Team deleted' });
});

module.exports = { getAll, getById, create, update, remove };
