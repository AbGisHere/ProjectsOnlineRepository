const bcrypt = require('bcrypt');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const PUBLIC_COLS = 'Faculty_ID, Name, Email, Department_ID, Designation, Score';

const getAll = asyncHandler(async (req, res) => {
  const result = await db.execute(`SELECT ${PUBLIC_COLS} FROM Faculty ORDER BY Faculty_ID`);
  res.json({ success: true, data: result.rows });
});

const getById = asyncHandler(async (req, res) => {
  const result = await db.execute(`SELECT ${PUBLIC_COLS} FROM Faculty WHERE Faculty_ID = :id`, {
    id: req.params.id,
  });
  if (!result.rows.length) throw new ApiError(404, 'Faculty not found');
  res.json({ success: true, data: result.rows[0] });
});

const create = asyncHandler(async (req, res) => {
  const { faculty_id, name, email, department_id, designation, password, score } = req.body;
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  await db.execute(
    `INSERT INTO Faculty (Faculty_ID, Name, Email, Department_ID, Designation, Password, Score)
     VALUES (:faculty_id, :name, :email, :department_id, :designation, :password, :score)`,
    { faculty_id, name, email, department_id, designation, password: hashed, score: score ?? 0 }
  );
  res.status(201).json({ success: true, data: { faculty_id, name, email, department_id, designation } });
});

const update = asyncHandler(async (req, res) => {
  const { name, email, department_id, designation, score } = req.body;
  const result = await db.execute(
    `UPDATE Faculty
     SET Name = :name, Email = :email, Department_ID = :department_id,
         Designation = :designation, Score = :score
     WHERE Faculty_ID = :id`,
    { name, email, department_id, designation, score, id: req.params.id }
  );
  if (!result.rowsAffected) throw new ApiError(404, 'Faculty not found');
  res.json({ success: true, message: 'Faculty updated' });
});

const remove = asyncHandler(async (req, res) => {
  const result = await db.execute('DELETE FROM Faculty WHERE Faculty_ID = :id', {
    id: req.params.id,
  });
  if (!result.rowsAffected) throw new ApiError(404, 'Faculty not found');
  res.json({ success: true, message: 'Faculty deleted' });
});

// GET /faculty/:id/guided-teams -> teams a faculty member has guided.
const getGuidedTeams = asyncHandler(async (req, res) => {
  const result = await db.execute(
    `SELECT t.Team_ID, t.Team_Name, t.Leader_ID, s.Name AS Leader_Name
     FROM Team t
     JOIN Student s ON s.Student_ID = t.Leader_ID
     WHERE t.Guide_ID = :id
     ORDER BY t.Team_ID`,
    { id: req.params.id }
  );
  res.json({ success: true, data: result.rows });
});

module.exports = { getAll, getById, create, update, remove, getGuidedTeams };
