const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const controller = require('../controllers/departmentController');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', param('id').isInt(), validate, controller.getById);

router.post(
  '/',
  [body('department_id').isInt(), body('department_name').isString().trim().notEmpty()],
  validate,
  controller.create
);

router.put(
  '/:id',
  [param('id').isInt(), body('department_name').isString().trim().notEmpty()],
  validate,
  controller.update
);

router.delete('/:id', param('id').isInt(), validate, controller.remove);

module.exports = router;
