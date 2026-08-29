const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { getMatchedSchemes } = require('../controllers/schemesController');

router.get('/matched/:industryId', authMiddleware, getMatchedSchemes);

module.exports = router;
