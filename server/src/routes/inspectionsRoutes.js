const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { createInspection, getInspections, updateInspection } = require('../controllers/inspectionsController');

router.post('/', authMiddleware, createInspection);
router.get('/', authMiddleware, getInspections);
router.put('/:id', authMiddleware, updateInspection);

module.exports = router;
