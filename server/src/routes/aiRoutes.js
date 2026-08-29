const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const { chat } = require('../controllers/aiController');

router.post('/chat', authMiddleware, chat);

module.exports = router;
