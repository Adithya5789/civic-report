const express = require('express');
const router = express.Router();
const assignmentController = require('./assignmentController.cjs');

router.post('/issues/:issueId/assign', assignmentController.assignFieldWorker);

module.exports = router;
