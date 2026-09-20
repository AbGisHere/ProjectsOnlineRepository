const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const controller = require('../controllers/categoryController');
const { projectCategoryController } = require('../controllers/projectLinkController');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', param('id').isInt(), validate, controller.getById);

router.post(
  '/',
  [body('category_id').isInt(), body('category_name').isString().trim().notEmpty()],
  validate,
  controller.create
);

router.put(
  '/:id',
  [param('id').isInt(), body('category_name').isString().trim().notEmpty()],
  validate,
  controller.update
);

router.delete('/:id', param('id').isInt(), validate, controller.remove);

router.get('/links/all', projectCategoryController.getAll);

module.exports = router;
