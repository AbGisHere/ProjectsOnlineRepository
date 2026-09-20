const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const controller = require('../controllers/technologyController');
const { projectTechnologyController } = require('../controllers/projectLinkController');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', param('id').isInt(), validate, controller.getById);

router.post(
  '/',
  [body('technology_id').isInt(), body('technology_name').isString().trim().notEmpty()],
  validate,
  controller.create
);

router.put(
  '/:id',
  [param('id').isInt(), body('technology_name').isString().trim().notEmpty()],
  validate,
  controller.update
);

router.delete('/:id', param('id').isInt(), validate, controller.remove);

// Junction table listing (Project_Technology links)
router.get('/links/all', projectTechnologyController.getAll);

module.exports = router;
