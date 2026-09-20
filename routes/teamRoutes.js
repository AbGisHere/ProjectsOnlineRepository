const express = require('express');
const { body, param } = require('express-validator');
const validate = require('../middleware/validate');
const controller = require('../controllers/teamController');
const memberController = require('../controllers/teamMemberController');

const router = express.Router();

router.get('/', controller.getAll);
router.get('/:id', param('id').isInt(), validate, controller.getById);

router.post(
  '/',
  [
    body('team_id').isInt(),
    body('team_name').isString().trim().notEmpty(),
    body('leader_id').isInt(),
    body('guide_id').isInt(),
  ],
  validate,
  controller.create
);

router.put(
  '/:id',
  [
    param('id').isInt(),
    body('team_name').isString().trim().notEmpty(),
    body('leader_id').optional().isInt(),
    body('guide_id').optional().isInt(),
  ],
  validate,
  controller.update
);

router.delete('/:id', param('id').isInt(), validate, controller.remove);

// Team_Member sub-resource
router.get('/:teamId/members', param('teamId').isInt(), validate, memberController.getByTeam);
router.post(
  '/:teamId/members',
  [param('teamId').isInt(), body('student_id').isInt()],
  validate,
  memberController.addMember
);
router.delete(
  '/:teamId/members/:studentId',
  [param('teamId').isInt(), param('studentId').isInt()],
  validate,
  memberController.removeMember
);

module.exports = router;
