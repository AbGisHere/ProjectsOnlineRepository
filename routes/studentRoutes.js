const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const controller = require('../controllers/studentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', param('id').isInt(), validate, controller.getById);
router.get('/:id/projects', param('id').isInt(), validate, controller.getProjectHistory);

router.post(
  '/',
  [
    body('student_id').isInt(),
    body('name').isString().trim().notEmpty(),
    body('email').isEmail(),
    body('department_id').isInt(),
    body('year').isInt({ min: 1, max: 5 }),
    body('password').isLength({ min: 6 }),
    body('credits').optional().isInt({ min: 0 }),
    body('score').optional().isFloat({ min: 0, max: 100 }),
  ],
  validate,
  controller.create
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('name').isString().trim().notEmpty(),
    body('email').isEmail(),
    body('department_id').isInt(),
    body('year').isInt({ min: 1, max: 5 }),
    body('credits').optional().isInt({ min: 0 }),
    body('score').optional().isFloat({ min: 0, max: 100 }),
  ],
  validate,
  controller.update
);

router.delete('/:id', param('id').isInt(), validate, authenticate, controller.remove);

module.exports = router;
