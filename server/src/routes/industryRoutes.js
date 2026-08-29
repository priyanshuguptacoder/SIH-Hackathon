const express = require('express');
const router = express.Router();
const { createIndustryProfile, getMyIndustryProfile, updateIndustryProfile } = require('../controllers/industryController');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, createIndustryProfile);
router.get('/me', authMiddleware, getMyIndustryProfile);
router.put('/:id', authMiddleware, updateIndustryProfile);

module.exports = router;
