const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

const getAll = asyncHandler(async (req, res) => {
  const result = await db.execute(
    `SELECT p.*, t.Team_Name
     FROM Project p
     JOIN Team t ON t.Team_ID = p.Team_ID
     ORDER BY p.Project_ID`
  );
  res.json({ success: true, data: result.rows });
});

const getById = asyncHandler(async (req, res) => {
  const result = await db.execute(
    `SELECT p.*, t.Team_Name
     FROM Project p
     JOIN Team t ON t.Team_ID = p.Team_ID
     WHERE p.Project_ID = :id`,
    { id: req.params.id }
  );
  if (!result.rows.length) throw new ApiError(404, 'Project not found');
  res.json({ success: true, data: result.rows[0] });
});

const create = asyncHandler(async (req, res) => {
  const { project_id, title, abstract, academic_year, team_id, status, git_url, submission_date } =
    req.body;
  await db.execute(
    `INSERT INTO Project (Project_ID, Title, Abstract, Academic_Year, Team_ID, Status, GitURL, Submission_Date)
     VALUES (:project_id, :title, :abstract, :academic_year, :team_id, :status,
             :git_url, ${submission_date ? 'TO_DATE(:submission_date, \'YYYY-MM-DD\')' : 'NULL'})`,
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
  res.status(201).json({ success: true, data: { project_id, title, academic_year, team_id } });
});

const update = asyncHandler(async (req, res) => {
  const { title, abstract, academic_year, team_id, status, git_url, submission_date } = req.body;
  const result = await db.execute(
    `UPDATE Project
     SET Title = :title, Abstract = :abstract, Academic_Year = :academic_year,
         Team_ID = :team_id, Status = :status, GitURL = :git_url,
         Submission_Date = ${submission_date ? 'TO_DATE(:submission_date, \'YYYY-MM-DD\')' : 'NULL'}
     WHERE Project_ID = :id`,
    {
      title,
      abstract,
      academic_year,
      team_id,
      status,
      git_url,
      id: req.params.id,
      ...(submission_date ? { submission_date } : {}),
    }
  );
  if (!result.rowsAffected) throw new ApiError(404, 'Project not found');
  res.json({ success: true, message: 'Project updated' });
});

const remove = asyncHandler(async (req, res) => {
  const result = await db.execute('DELETE FROM Project WHERE Project_ID = :id', {
    id: req.params.id,
  });
  if (!result.rowsAffected) throw new ApiError(404, 'Project not found');
  res.json({ success: true, message: 'Project deleted' });
});

// GET /projects/search?title=&domain=&department=&technology=&year=
// All filters are optional and combine with AND. `domain`/`technology`
// match by name (case-insensitive substring); `department` matches by
// department name; `year` matches Academic_Year exactly.
const search = asyncHandler(async (req, res) => {
  const { title, domain, department, technology, year } = req.query;

  const conditions = [];
  const binds = {};

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

  // NOTE: no DISTINCT here — Abstract is a CLOB and Oracle can't compare
  // CLOBs for uniqueness (ORA-22848). It's unneeded anyway: every filter
  // above is an EXISTS subquery, not a join, so Project rows can't be
  // duplicated by the WHERE clause.
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const result = await db.execute(
    `SELECT p.*, t.Team_Name
     FROM Project p
     JOIN Team t ON t.Team_ID = p.Team_ID
     ${where}
     ORDER BY p.Project_ID`,
    binds
  );
  res.json({ success: true, count: result.rows.length, data: result.rows });
});

// GET /projects/:id/evaluations -> all faculty evaluations for a project.
const getEvaluations = asyncHandler(async (req, res) => {
  const result = await db.execute(
    `SELECT e.Evaluation_ID, e.Score, e.Feedback, e.Evaluation_Date,
            f.Faculty_ID, f.Name AS Faculty_Name
     FROM Evaluation e
     JOIN Faculty f ON f.Faculty_ID = e.Faculty_ID
     WHERE e.Project_ID = :id
     ORDER BY e.Evaluation_Date`,
    { id: req.params.id }
  );
  res.json({ success: true, data: result.rows });
});

// GET /projects/:id/average-score -> aggregate score across evaluators.
const getAverageScore = asyncHandler(async (req, res) => {
  const project = await db.execute('SELECT Project_ID FROM Project WHERE Project_ID = :id', {
    id: req.params.id,
  });
  if (!project.rows.length) throw new ApiError(404, 'Project not found');

  const result = await db.execute(
    `SELECT COUNT(*) AS Evaluation_Count, ROUND(AVG(Score), 2) AS Average_Score,
            MIN(Score) AS Min_Score, MAX(Score) AS Max_Score
     FROM Evaluation
     WHERE Project_ID = :id`,
    { id: req.params.id }
  );
  res.json({ success: true, data: result.rows[0] });
});

module.exports = {
  getAll,
  getById,
  create,
  update,
  remove,
  search,
  getEvaluations,
  getAverageScore,
};
