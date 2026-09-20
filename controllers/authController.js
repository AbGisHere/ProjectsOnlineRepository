const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;

// Table/PK-column config per role so register/login can stay generic.
const ROLE_CONFIG = {
  student: { table: 'Student', idCol: 'Student_ID' },
  faculty: { table: 'Faculty', idCol: 'Faculty_ID' },
  admin: { table: 'Admin', idCol: 'Admin_ID' },
};

function signToken(user) {
  return jwt.sign(
    { id: user.id, role: user.role, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '1d' }
  );
}

// POST /auth/register
// body: { role: 'student'|'faculty'|'admin', id, name, email, password, department_id?, year?, designation? }
const register = asyncHandler(async (req, res) => {
  const { role, id, name, email, password, department_id, year, designation } = req.body;
  if (!ROLE_CONFIG[role]) throw new ApiError(400, 'role must be one of: student, faculty, admin');

  const hashed = await bcrypt.hash(password, SALT_ROUNDS);

  if (role === 'student') {
    await db.execute(
      `INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score)
       VALUES (:id, :name, :email, :department_id, :year, 0, :password, 0)`,
      { id, name, email, department_id, year, password: hashed }
    );
  } else if (role === 'faculty') {
    await db.execute(
      `INSERT INTO Faculty (Faculty_ID, Name, Email, Department_ID, Designation, Password, Score)
       VALUES (:id, :name, :email, :department_id, :designation, :password, 0)`,
      { id, name, email, department_id, designation: designation || null, password: hashed }
    );
  } else {
    await db.execute(
      `INSERT INTO Admin (Admin_ID, Name, Email, Password) VALUES (:id, :name, :email, :password)`,
      { id, name, email, password: hashed }
    );
  }

  const token = signToken({ id, role, email });
  res.status(201).json({ success: true, data: { id, role, email, token } });
});

// POST /auth/login  body: { role, email, password }
const login = asyncHandler(async (req, res) => {
  const { role, email, password } = req.body;
  const config = ROLE_CONFIG[role];
  if (!config) throw new ApiError(400, 'role must be one of: student, faculty, admin');

  const result = await db.execute(
    `SELECT ${config.idCol} AS ID, Name, Email, Password FROM ${config.table} WHERE Email = :email`,
    { email }
  );

  const user = result.rows[0];
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const match = await bcrypt.compare(password, user.PASSWORD);
  if (!match) throw new ApiError(401, 'Invalid email or password');

  const token = signToken({ id: user.ID, role, email: user.EMAIL });
  res.json({ success: true, data: { id: user.ID, name: user.NAME, role, email: user.EMAIL, token } });
});

module.exports = { register, login };
