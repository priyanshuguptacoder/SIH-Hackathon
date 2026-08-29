const Approval = require('../models/Approval');
const RegulatoryRule = require('../models/RegulatoryRule');
const ComplianceRule = require('../models/ComplianceRule');
const Scheme = require('../models/Scheme');
const AuditLog = require('../models/AuditLog');
const Application = require('../models/Application');
const User = require('../models/User');
const Industry = require('../models/Industry');
const Document = require('../models/Document');

// ─── Approvals ────────────────────────────────────────────────────────────────

const createApproval = async (req, res) => {
  try {
    const approval = await Approval.create(req.body);
    AuditLog.record({ userId: req.user.id, action: 'APPROVAL_CREATED', targetModel: 'Approval', targetId: approval._id, newValue: req.body });
    return res.status(201).json({ success: true, data: approval });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const updateApproval = async (req, res) => {
  try {
    const approval = await Approval.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!approval) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Approval not found' } });
    AuditLog.record({ userId: req.user.id, action: 'APPROVAL_UPDATED', targetModel: 'Approval', targetId: approval._id });
    return res.json({ success: true, data: approval });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const listApprovals = async (req, res) => {
  try {
    const approvals = await Approval.find({});
    return res.json({ success: true, data: approvals });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// ─── Regulatory Rules ─────────────────────────────────────────────────────────

const createRule = async (req, res) => {
  try {
    const rule = await RegulatoryRule.create(req.body);
    AuditLog.record({ userId: req.user.id, action: 'RULE_CREATED', targetModel: 'RegulatoryRule', targetId: rule._id, newValue: req.body });
    return res.status(201).json({ success: true, data: rule });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const updateRule = async (req, res) => {
  try {
    const rule = await RegulatoryRule.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!rule) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Rule not found' } });
    AuditLog.record({ userId: req.user.id, action: 'RULE_UPDATED', targetModel: 'RegulatoryRule', targetId: rule._id });
    return res.json({ success: true, data: rule });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const listRules = async (req, res) => {
  try {
    const rules = await RegulatoryRule.find({}).populate('approvalId');
    return res.json({ success: true, data: rules });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// ─── Compliance Rules ─────────────────────────────────────────────────────────

const createComplianceRule = async (req, res) => {
  try {
    const rule = await ComplianceRule.create(req.body);
    return res.status(201).json({ success: true, data: rule });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const listComplianceRules = async (req, res) => {
  try {
    const rules = await ComplianceRule.find({}).populate('approvalId');
    return res.json({ success: true, data: rules });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// ─── Schemes ──────────────────────────────────────────────────────────────────

const createScheme = async (req, res) => {
  try {
    const scheme = await Scheme.create(req.body);
    return res.status(201).json({ success: true, data: scheme });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const listSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find({});
    return res.json({ success: true, data: schemes });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// ─── Dashboard Stats ──────────────────────────────────────────────────────────

const getDashboardStats = async (req, res) => {
  try {
    const [totalUsers, totalApplications, activeRules, totalSchemes] = await Promise.all([
      User.countDocuments({}),
      Application.countDocuments({}),
      RegulatoryRule.countDocuments({ isActive: true }),
      Scheme.countDocuments({})
    ]);

    const applicationsByStatus = await Application.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Add application review counts for Admin (acting as Authority)
    const [pendingApproval, underReview, approved, rejected] = await Promise.all([
      Application.countDocuments({ status: 'SUBMITTED' }),
      Application.countDocuments({ status: 'UNDER_REVIEW' }),
      Application.countDocuments({ status: 'APPROVED' }),
      Application.countDocuments({ status: 'REJECTED' })
    ]);

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalApplications,
        activeRules,
        totalSchemes,
        applicationsByStatus,
        reviewStats: {
          pendingApproval,
          underReview,
          approved,
          rejected
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// ─── Audit Logs ───────────────────────────────────────────────────────────────

const getAuditLogs = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const logs = await AuditLog.find({}).sort({ createdAt: -1 }).limit(limit).populate('userId', 'name email');
    return res.json({ success: true, data: logs });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// ─── Application Review (Admin acting as Authority) ──────────────────────────

const getApplicationsForReview = async (req, res) => {
  try {
    const { status } = req.query;

    const filter = {};
    if (status) {
      filter.status = status;
    } else {
      // Default: Show applications that need Admin/Authority attention
      filter.status = { $in: ['SUBMITTED', 'UNDER_REVIEW', 'INSPECTION'] };
    }

    const applications = await Application.find(filter)
      .populate('industryId')
      .populate('approvalId')
      .sort({ submissionDate: -1 });

    return res.json({ success: true, data: applications });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const getApplicationForReview = async (req, res) => {
  try {
    const { id } = req.params;

    const application = await Application.findById(id)
      .populate('industryId')
      .populate('approvalId');

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        error: { code: 'NOT_FOUND', message: 'Application not found' } 
      });
    }

    // Get documents for this application (by industryId + approvalId)
    const docQuery = { industryId: application.industryId._id };
    if (application.approvalId) {
      docQuery.approvalId = application.approvalId._id;
    }
    const documents = await Document.find(docQuery);

    return res.json({ 
      success: true, 
      data: { 
        application: application.toObject(),
        documents 
      } 
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const reviewApplication = async (req, res) => {
  try {
    const { id } = req.params;
    const { action, remarks } = req.body;

    // Valid actions: 'approve', 'reject', 'query', 'inspection'
    if (!action || !['approve', 'reject', 'query', 'inspection'].includes(action)) {
      return res.status(400).json({ 
        success: false, 
        error: { code: 'VALIDATION_ERROR', message: 'Valid action required: approve, reject, query, or inspection' } 
      });
    }

    const application = await Application.findById(id)
      .populate('industryId')
      .populate('approvalId');

    if (!application) {
      return res.status(404).json({ 
        success: false, 
        error: { code: 'NOT_FOUND', message: 'Application not found' } 
      });
    }

    const now = new Date();
    let newStatus;
    let actionText;

    switch (action) {
      case 'approve':
        newStatus = 'APPROVED';
        actionText = 'Application approved by Authority';
        application.approvalDate = now;
        break;

      case 'reject':
        newStatus = 'REJECTED';
        actionText = 'Application rejected by Authority';
        application.rejectionDate = now;
        break;

      case 'query':
        newStatus = 'UNDER_REVIEW';
        actionText = 'Query raised by Authority - additional information requested';
        break;

      case 'inspection':
        newStatus = 'INSPECTION';
        actionText = 'Inspection scheduled by Authority';
        application.inspectionDate = now;
        break;
    }

    const previousStatus = application.status;
    application.status = newStatus;
    application.remarks = remarks || actionText;

    // Record status history
    application.statusHistory.push({ 
      status: newStatus, 
      changedAt: now, 
      remarks: remarks || actionText 
    });

    await application.save();

    // Audit log
    AuditLog.record({
      userId: req.user.id,
      action: `ADMIN_${action.toUpperCase()}`,
      targetModel: 'Application',
      targetId: application._id,
      previousValue: { status: previousStatus },
      newValue: { status: newStatus, remarks: application.remarks }
    });

    return res.json({ 
      success: true, 
      data: application,
      message: actionText
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

module.exports = {
  createApproval, updateApproval, listApprovals,
  createRule, updateRule, listRules,
  createComplianceRule, listComplianceRules,
  createScheme, listSchemes,
  getDashboardStats,
  getAuditLogs,
  getApplicationsForReview,
  getApplicationForReview,
  reviewApplication
};
