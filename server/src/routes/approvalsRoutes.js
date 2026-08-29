const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { analyzeProfile, getApprovalRoadmap } = require('../controllers/approvalsController');

router.post('/analyze', authMiddleware, analyzeProfile);
router.get('/roadmap/:industryId', authMiddleware, getApprovalRoadmap);

module.exports = router;
