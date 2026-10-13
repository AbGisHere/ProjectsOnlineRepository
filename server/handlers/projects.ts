import { execute } from '../db';
import { ApiError } from '../errors';
import { intParams, ok, route } from '../http';
import { check, isFloat, isIn, isInt, isISO8601, isString, isURL, notEmpty, optional } from '../validate';
import { partialSet } from './partial';

const STATUSES = ['ONGOING', 'COMPLETED', 'SUBMITTED', 'REJECTED'] as const;
const PROJECT_SELECT = `SELECT p.*, t.Team_Name
     FROM Project p
     JOIN Team t ON t.Team_ID = p.Team_ID`;

export const projects = {
  getAll: route(async () => {
    const result = await execute(`${PROJECT_SELECT} ORDER BY p.Project_ID`);
    return ok({ data: result.rows });
  }),

  getById: route(async ({ params }) => {
    intParams(params, 'id');
    const result = await execute(`${PROJECT_SELECT} WHERE p.Project_ID = :id`, { id: params.id });
    if (!result.rows?.length) throw new ApiError(404, 'Project not found');
    return ok({ data: result.rows[0] });
  }),

  create: route(async ({ body }) => {
    check(body, {
      project_id: [isInt()],
      title: [isString, notEmpty],
      abstract: [optional, isString],
      academic_year: [isString, notEmpty],
      team_id: [isInt()],
      status: [optional, isIn(STATUSES)],
      git_url: [optional, isURL],
      submission_date: [optional, isISO8601],
    });
    const { project_id, abstract, academic_year, team_id, status, git_url, submission_date } = body;
    const title = String(body.title).trim();
    await execute(
      `INSERT INTO Project (Project_ID, Title, Abstract, Academic_Year, Team_ID, Status, GitURL, Submission_Date)
       VALUES (:project_id, :title, :abstract, :academic_year, :team_id, :status,
               :git_url, ${submission_date ? "TO_DATE(:submission_date, 'YYYY-MM-DD')" : 'NULL'})`,
      {
        project_id,
        title,
        abstract: abstract || null,
        academic_year,
        team_id,
        status: status || 'ONGOING',
        git_url: git_url || null,
        ...(submission_date ? { submission_date } : {}),
      }
    );
    return ok({ data: { project_id, title, academic_year, team_id } }, 201);
  }),

  update: route(async ({ params, body }) => {
    intParams(params, 'id');
    check(body, {
      title: [isString, notEmpty],
      abstract: [optional, isString],
      academic_year: [isString, notEmpty],
      team_id: [isInt()],
      status: [isIn(STATUSES)],
      git_url: [optional, isURL],
      submission_date: [optional, isISO8601],
    });
    const binds: Record<string, unknown> = { id: params.id };
    const fields: Record<string, unknown> = {
      Title: typeof body.title === 'string' ? body.title.trim() : body.title,
      Abstract: body.abstract,
      Academic_Year: body.academic_year,
      Team_ID: body.team_id,
      Status: body.status,
      GitURL: body.git_url,
    };
    let sets = Object.values(fields).some((v) => v !== undefined) ? partialSet(fields, binds) : '';
    if (body.submission_date !== undefined) {
      sets = [sets, "Submission_Date = TO_DATE(:submission_date, 'YYYY-MM-DD')"].filter(Boolean).join(', ');
      binds.submission_date = body.submission_date;
    }
    if (!sets) throw new ApiError(400, 'No fields to update');

    const result = await execute(`UPDATE Project SET ${sets} WHERE Project_ID = :id`, binds);
    if (!result.rowsAffected) throw new ApiError(404, 'Project not found');
    return ok({ message: 'Project updated' });
  }),

  remove: route(async ({ params }) => {
    intParams(params, 'id');
    const result = await execute('DELETE FROM Project WHERE Project_ID = :id', { id: params.id });
    if (!result.rowsAffected) throw new ApiError(404, 'Project not found');
    return ok({ message: 'Project deleted' });
  }),

  // GET /api/projects/search?title=&domain=&department=&technology=&year=
  // All filters optional, combined with AND. domain/technology/department
  // match by name (case-insensitive substring); year matches exactly.
  search: route(async ({ query }) => {
    const title = query.get('title');
    const domain = query.get('domain');
    const department = query.get('department');
    const technology = query.get('technology');
    const year = query.get('year');

    const conditions: string[] = [];
    const binds: Record<string, unknown> = {};

    if (title) {
      conditions.push('LOWER(p.Title) LIKE LOWER(:title)');
      binds.title = `%${title}%`;
    }
    if (year) {
      conditions.push('p.Academic_Year = :year');
      binds.year = year;
    }
    if (department) {
      conditions.push(`EXISTS (
        SELECT 1 FROM Team t2
        JOIN Team_Member tm2 ON tm2.Team_ID = t2.Team_ID
        JOIN Student s2 ON s2.Student_ID = tm2.Student_ID
        JOIN Department d2 ON d2.Department_ID = s2.Department_ID
        WHERE t2.Team_ID = p.Team_ID AND LOWER(d2.Department_Name) LIKE LOWER(:department)
      )`);
      binds.department = `%${department}%`;
    }
    if (domain) {
      conditions.push(`EXISTS (
        SELECT 1 FROM Project_Domain pd
        JOIN Domain dm ON dm.Domain_ID = pd.Domain_ID
        WHERE pd.Project_ID = p.Project_ID AND LOWER(dm.Domain_Name) LIKE LOWER(:domain)
      )`);
      binds.domain = `%${domain}%`;
    }
    if (technology) {
      conditions.push(`EXISTS (
        SELECT 1 FROM Project_Technology pt
        JOIN Technology tc ON tc.Technology_ID = pt.Technology_ID
        WHERE pt.Project_ID = p.Project_ID AND LOWER(tc.Technology_Name) LIKE LOWER(:technology)
      )`);
      binds.technology = `%${technology}%`;
    }

    // No DISTINCT: Abstract is a CLOB and Oracle can't compare CLOBs
    // (ORA-22848). Every filter is an EXISTS subquery, so rows can't repeat.
    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const result = await execute(`${PROJECT_SELECT} ${where} ORDER BY p.Project_ID`, binds);
    return Response.json({ success: true, count: result.rows?.length ?? 0, data: result.rows });
  }),

  // GET /api/projects/:id/evaluations
  evaluations: route(async ({ params }) => {
    intParams(params, 'id');
    const result = await execute(
      `SELECT e.Evaluation_ID, e.Score, e.Feedback, e.Evaluation_Date,
              f.Faculty_ID, f.Name AS Faculty_Name
       FROM Evaluation e
       JOIN Faculty f ON f.Faculty_ID = e.Faculty_ID
       WHERE e.Project_ID = :id
       ORDER BY e.Evaluation_Date`,
      { id: params.id }
    );
    return ok({ data: result.rows });
  }),

  // GET /api/projects/:id/average-score
  averageScore: route(async ({ params }) => {
    intParams(params, 'id');
    const project = await execute('SELECT Project_ID FROM Project WHERE Project_ID = :id', { id: params.id });
    if (!project.rows?.length) throw new ApiError(404, 'Project not found');
    const result = await execute(
      `SELECT COUNT(*) AS Evaluation_Count, ROUND(AVG(Score), 2) AS Average_Score,
              MIN(Score) AS Min_Score, MAX(Score) AS Max_Score
       FROM Evaluation
       WHERE Project_ID = :id`,
      { id: params.id }
    );
    return ok({ data: result.rows?.[0] });
  }),
};

