const express = require('express');
const controller = require('../controllers/teamMemberController');

const router = express.Router();

// Full listing across all teams; per-team CRUD lives under /teams/:teamId/members
router.get('/', controller.getAll);

module.exports = router;
