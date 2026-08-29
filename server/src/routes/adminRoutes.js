const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

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
  getAuditLogs
} = require('../controllers/adminController');

// All admin routes require authentication AND admin role
router.use(authMiddleware, adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

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
