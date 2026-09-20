const express = require('express');
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authController = require('../controllers/authController');

const router = express.Router();

router.post(
  '/register',
  [
    body('role').isIn(['student', 'faculty', 'admin']),
    body('id').isInt(),
    body('name').isString().trim().notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 6 }),
    body('department_id')
      .if(body('role').isIn(['student', 'faculty']))
      .isInt()
      .withMessage('department_id is required for student/faculty'),
    body('year')
      .if(body('role').equals('student'))
      .isInt({ min: 1, max: 5 })
      .withMessage('year is required for student (1-5)'),
  ],
  validate,
  authController.register
);

router.post(
  '/login',
  [
    body('role').isIn(['student', 'faculty', 'admin']),
    body('email').isEmail(),
    body('password').notEmpty(),
  ],
  validate,
  authController.login
);

module.exports = router;
