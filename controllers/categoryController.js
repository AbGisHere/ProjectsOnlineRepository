const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const getAll = asyncHandler(async (req, res) => {
  const result = await db.execute('SELECT * FROM Category ORDER BY Category_ID');
  res.json({ success: true, data: result.rows });
});

const getById = asyncHandler(async (req, res) => {
  const result = await db.execute('SELECT * FROM Category WHERE Category_ID = :id', {
    id: req.params.id,
  });
  if (!result.rows.length) throw new ApiError(404, 'Category not found');
  res.json({ success: true, data: result.rows[0] });
});

const create = asyncHandler(async (req, res) => {
  const { category_id, category_name } = req.body;
  await db.execute(
    'INSERT INTO Category (Category_ID, Category_Name) VALUES (:category_id, :category_name)',
    { category_id, category_name }
  );
  res.status(201).json({ success: true, data: { category_id, category_name } });
});

const update = asyncHandler(async (req, res) => {
  const { category_name } = req.body;
  const result = await db.execute(
    'UPDATE Category SET Category_Name = :category_name WHERE Category_ID = :id',
    { category_name, id: req.params.id }
  );
  if (!result.rowsAffected) throw new ApiError(404, 'Category not found');
  res.json({ success: true, message: 'Category updated' });
});

const remove = asyncHandler(async (req, res) => {
  const result = await db.execute('DELETE FROM Category WHERE Category_ID = :id', {
    id: req.params.id,
  });
  if (!result.rowsAffected) throw new ApiError(404, 'Category not found');
  res.json({ success: true, message: 'Category deleted' });
});

module.exports = { getAll, getById, create, update, remove };
