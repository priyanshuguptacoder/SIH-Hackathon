const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const authMiddleware = require('../middleware/auth');

// POST /auth/register  — public
router.post('/register', register);

// POST /auth/login     — public
router.post('/login', login);

// GET  /auth/me        — protected
router.get('/me', authMiddleware, getMe);

module.exports = router;