// Project_Technology, Project_Domain and Project_Category share one shape
// { Project_ID, X_ID }, so one factory serves all three.
function linkHandlers(table: string, other: string) {
  const otherIdCol = `${other}_ID`;
  const otherNameCol = `${other}_Name`;
  const bodyKey = otherIdCol.toLowerCase();
  return {
    // GET /api/projects/:id/<things>
    getByProject: route(async ({ params }) => {
      intParams(params, 'id');
      const result = await execute(
        `SELECT o.${otherIdCol}, o.${otherNameCol}
         FROM ${table} l
         JOIN ${other} o ON o.${otherIdCol} = l.${otherIdCol}
         WHERE l.Project_ID = :projectId
         ORDER BY o.${otherIdCol}`,
        { projectId: params.id }
      );
      return ok({ data: result.rows });
    }),
    // POST /api/projects/:id/<things>  body: { <other>_id }
    add: route(async ({ params, body }) => {
      intParams(params, 'id');
      check(body, { [bodyKey]: [isInt()] });
      const otherId = body[bodyKey];
      await execute(`INSERT INTO ${table} (Project_ID, ${otherIdCol}) VALUES (:projectId, :otherId)`, { projectId: params.id, otherId });
      return ok({ data: { project_id: Number(params.id), [otherIdCol]: otherId } }, 201);
    }),
    // DELETE /api/projects/:id/<things>/:otherId
    remove: route(async ({ params }) => {
      intParams(params, 'id', 'otherId');
      const result = await execute(`DELETE FROM ${table} WHERE Project_ID = :projectId AND ${otherIdCol} = :otherId`, {
        projectId: params.id,
        otherId: params.otherId,
      });
      if (!result.rowsAffected) throw new ApiError(404, 'Link not found');
      return ok({ message: 'Link removed' });
    }),
    // GET /api/<things>/links/all
    getAll: route(async () => {
      const result = await execute(`SELECT * FROM ${table} ORDER BY Project_ID, ${otherIdCol}`);
      return ok({ data: result.rows });
    }),
  };
}

