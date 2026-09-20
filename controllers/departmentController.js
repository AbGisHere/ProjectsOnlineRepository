const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const getAll = asyncHandler(async (req, res) => {
  const result = await db.execute('SELECT * FROM Department ORDER BY Department_ID');
  res.json({ success: true, data: result.rows });
});

const getById = asyncHandler(async (req, res) => {
  const result = await db.execute('SELECT * FROM Department WHERE Department_ID = :id', {
    id: req.params.id,
  });
  if (!result.rows.length) throw new ApiError(404, 'Department not found');
  res.json({ success: true, data: result.rows[0] });
});

const create = asyncHandler(async (req, res) => {
  const { department_id, department_name } = req.body;
  await db.execute(
    'INSERT INTO Department (Department_ID, Department_Name) VALUES (:department_id, :department_name)',
    { department_id, department_name }
  );
  res.status(201).json({ success: true, data: { department_id, department_name } });
});

const update = asyncHandler(async (req, res) => {
  const { department_name } = req.body;
  const result = await db.execute(
    'UPDATE Department SET Department_Name = :department_name WHERE Department_ID = :id',
    { department_name, id: req.params.id }
  );
  if (!result.rowsAffected) throw new ApiError(404, 'Department not found');
  res.json({ success: true, data: { department_id: Number(req.params.id), department_name } });
});

const remove = asyncHandler(async (req, res) => {
  const result = await db.execute('DELETE FROM Department WHERE Department_ID = :id', {
    id: req.params.id,
  });
  if (!result.rowsAffected) throw new ApiError(404, 'Department not found');
  res.json({ success: true, message: 'Department deleted' });
});

module.exports = { getAll, getById, create, update, remove };
