const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const getAll = asyncHandler(async (req, res) => {
  const result = await db.execute('SELECT * FROM Technology ORDER BY Technology_ID');
  res.json({ success: true, data: result.rows });
});

const getById = asyncHandler(async (req, res) => {
  const result = await db.execute('SELECT * FROM Technology WHERE Technology_ID = :id', {
    id: req.params.id,
  });
  if (!result.rows.length) throw new ApiError(404, 'Technology not found');
  res.json({ success: true, data: result.rows[0] });
});

const create = asyncHandler(async (req, res) => {
  const { technology_id, technology_name } = req.body;
  await db.execute(
    'INSERT INTO Technology (Technology_ID, Technology_Name) VALUES (:technology_id, :technology_name)',
    { technology_id, technology_name }
  );
  res.status(201).json({ success: true, data: { technology_id, technology_name } });
});

const update = asyncHandler(async (req, res) => {
  const { technology_name } = req.body;
  const result = await db.execute(
    'UPDATE Technology SET Technology_Name = :technology_name WHERE Technology_ID = :id',
    { technology_name, id: req.params.id }
  );
  if (!result.rowsAffected) throw new ApiError(404, 'Technology not found');
  res.json({ success: true, message: 'Technology updated' });
});

const remove = asyncHandler(async (req, res) => {
  const result = await db.execute('DELETE FROM Technology WHERE Technology_ID = :id', {
    id: req.params.id,
  });
  if (!result.rowsAffected) throw new ApiError(404, 'Technology not found');
  res.json({ success: true, message: 'Technology deleted' });
});

module.exports = { getAll, getById, create, update, remove };
