const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');

// Role guard — Admin only
const adminOnly = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Admin access required' } });
  }
  next();
};

const {
  createApproval, updateApproval, listApprovals,
  createRule, updateRule, listRules,
  createComplianceRule, listComplianceRules,
  createScheme, listSchemes,
  getDashboardStats,
  getAuditLogs,
  getApplicationsForReview,
  getApplicationForReview,
  reviewApplication
} = require('../controllers/adminController');

// ─── POST /admin/seed-admin ───────────────────────────────────────────────────
// One-time endpoint to create the Admin account after deployment.
// Protected by SEED_SECRET env variable — not by JWT.
// Once the admin exists, this endpoint safely does nothing.
// Usage: POST /admin/seed-admin  with header  x-seed-secret: <your secret>
router.post('/seed-admin', async (req, res) => {
  try {
    const secret = process.env.SEED_SECRET;

    // SEED_SECRET must be set in .env — refuse if missing
    if (!secret) {
      return res.status(503).json({ success: false, message: 'Seed not configured on this server' });
    }

    // Validate the secret from the request header
    const provided = req.headers['x-seed-secret'];
    if (!provided || provided !== secret) {
      return res.status(401).json({ success: false, message: 'Invalid seed secret' });
    }

    // Check if admin already exists — idempotent, safe to call multiple times
    const existing = await User.findOne({ role: 'Admin' });
    if (existing) {
      return res.json({ success: true, message: 'Admin account already exists', email: existing.email });
    }

    // Create admin — password hashed by User model pre-save hook
    const admin = new User({
      name: process.env.ADMIN_NAME || 'Admin Authority',
      email: (process.env.ADMIN_EMAIL || 'admin@gmail.com').toLowerCase(),
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'Admin'
    });

    await admin.save();

    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully',
      email: admin.email
    });
  } catch (err) {
    console.error('Seed Admin Error:', err);
    return res.status(500).json({ success: false, message: err.message });
  }
});

// All admin routes require authentication AND admin role
router.use(authMiddleware, adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Application Review (Admin acting as Authority)
router.get('/applications', getApplicationsForReview);
router.get('/applications/:id', getApplicationForReview);
router.put('/applications/:id/review', reviewApplication);

// Approvals
router.get('/approvals', listApprovals);
router.post('/approvals', createApproval);
router.put('/approvals/:id', updateApproval);

// Regulatory Rules
router.get('/rules', listRules);
router.post('/rules', createRule);
router.put('/rules/:id', updateRule);

// Compliance Rules
router.get('/compliance-rules', listComplianceRules);
router.post('/compliance-rules', createComplianceRule);

// Schemes
router.get('/schemes', listSchemes);
router.post('/schemes', createScheme);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;
