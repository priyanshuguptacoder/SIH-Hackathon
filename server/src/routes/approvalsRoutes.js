const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { analyzeProfile, getApprovalRoadmap, getApprovalDetail } = require('../controllers/approvalsController');

router.post('/analyze',                authMiddleware, analyzeProfile);
router.get('/roadmap/:industryId',     authMiddleware, getApprovalRoadmap);
router.get('/:id/detail',             authMiddleware, getApprovalDetail);

module.exports = router;
