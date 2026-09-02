const Approval = require('../models/Approval');
const RegulatoryRule = require('../models/RegulatoryRule');
const ComplianceRule = require('../models/ComplianceRule');
const ComplianceItem = require('../models/ComplianceItem');
const Scheme = require('../models/Scheme');
const AuditLog = require('../models/AuditLog');
const Application = require('../models/Application');
const User = require('../models/User');
const Industry = require('../models/Industry');
const Document = require('../models/Document');
const { createNotification } = require('./notificationsController');
const fs = require('fs');
const path = require('path');

// Lazy-load RegulationChunk so the server starts even if the model doesn't exist yet
let RegulationChunk;
try { RegulationChunk = require('../models/RegulationChunk'); } catch { RegulationChunk = null; }

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

const updateScheme = async (req, res) => {
  try {
    const scheme = await Scheme.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true, runValidators: true });
    if (!scheme) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Scheme not found' } });
    return res.json({ success: true, data: scheme });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const deleteScheme = async (req, res) => {
  try {
    await Scheme.findByIdAndDelete(req.params.id);
    return res.json({ success: true, data: { message: 'Scheme deleted' } });
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

// ─── Regulations (RAG upload) ─────────────────────────────────────────────────

const uploadRegulation = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No file uploaded' } });
    }
    const { title, authority, effectiveDate, version, state, sector } = req.body;
    if (!title || !authority) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'title and authority are required' } });
    }

    const fileUrl = `/uploads/${req.file.filename}`;

    // Store metadata as a Document record (documentType = 'REGULATION')
    const doc = await Document.create({
      industryId: null,     // admin-level doc — no industry
      approvalId: null,
      documentType: 'REGULATION',
      fileUrl,
      originalName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      tags: ['Regulation', authority, state, sector].filter(Boolean),
      extractionStatus: 'PENDING',
    });

    // In a full implementation you would trigger async PDF chunking + embedding here.
    // For the prototype we record metadata and mark as PROCESSING.
    await Document.findByIdAndUpdate(doc._id, { extractionStatus: 'PROCESSING' });

    AuditLog.record({
      userId: req.user.id,
      action: 'REGULATION_UPLOADED',
      targetModel: 'Document',
      targetId: doc._id,
      newValue: { title, authority, version }
    });

    // Simulate async ingestion (fires & forgets)
    setTimeout(async () => {
      try {
        await Document.findByIdAndUpdate(doc._id, {
          extractionStatus: 'DONE',
          'extractedData.raw': `Regulation "${title}" ingested. Chunking & embedding pending RAG pipeline.`,
        });
      } catch { /* ignore */ }
    }, 3000);

    return res.status(201).json({
      success: true,
      data: {
        id: doc._id,
        title, authority, effectiveDate, version, state, sector,
        fileUrl,
        status: 'PROCESSING',
        message: 'Regulation uploaded. Chunking & ingestion started.'
      }
    });
  } catch (err) {
    console.error('Upload Regulation Error:', err);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const listRegulations = async (req, res) => {
  try {
    const docs = await Document.find({ documentType: 'REGULATION' }).sort({ createdAt: -1 });
    return res.json({ success: true, data: docs });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

const deleteRegulation = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Regulation not found' } });
    const filePath = path.join(__dirname, '../../', doc.fileUrl);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    await Document.findByIdAndDelete(req.params.id);
    return res.json({ success: true, data: { message: 'Regulation deleted' } });
  } catch (err) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: err.message } });
  }
};

// ─── Knowledge Base (RegulationChunk) ────────────────────────────────────────

const listKnowledgeBase = async (req, res) => {
  try {
    if (!RegulationChunk) return res.json({ success: true, data: [] });
    const chunks = await RegulationChunk.find({}).select('-embedding').sort({ createdAt: -1 }).limit(200);
    return res.json({ success: true, data: chunks });
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
    if (status && status !== 'ALL') {
      filter.status = status;
    } else if (!status) {
      // Default: Show applications that need Admin/Authority attention
      filter.status = { $in: ['SUBMITTED', 'UNDER_REVIEW', 'INSPECTION'] };
    }
    // if status === 'ALL', filter stays empty → return everything

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

    // Auto-generate compliance items when approving
    if (action === 'approve' && application.approvalId) {
      const approvalId = application.approvalId._id || application.approvalId;
      const complianceRules = await ComplianceRule.find({ approvalId });
      if (complianceRules.length > 0) {
        const items = complianceRules.map(rule => {
          const dueDate = new Date(now);
          dueDate.setDate(now.getDate() + rule.daysUntilDue);
          return {
            industryId:      application.industryId._id || application.industryId,
            approvalId:      approvalId,
            requirementText: rule.requirementText,
            recurrence:      rule.recurrence,
            status:          'UPCOMING',
            dueDate,
            source:          rule.source || ''
          };
        });
        const created = await ComplianceItem.insertMany(items);

        // Notify for each compliance obligation created
        const industryOwnerId = application.industryId?.userId;
        if (industryOwnerId) {
          for (const item of created) {
            const daysUntil = Math.ceil((new Date(item.dueDate) - now) / (1000 * 60 * 60 * 24));
            createNotification({
              userId: industryOwnerId,
              type: 'DEADLINE',
              title: 'New Compliance Obligation',
              message: `"${item.requirementText}" is due in ${daysUntil} days. Recurrence: ${item.recurrence}.`,
              relatedModel: 'ComplianceItem',
              relatedId: item._id
            });
          }
        }
      }
    }

    // Notify the industry user about the decision
    const industryUserId = application.industryId?.userId;
    if (industryUserId) {
      const approvalName = application.approvalId?.approvalName || 'your application';

      if (action === 'approve') {
        createNotification({
          userId: industryUserId,
          type: 'GENERAL',
          title: '🎉 Application Approved',
          message: `Your application for "${approvalName}" has been approved by the authority. Compliance obligations have been generated.`,
          relatedModel: 'Application',
          relatedId: application._id
        });
      } else if (action === 'reject') {
        createNotification({
          userId: industryUserId,
          type: 'GENERAL',
          title: 'Application Rejected',
          message: `Your application for "${approvalName}" was rejected. Remarks: ${application.remarks}`,
          relatedModel: 'Application',
          relatedId: application._id
        });
      } else if (action === 'inspection') {
        createNotification({
          userId: industryUserId,
          type: 'GENERAL',
          title: 'Inspection Scheduled',
          message: `An inspection has been scheduled for your "${approvalName}" application. Please prepare your facility.`,
          relatedModel: 'Application',
          relatedId: application._id
        });
      } else if (action === 'query') {
        createNotification({
          userId: industryUserId,
          type: 'GENERAL',
          title: 'Query Raised on Application',
          message: `The authority has raised a query on your "${approvalName}" application: ${application.remarks}`,
          relatedModel: 'Application',
          relatedId: application._id
        });
      }
    }

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
  createScheme, updateScheme, deleteScheme, listSchemes,
  uploadRegulation, listRegulations, deleteRegulation,
  listKnowledgeBase,
  getDashboardStats,
  getAuditLogs,
  getApplicationsForReview,
  getApplicationForReview,
  reviewApplication
};