export const projectTechnologies = linkHandlers('Project_Technology', 'Technology');
export const projectDomains = linkHandlers('Project_Domain', 'Domain');
export const projectCategories = linkHandlers('Project_Category', 'Category');

export const evaluations = {
  getAll: route(async () => {
    const result = await execute(
      `SELECT e.*, p.Title AS Project_Title, f.Name AS Faculty_Name
       FROM Evaluation e
       JOIN Project p ON p.Project_ID = e.Project_ID
       JOIN Faculty f ON f.Faculty_ID = e.Faculty_ID
       ORDER BY e.Evaluation_ID`
    );
    return ok({ data: result.rows });
  }),

  getById: route(async ({ params }) => {
    intParams(params, 'id');
    const result = await execute(
      `SELECT e.*, p.Title AS Project_Title, f.Name AS Faculty_Name
       FROM Evaluation e
       JOIN Project p ON p.Project_ID = e.Project_ID
       JOIN Faculty f ON f.Faculty_ID = e.Faculty_ID
       WHERE e.Evaluation_ID = :id`,
      { id: params.id }
    );
    if (!result.rows?.length) throw new ApiError(404, 'Evaluation not found');
    return ok({ data: result.rows[0] });
  }),

  create: route(async ({ body }) => {
    check(body, {
      evaluation_id: [isInt()],
      project_id: [isInt()],
      faculty_id: [isInt()],
      score: [isFloat({ min: 0, max: 100 })],
      feedback: [optional, isString],
    });
    const { evaluation_id, project_id, faculty_id, score, feedback } = body;
    await execute(
      `INSERT INTO Evaluation (Evaluation_ID, Project_ID, Faculty_ID, Score, Feedback, Evaluation_Date)
       VALUES (:evaluation_id, :project_id, :faculty_id, :score, :feedback, SYSDATE)`,
      { evaluation_id, project_id, faculty_id, score, feedback: feedback || null }
    );
    return ok({ data: { evaluation_id, project_id, faculty_id, score } }, 201);
  }),

  update: route(async ({ params, body }) => {
    intParams(params, 'id');
    check(body, { score: [isFloat({ min: 0, max: 100 })], feedback: [optional, isString] });
    const binds: Record<string, unknown> = { id: params.id };
    const sets = partialSet({ Score: body.score, Feedback: body.feedback }, binds);
    const result = await execute(`UPDATE Evaluation SET ${sets} WHERE Evaluation_ID = :id`, binds);
    if (!result.rowsAffected) throw new ApiError(404, 'Evaluation not found');
    return ok({ message: 'Evaluation updated' });
  }),

  remove: route(async ({ params }) => {
    intParams(params, 'id');
    const result = await execute('DELETE FROM Evaluation WHERE Evaluation_ID = :id', { id: params.id });
    if (!result.rowsAffected) throw new ApiError(404, 'Evaluation not found');
    return ok({ message: 'Evaluation deleted' });
  }),
};
