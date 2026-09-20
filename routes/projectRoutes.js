const express = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const controller = require('../controllers/projectController');
const {
  projectTechnologyController,
  projectDomainController,
  projectCategoryController,
} = require('../controllers/projectLinkController');

const router = express.Router();

// IMPORTANT: /search must be registered before the /:id routes, otherwise
// Express would try to match "search" as a Project_ID.
router.get(
  '/search',
  [
    query('title').optional().isString(),
    query('domain').optional().isString(),
    query('department').optional().isString(),
    query('technology').optional().isString(),
    query('year').optional().isString(),
  ],
  validate,
  controller.search
);

router.get('/', controller.getAll);
router.get('/:id', param('id').isInt(), validate, controller.getById);
router.get('/:id/evaluations', param('id').isInt(), validate, controller.getEvaluations);
router.get('/:id/average-score', param('id').isInt(), validate, controller.getAverageScore);

router.post(
  '/',
  [
    body('project_id').isInt(),
    body('title').isString().trim().notEmpty(),
    body('abstract').optional().isString(),
    body('academic_year').isString().notEmpty(),
    body('team_id').isInt(),
    body('status').optional().isIn(['ONGOING', 'COMPLETED', 'SUBMITTED', 'REJECTED']),
    body('git_url').optional().isURL(),
    body('submission_date').optional().isISO8601(),
  ],
  validate,
  controller.create
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('title').isString().trim().notEmpty(),
    body('abstract').optional().isString(),
    body('academic_year').isString().notEmpty(),
    body('team_id').isInt(),
    body('status').isIn(['ONGOING', 'COMPLETED', 'SUBMITTED', 'REJECTED']),
    body('git_url').optional().isURL(),
    body('submission_date').optional().isISO8601(),
  ],
  validate,
  controller.update
);

router.delete('/:id', param('id').isInt(), validate, controller.remove);

// --- Project_Technology ---
router.get('/:projectId/technologies', param('projectId').isInt(), validate, projectTechnologyController.getByProject);
router.post(
  '/:projectId/technologies',
  [param('projectId').isInt(), body('technology_id').isInt()],
  validate,
  projectTechnologyController.addLink
);
router.delete(
  '/:projectId/technologies/:otherId',
  [param('projectId').isInt(), param('otherId').isInt()],
  validate,
  projectTechnologyController.removeLink
);

// --- Project_Domain ---
router.get('/:projectId/domains', param('projectId').isInt(), validate, projectDomainController.getByProject);
router.post(
  '/:projectId/domains',
  [param('projectId').isInt(), body('domain_id').isInt()],
  validate,
  projectDomainController.addLink
);
router.delete(
  '/:projectId/domains/:otherId',
  [param('projectId').isInt(), param('otherId').isInt()],
  validate,
  projectDomainController.removeLink
);

// --- Project_Category ---
router.get('/:projectId/categories', param('projectId').isInt(), validate, projectCategoryController.getByProject);
router.post(
  '/:projectId/categories',
  [param('projectId').isInt(), body('category_id').isInt()],
  validate,
  projectCategoryController.addLink
);
router.delete(
  '/:projectId/categories/:otherId',
  [param('projectId').isInt(), param('otherId').isInt()],
  validate,
  projectCategoryController.removeLink
);

module.exports = router;
