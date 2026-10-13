import bcrypt from 'bcryptjs';
import { authenticate } from '../auth/guard';
import { execute } from '../db';
import { createAuthAccount, deleteAuthAccount, syncAuthAccount } from '../auth/accounts';
import { ApiError } from '../errors';
import { checkEmailRule } from '../emailCheck';
import { intParams, ok, route } from '../http';
import { check, isEmail, isFloat, isInt, isString, minLength, notEmpty, optional } from '../validate';
import { partialSet } from './partial';

const SALT_ROUNDS = Number(process.env.BCRYPT_SALT_ROUNDS) || 10;
const trimmed = (v: unknown) => (typeof v === 'string' ? v.trim() : v);

// Password is never returned in any response.
const STUDENT_COLS = 'Student_ID, Name, Email, Department_ID, Year, Credits, Score';
const FACULTY_COLS = 'Faculty_ID, Name, Email, Department_ID, Designation, Score';

export const students = {
  getAll: route(async () => {
    const result = await execute(`SELECT ${STUDENT_COLS} FROM Student ORDER BY Student_ID`);
    return ok({ data: result.rows });
  }),

  getById: route(async ({ params }) => {
    intParams(params, 'id');
    const result = await execute(`SELECT ${STUDENT_COLS} FROM Student WHERE Student_ID = :id`, { id: params.id });
    if (!result.rows?.length) throw new ApiError(404, 'Student not found');
    return ok({ data: result.rows[0] });
  }),

  create: route(async ({ body }) => {
    check(body, {
      student_id: [isInt()],
      name: [isString, notEmpty],
      email: [isEmail],
      department_id: [isInt()],
      year: [isInt({ min: 1, max: 5 })],
      password: [minLength(6)],
      credits: [optional, isInt({ min: 0 })],
      score: [optional, isFloat({ min: 0, max: 100 })],
    });
    const { student_id, email, department_id, year, credits, password, score } = body;
    checkEmailRule('student', email);
    const name = trimmed(body.name);
    const hashed = await bcrypt.hash(String(password), SALT_ROUNDS);
    await execute(
      `INSERT INTO Student (Student_ID, Name, Email, Department_ID, Year, Credits, Password, Score)
       VALUES (:student_id, :name, :email, :department_id, :year, :credits, :password, :score)`,
      { student_id, name, email, department_id, year, credits: credits ?? 0, password: hashed, score: score ?? 0 }
    );
    try {
      await createAuthAccount('student', student_id, name, email, hashed);
    } catch (err) {
      await execute('DELETE FROM Student WHERE Student_ID = :id', { id: student_id });
      throw err;
    }
    return ok({ data: { student_id, name, email, department_id, year } }, 201);
  }),

  update: route(async ({ params, body }) => {
    intParams(params, 'id');
    check(body, {
      name: [isString, notEmpty],
      email: [isEmail],
      department_id: [isInt()],
      year: [isInt({ min: 1, max: 5 })],
      credits: [optional, isInt({ min: 0 })],
      score: [optional, isFloat({ min: 0, max: 100 })],
    });
    checkEmailRule('student', body.email);
    const binds: Record<string, unknown> = { id: params.id };
    const sets = partialSet(
      { Name: trimmed(body.name), Email: body.email, Department_ID: body.department_id, Year: body.year, Credits: body.credits, Score: body.score },
      binds
    );
    const result = await execute(`UPDATE Student SET ${sets} WHERE Student_ID = :id`, binds);
    if (!result.rowsAffected) throw new ApiError(404, 'Student not found');
    await syncAuthAccount('student', params.id, { name: trimmed(body.name), email: body.email });
    return ok({ message: 'Student updated' });
  }),

  // Requires a valid token, as before.
  remove: route(async ({ req, params }) => {
    intParams(params, 'id');
    await authenticate(req);
    const result = await execute('DELETE FROM Student WHERE Student_ID = :id', { id: params.id });
    if (!result.rowsAffected) throw new ApiError(404, 'Student not found');
    await deleteAuthAccount('student', params.id);
    return ok({ message: 'Student deleted' });
  }),

  // GET /api/students/:id/projects -> project history across years,
  // derived via Team_Member -> Team -> Project.
  projects: route(async ({ params }) => {
    intParams(params, 'id');
    const result = await execute(
      `SELECT p.Project_ID, p.Title, p.Academic_Year, p.Status, p.GitURL, p.Submission_Date,
              t.Team_ID, t.Team_Name
       FROM Project p
       JOIN Team t ON t.Team_ID = p.Team_ID
       JOIN Team_Member tm ON tm.Team_ID = t.Team_ID
       WHERE tm.Student_ID = :id
       ORDER BY p.Academic_Year DESC, p.Project_ID`,
      { id: params.id }
    );
    return ok({ data: result.rows });
  }),
};

