const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getComplianceItems, getComplianceItem, updateComplianceItem } = require('../controllers/complianceController');

router.get('/', authMiddleware, getComplianceItems);
router.get('/:id', authMiddleware, getComplianceItem);
router.put('/:id', authMiddleware, updateComplianceItem);

module.exports = router;
