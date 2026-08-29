const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Helper: Generate JWT — fails loudly if JWT_SECRET not set
const generateToken = (user) => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured in environment');
  }
  return jwt.sign(
    { id: user._id, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

// @route   POST /auth/register
// @desc    Register a new user
// @access  Public
const register = async (req, res) => {
  const { name, email, password, confirmPassword, role } = req.body;

  if (!name || !email || !password || !confirmPassword) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Please fill all required fields' }
    });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Passwords do not match' }
    });
  }

  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Password must be at least 6 characters' }
    });
  }

  // Prevent clients from self-assigning Admin role
  if (role && role === 'Admin') {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Cannot self-assign Admin role' }
    });
  }

  try {
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: { code: 'DUPLICATE_EMAIL', message: 'Email already exists' }
      });
    }

    // Create user — password is hashed by the pre-save hook in User model
    // PUBLIC REGISTRATION: Force 'Industry' role (never trust client-provided role)
    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: 'Industry', // Always default — Admin must be set directly in DB
    });

    await user.save();
    const token = generateToken(user);

    return res.status(201).json({
      success: true,
      data: {
        token,
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Register Error:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Server error during registration' }
    });
  }
};

// @route   POST /auth/login
// @desc    Authenticate user and return JWT
// @access  Public
const login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Please provide email and password' }
    });
  }

  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid credentials' }
      });
    }

    const token = generateToken(user);

    return res.json({
      success: true,
      data: {
        token,
        userId: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error('Login Error:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Server error during login' }
    });
  }
};

// @route   GET /auth/me
// @desc    Get currently authenticated user's profile
// @access  Protected
const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'User not found' }
      });
    }
    return res.json({ success: true, data: user });
  } catch (error) {
    console.error('GetMe Error:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Server error' }
    });
  }
};

module.exports = { register, login, getMe };
