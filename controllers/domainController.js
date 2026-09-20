const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const getAll = asyncHandler(async (req, res) => {
  const result = await db.execute('SELECT * FROM Domain ORDER BY Domain_ID');
  res.json({ success: true, data: result.rows });
});

const getById = asyncHandler(async (req, res) => {
  const result = await db.execute('SELECT * FROM Domain WHERE Domain_ID = :id', {
    id: req.params.id,
  });
  if (!result.rows.length) throw new ApiError(404, 'Domain not found');
  res.json({ success: true, data: result.rows[0] });
});

const create = asyncHandler(async (req, res) => {
  const { domain_id, domain_name } = req.body;
  await db.execute('INSERT INTO Domain (Domain_ID, Domain_Name) VALUES (:domain_id, :domain_name)', {
    domain_id,
    domain_name,
  });
  res.status(201).json({ success: true, data: { domain_id, domain_name } });
});

const update = asyncHandler(async (req, res) => {
  const { domain_name } = req.body;
  const result = await db.execute('UPDATE Domain SET Domain_Name = :domain_name WHERE Domain_ID = :id', {
    domain_name,
    id: req.params.id,
  });
  if (!result.rowsAffected) throw new ApiError(404, 'Domain not found');
  res.json({ success: true, message: 'Domain updated' });
});

const remove = asyncHandler(async (req, res) => {
  const result = await db.execute('DELETE FROM Domain WHERE Domain_ID = :id', { id: req.params.id });
  if (!result.rowsAffected) throw new ApiError(404, 'Domain not found');
  res.json({ success: true, message: 'Domain deleted' });
});

module.exports = { getAll, getById, create, update, remove };
