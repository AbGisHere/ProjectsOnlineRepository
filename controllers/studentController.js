const bcrypt = require('bcrypt');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

// Password is never returned in any response.
const PUBLIC_COLS =
  'Student_ID, Name, Email, Department_ID, Year, Credits, Score';

const getAll = asyncHandler(async (req, res) => {
  const result = await db.execute(`SELECT ${PUBLIC_COLS} FROM Student ORDER BY Student_ID`);
  res.json({ success: true, data: result.rows });
});

const getById = asyncHandler(async (req, res) => {
  const result = await db.execute(`SELECT ${PUBLIC_COLS} FROM Student WHERE Student_ID = :id`, {
    id: req.params.id,
  });
  if (!result.rows.length) throw new ApiError(404, 'Student not found');
  res.json({ success: true, data: result.rows[0] });
});

const create = asyncHandler(async (req, res) => {
  const { student_id, name, email, department_id, year, credits, password, score } = req.body;
  const hashed = await bcrypt.hash(password, SALT_ROUNDS);
  await db.execute(
    `INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score)
     VALUES (:student_id, :name, :email, :department_id, :year, :credits, :password, :score)`,
    {
      student_id,
      name,
      email,
      department_id,
      year,
      credits: credits ?? 0,
      password: hashed,
      score: score ?? 0,
    }
  );
  res.status(201).json({ success: true, data: { student_id, name, email, department_id, year } });
});

const update = asyncHandler(async (req, res) => {
  const { name, email, department_id, year, credits, score } = req.body;
  const result = await db.execute(
    `UPDATE Student
     SET Name = :name, Email = :email, Department_ID = :department_id,
         Year = :year, Credits = :credits, Score = :score
     WHERE Student_ID = :id`,
    { name, email, department_id, year, credits, score, id: req.params.id }
  );
  if (!result.rowsAffected) throw new ApiError(404, 'Student not found');
  res.json({ success: true, message: 'Student updated' });
});

const remove = asyncHandler(async (req, res) => {
  const result = await db.execute('DELETE FROM Student WHERE Student_ID = :id', {
    id: req.params.id,
  });
  if (!result.rowsAffected) throw new ApiError(404, 'Student not found');
  res.json({ success: true, message: 'Student deleted' });
});

// GET /students/:id/projects -> a student's project history across years,
// derived via Team_Member -> Team -> Project.
const getProjectHistory = asyncHandler(async (req, res) => {
  const result = await db.execute(
    `SELECT p.Project_ID, p.Title, p.Academic_Year, p.Status, p.GitURL, p.Submission_Date,
            t.Team_ID, t.Team_Name
     FROM Project p
     JOIN Team t ON t.Team_ID = p.Team_ID
     JOIN Team_Member tm ON tm.Team_ID = t.Team_ID
     WHERE tm.Student_ID = :id
     ORDER BY p.Academic_Year DESC, p.Project_ID`,
    { id: req.params.id }
  );
  res.json({ success: true, data: result.rows });
});

module.exports = { getAll, getById, create, update, remove, getProjectHistory };
