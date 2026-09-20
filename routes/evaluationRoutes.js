const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const controller = require('../controllers/evaluationController');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', param('id').isInt(), validate, controller.getById);

router.post(
  '/',
  [
    body('evaluation_id').isInt(),
    body('project_id').isInt(),
    body('faculty_id').isInt(),
    body('score').isFloat({ min: 0, max: 100 }),
    body('feedback').optional().isString(),
  ],
  validate,
  controller.create
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('score').isFloat({ min: 0, max: 100 }),
    body('feedback').optional().isString(),
  ],
  validate,
  controller.update
);

router.delete('/:id', param('id').isInt(), validate, controller.remove);

module.exports = router;
