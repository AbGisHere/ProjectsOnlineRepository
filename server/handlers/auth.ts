import bcrypt from 'bcryptjs';
import { signToken, type Role } from '../auth/jwt';
import { execute } from '../db';
import { createAuthAccount } from '../auth/accounts';
import { ApiError } from '../errors';
import { checkEmailRule } from '../emailCheck';
import { ok, route } from '../http';
import { check, isEmail, isIn, isInt, isString, minLength, notEmpty, when } from '../validate';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const ROLES = ['student', 'faculty', 'admin'] as const;

// Table/PK-column config per role so register/login can stay generic.
const ROLE_CONFIG: Record<Role, { table: string; idCol: string }> = {
  student: { table: 'Student', idCol: 'Student_ID' },
  faculty: { table: 'Faculty', idCol: 'Faculty_ID' },
  admin: { table: 'Admin', idCol: 'Admin_ID' },
};

// POST /api/auth/register: creates the Student/Faculty/Admin row and its web
// sign-in account, and returns a JWT for API clients.
// body: { role, id, name, email, password, department_id?, year?, designation? }
export const register = route(async ({ body }) => {
  check(body, {
    role: [isIn(ROLES)],
    id: [isInt()],
    name: [isString, notEmpty],
    email: [isEmail],
    password: [minLength(6)],
    department_id: [when((b) => b.role === 'student' || b.role === 'faculty', [isInt()], 'department_id is required for student/faculty')],
    year: [when((b) => b.role === 'student', [isInt({ min: 1, max: 5 })], 'year is required for student (1-5)')],
  });
  const { role, id, name, email, password, department_id, year, designation } = body as Record<string, never>;
  checkEmailRule(role, email);
  const hashed = await bcrypt.hash(String(password), SALT_ROUNDS);
  const { table, idCol } = ROLE_CONFIG[role as Role];

  if (role === 'student') {
    await execute(
      `INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score)
       VALUES (:id, :name, :email, :department_id, :year, 0, :password, 0)`,
      { id, name, email, department_id, year, password: hashed }
    );
  } else if (role === 'faculty') {
    await execute(
      `INSERT INTO Faculty (Faculty_ID, Name, Email, Department_ID, Designation, Password, Score)
       VALUES (:id, :name, :email, :department_id, :designation, :password, 0)`,
      { id, name, email, department_id, designation: designation || null, password: hashed }
    );
  } else {
    await execute('INSERT INTO Admin (Admin_ID, Name, Email, Password) VALUES (:id, :name, :email, :password)', {
      id, name, email, password: hashed,
    });
  }

  // Also open the web sign-in account; undo the person row if that fails so
  // the two never drift apart.
  try {
    await createAuthAccount(role, id, name, email, hashed);
  } catch (err) {
    await execute(`DELETE FROM ${table} WHERE ${idCol} = :id`, { id });
    throw err;
  }

  const token = signToken({ id, role, email });
  return ok({ data: { id, role, email, token } }, 201);
});

// POST /api/auth/login  body: { role, email, password }
// Token login for API clients. The web app signs in through Better Auth
// (/api/auth/sign-in/email) instead.
export const login = route(async ({ body }) => {
  check(body, { role: [isIn(ROLES)], email: [isEmail], password: [notEmpty] });
  const role = body.role as Role;
  const config = ROLE_CONFIG[role];

  const result = await execute<{ ID: number; NAME: string; EMAIL: string; PASSWORD: string }>(
    `SELECT ${config.idCol} AS ID, Name, Email, Password FROM ${config.table} WHERE Email = :email`,
    { email: body.email }
  );
  const user = result.rows?.[0];
  if (!user) throw new ApiError(401, 'Invalid email or password');

  const match = await bcrypt.compare(String(body.password), user.PASSWORD);
  if (!match) throw new ApiError(401, 'Invalid email or password');

  const token = signToken({ id: user.ID, role, email: user.EMAIL });
  return ok({ data: { id: user.ID, name: user.NAME, role, email: user.EMAIL, token } });
});