export const faculty = {
  getAll: route(async () => {
    const result = await execute(`SELECT ${FACULTY_COLS} FROM Faculty ORDER BY Faculty_ID`);
    return ok({ data: result.rows });
  }),

  getById: route(async ({ params }) => {
    intParams(params, 'id');
    const result = await execute(`SELECT ${FACULTY_COLS} FROM Faculty WHERE Faculty_ID = :id`, { id: params.id });
    if (!result.rows?.length) throw new ApiError(404, 'Faculty not found');
    return ok({ data: result.rows[0] });
  }),

  create: route(async ({ body }) => {
    check(body, {
      faculty_id: [isInt()],
      name: [isString, notEmpty],
      email: [isEmail],
      department_id: [isInt()],
      designation: [optional, isString],
      password: [minLength(6)],
      score: [optional, isFloat({ min: 0, max: 100 })],
    });
    const { faculty_id, email, department_id, password, score } = body;
    checkEmailRule('faculty', email);
    const name = trimmed(body.name);
    const designation = body.designation ?? null;
    const hashed = await bcrypt.hash(String(password), SALT_ROUNDS);
    await execute(
      `INSERT INTO Faculty (Faculty_ID, Name, Email, Department_ID, Designation, Password, Score)
       VALUES (:faculty_id, :name, :email, :department_id, :designation, :password, :score)`,
      { faculty_id, name, email, department_id, designation, password: hashed, score: score ?? 0 }
    );
    try {
      await createAuthAccount('faculty', faculty_id, name, email, hashed);
    } catch (err) {
      await execute('DELETE FROM Faculty WHERE Faculty_ID = :id', { id: faculty_id });
      throw err;
    }
    return ok({ data: { faculty_id, name, email, department_id, designation } }, 201);
  }),

  update: route(async ({ params, body }) => {
    intParams(params, 'id');
    check(body, {
      name: [isString, notEmpty],
      email: [isEmail],
      department_id: [isInt()],
      designation: [optional, isString],
      score: [optional, isFloat({ min: 0, max: 100 })],
    });
    checkEmailRule('faculty', body.email);
    const binds: Record<string, unknown> = { id: params.id };
    const sets = partialSet(
      { Name: trimmed(body.name), Email: body.email, Department_ID: body.department_id, Designation: body.designation, Score: body.score },
      binds
    );
    const result = await execute(`UPDATE Faculty SET ${sets} WHERE Faculty_ID = :id`, binds);
    if (!result.rowsAffected) throw new ApiError(404, 'Faculty not found');
    await syncAuthAccount('faculty', params.id, { name: trimmed(body.name), email: body.email });
    return ok({ message: 'Faculty updated' });
  }),

  // Requires a valid token, as before.
  remove: route(async ({ req, params }) => {
    intParams(params, 'id');
    await authenticate(req);
    const result = await execute('DELETE FROM Faculty WHERE Faculty_ID = :id', { id: params.id });
    if (!result.rowsAffected) throw new ApiError(404, 'Faculty not found');
    await deleteAuthAccount('faculty', params.id);
    return ok({ message: 'Faculty deleted' });
  }),

  // GET /api/faculty/:id/guided-teams -> teams this faculty member guides.
  guidedTeams: route(async ({ params }) => {
    intParams(params, 'id');
    const result = await execute(
      `SELECT t.Team_ID, t.Team_Name, t.Leader_ID, s.Name AS Leader_Name
       FROM Team t
       JOIN Student s ON s.Student_ID = t.Leader_ID
       WHERE t.Guide_ID = :id
       ORDER BY t.Team_ID`,
      { id: params.id }
    );
    return ok({ data: result.rows });
  }),
};
