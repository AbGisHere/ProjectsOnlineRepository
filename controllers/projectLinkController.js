// Shared logic for the three Project <-> X junction tables
// (Project_Technology, Project_Domain, Project_Category). They all have the
// identical shape { Project_ID, X_ID }, so one factory avoids copy-pasting
// the same four handlers three times.
const db = require('../config/db');
const asyncHandler = require('../utils/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');

function makeLinkController({ table, otherTable, otherIdCol, otherNameCol }) {
  // GET /projects/:projectId/<things>
  const getByProject = asyncHandler(async (req, res) => {
    const result = await db.execute(
      `SELECT o.${otherIdCol}, o.${otherNameCol}
       FROM ${table} l
       JOIN ${otherTable} o ON o.${otherIdCol} = l.${otherIdCol}
       WHERE l.Project_ID = :projectId
       ORDER BY o.${otherIdCol}`,
      { projectId: req.params.projectId }
    );
    res.json({ success: true, data: result.rows });
  });

  // POST /projects/:projectId/<things>  body: { <other>_id }
  const addLink = asyncHandler(async (req, res) => {
    const { projectId } = req.params;
    const otherId = req.body[otherIdCol.toLowerCase()];
    await db.execute(
      `INSERT INTO ${table} (Project_ID, ${otherIdCol}) VALUES (:projectId, :otherId)`,
      { projectId, otherId }
    );
    res.status(201).json({ success: true, data: { project_id: Number(projectId), [otherIdCol]: otherId } });
  });

  // DELETE /projects/:projectId/<things>/:otherId
  const removeLink = asyncHandler(async (req, res) => {
    const { projectId, otherId } = req.params;
    const result = await db.execute(
      `DELETE FROM ${table} WHERE Project_ID = :projectId AND ${otherIdCol} = :otherId`,
      { projectId, otherId }
    );
    if (!result.rowsAffected) throw new ApiError(404, 'Link not found');
    res.json({ success: true, message: 'Link removed' });
  });

  const getAll = asyncHandler(async (req, res) => {
    const result = await db.execute(`SELECT * FROM ${table} ORDER BY Project_ID, ${otherIdCol}`);
    res.json({ success: true, data: result.rows });
  });

  return { getAll, getByProject, addLink, removeLink };
}

module.exports = {
  projectTechnologyController: makeLinkController({
    table: 'Project_Technology',
    otherTable: 'Technology',
    otherIdCol: 'Technology_ID',
    otherNameCol: 'Technology_Name',
  }),
  projectDomainController: makeLinkController({
    table: 'Project_Domain',
    otherTable: 'Domain',
    otherIdCol: 'Domain_ID',
    otherNameCol: 'Domain_Name',
  }),
  projectCategoryController: makeLinkController({
    table: 'Project_Category',
    otherTable: 'Category',
    otherIdCol: 'Category_ID',
    otherNameCol: 'Category_Name',
  }),
};
