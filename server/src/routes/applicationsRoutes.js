const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createApplication, updateApplicationStatus, getApplications, getApplication } = require('../controllers/applicationsController');

router.post('/', authMiddleware, createApplication);
router.get('/', authMiddleware, getApplications);
router.get('/:id', authMiddleware, getApplication);
router.put('/:id/status', authMiddleware, updateApplicationStatus);

module.exports = router;
