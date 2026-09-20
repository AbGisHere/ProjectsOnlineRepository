const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const getAll = asyncHandler(async (req, res) => {
  const result = await db.execute(
    `SELECT e.*, p.Title AS Project_Title, f.Name AS Faculty_Name
     FROM Evaluation e
     JOIN Project p ON p.Project_ID = e.Project_ID
     JOIN Faculty f ON f.Faculty_ID = e.Faculty_ID
     ORDER BY e.Evaluation_ID`
  );
  res.json({ success: true, data: result.rows });
});

const getById = asyncHandler(async (req, res) => {
  const result = await db.execute(
    `SELECT e.*, p.Title AS Project_Title, f.Name AS Faculty_Name
     FROM Evaluation e
     JOIN Project p ON p.Project_ID = e.Project_ID
     JOIN Faculty f ON f.Faculty_ID = e.Faculty_ID
     WHERE e.Evaluation_ID = :id`,
    { id: req.params.id }
  );
  if (!result.rows.length) throw new ApiError(404, 'Evaluation not found');
  res.json({ success: true, data: result.rows[0] });
});

const create = asyncHandler(async (req, res) => {
  const { evaluation_id, project_id, faculty_id, score, feedback } = req.body;
  await db.execute(
    `INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date)
     VALUES (:evaluation_id, :project_id, :faculty_id, :score, :feedback, SYSDATE)`,
    { evaluation_id, project_id, faculty_id, score, feedback: feedback || null }
  );
  res.status(201).json({ success: true, data: { evaluation_id, project_id, faculty_id, score } });
});

const update = asyncHandler(async (req, res) => {
  const { score, feedback } = req.body;
  const result = await db.execute(
    'UPDATE Evaluation SET Score = :score, Feedback = :feedback WHERE Evaluation_ID = :id',
    { score, feedback, id: req.params.id }
  );
  if (!result.rowsAffected) throw new ApiError(404, 'Evaluation not found');
  res.json({ success: true, message: 'Evaluation updated' });
});

const remove = asyncHandler(async (req, res) => {
  const result = await db.execute('DELETE FROM Evaluation WHERE Evaluation_ID = :id', {
    id: req.params.id,
  });
  if (!result.rowsAffected) throw new ApiError(404, 'Evaluation not found');
  res.json({ success: true, message: 'Evaluation deleted' });
});

module.exports = { getAll, getById, create, update, remove };
