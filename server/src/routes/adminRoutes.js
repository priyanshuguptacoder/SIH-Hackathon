const express = require('express');
const router  = express.Router();
const multer  = require('multer');
const path    = require('path');
const fs      = require('fs');
const authMiddleware = require('../middleware/auth');
const User    = require('../models/User');

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
  createScheme, updateScheme, deleteScheme, listSchemes,
  uploadRegulation, listRegulations, deleteRegulation,
  listKnowledgeBase,
  getDashboardStats,
  getAuditLogs,
  getApplicationsForReview,
  getApplicationForReview,
  reviewApplication
} = require('../controllers/adminController');

// Multer for regulation PDF uploads
const uploadsDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename:    (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `reg-${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB for PDFs
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === 'application/pdf') cb(null, true);
    else cb(new Error('Only PDF files are allowed for regulations'));
  },
});

// ─── POST /admin/seed-admin ───────────────────────────────────────────────────
router.post('/seed-admin', async (req, res) => {
  try {
    const secret = process.env.SEED_SECRET;
    if (!secret) return res.status(503).json({ success: false, message: 'Seed not configured on this server' });
    const provided = req.headers['x-seed-secret'];
    if (!provided || provided !== secret) return res.status(401).json({ success: false, message: 'Invalid seed secret' });
    const existing = await User.findOne({ role: 'Admin' });
    if (existing) return res.json({ success: true, message: 'Admin account already exists', email: existing.email });
    const admin = new User({
      name:     process.env.ADMIN_NAME     || 'Admin Authority',
      email:    (process.env.ADMIN_EMAIL   || 'admin@gmail.com').toLowerCase(),
      password: process.env.ADMIN_PASSWORD || 'Admin@123',
      role: 'Admin'
    });
    await admin.save();
    return res.status(201).json({ success: true, message: 'Admin account created successfully', email: admin.email });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
});

// All routes below require authentication AND admin role
router.use(authMiddleware, adminOnly);

// Dashboard
router.get('/dashboard', getDashboardStats);

// Application Review
router.get('/applications',          getApplicationsForReview);
router.get('/applications/:id',      getApplicationForReview);
router.put('/applications/:id/review', reviewApplication);

// Approvals
router.get('/approvals',      listApprovals);
router.post('/approvals',     createApproval);
router.put('/approvals/:id',  updateApproval);

// Regulatory Rules
router.get('/rules',       listRules);
router.post('/rules',      createRule);
router.put('/rules/:id',   updateRule);

// Compliance Rules
router.get('/compliance-rules',   listComplianceRules);
router.post('/compliance-rules',  createComplianceRule);

// Schemes
router.get('/schemes',        listSchemes);
router.post('/schemes',       createScheme);
router.put('/schemes/:id',    updateScheme);
router.delete('/schemes/:id', deleteScheme);

// Regulations (RAG upload)
router.get('/regulations',          listRegulations);
router.post('/regulations',         upload.single('file'), uploadRegulation);
router.delete('/regulations/:id',   deleteRegulation);

// Knowledge Base
router.get('/knowledge-base', listKnowledgeBase);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

module.exports = router;
