const Approval = require('../models/Approval');
const RegulatoryRule = require('../models/RegulatoryRule');
const ComplianceRule = require('../models/ComplianceRule');
const Scheme = require('../models/Scheme');
const AuditLog = require('../models/AuditLog');
const Application = require('../models/Application');
const User = require('../models/User');

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

    return res.json({
      success: true,
      data: {
        totalUsers,
        totalApplications,
        activeRules,
        totalSchemes,
        applicationsByStatus
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

module.exports = {
  createApproval, updateApproval, listApprovals,
  createRule, updateRule, listRules,
  createComplianceRule, listComplianceRules,
  createScheme, listSchemes,
  getDashboardStats,
  getAuditLogs
};
