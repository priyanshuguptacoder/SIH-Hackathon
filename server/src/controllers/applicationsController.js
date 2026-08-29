const Application = require('../models/Application');
const ComplianceItem = require('../models/ComplianceItem');
const ComplianceRule = require('../models/ComplianceRule');
const Industry = require('../models/Industry');
const Approval = require('../models/Approval');
const AuditLog = require('../models/AuditLog');

// Valid state transitions (strict state machine)
const VALID_TRANSITIONS = {
  'NOT_STARTED':        ['DOCUMENTS_PREPARED'],
  'DOCUMENTS_PREPARED': ['SUBMITTED'],
  'SUBMITTED':          ['UNDER_REVIEW', 'APPROVED', 'REJECTED'],
  'UNDER_REVIEW':       ['INSPECTION', 'APPROVED', 'REJECTED'],
  'INSPECTION':         ['APPROVED', 'REJECTED'],
  'APPROVED':           [],
  'REJECTED':           ['DOCUMENTS_PREPARED']  // Can restart
};

// Helper: SLA status
const getSLAStatus = (submissionDate, expectedCompletionDate, status) => {
  if (!submissionDate || !expectedCompletionDate || status === 'APPROVED' || status === 'REJECTED') {
    return null;
  }
  const now = new Date();
  const msLeft = expectedCompletionDate - now;
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));

  if (daysLeft < 0)  return { status: 'BREACHED',    daysLeft };
  if (daysLeft <= 5) return { status: 'APPROACHING', daysLeft };
  return { status: 'NORMAL', daysLeft };
};

// @route   POST /applications
// @desc    Create a new application for an approval
// @access  Protected
const createApplication = async (req, res) => {
  try {
    const { industryId, approvalId } = req.body;

    if (!industryId || !approvalId) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'industryId and approvalId are required' } });
    }

    const industry = await Industry.findById(industryId);
    if (!industry) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Industry not found' } });
    }
    if (industry.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    const existing = await Application.findOne({ industryId, approvalId });
    if (existing) {
      return res.status(400).json({ success: false, error: { code: 'DUPLICATE', message: 'Application already exists for this approval' } });
    }

    const application = new Application({
      industryId,
      approvalId,
      status: 'NOT_STARTED',
      statusHistory: [{ status: 'NOT_STARTED', remarks: 'Application created' }]
    });

    await application.save();

    AuditLog.record({ userId: req.user.id, action: 'APPLICATION_CREATED', targetModel: 'Application', targetId: application._id, newValue: { status: 'NOT_STARTED' } });

    return res.status(201).json({ success: true, data: application });
  } catch (error) {
    console.error('Create Application Error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error creating application' } });
  }
};

// @route   PUT /applications/:id/status
// @desc    Update application status (strict state machine)
// @access  Protected
const updateApplicationStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'status is required' } });
    }

    const application = await Application.findById(id).populate('industryId').populate('approvalId');
    if (!application) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } });
    }

    if (application.industryId.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    const currentStatus = application.status;
    if (!VALID_TRANSITIONS[currentStatus] || !VALID_TRANSITIONS[currentStatus].includes(status)) {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_TRANSITION', message: `Cannot transition from ${currentStatus} to ${status}` }
      });
    }

    const now = new Date();
    const previousStatus = application.status;

    application.status = status;
    if (remarks) application.remarks = remarks;

    // Record status history entry
    application.statusHistory.push({ status, changedAt: now, remarks: remarks || '' });

    // Date bookkeeping
    if (status === 'SUBMITTED') {
      application.submissionDate = now;
      const slaDays = (application.approvalId && application.approvalId.slaDays) ? application.approvalId.slaDays : 30;
      const expectedDate = new Date(now);
      expectedDate.setDate(now.getDate() + slaDays);
      application.expectedCompletionDate = expectedDate;
    }

    if (status === 'INSPECTION') {
      application.inspectionDate = now;
    }

    if (status === 'APPROVED') {
      application.approvalDate = now;

      // Data-driven compliance generation from ComplianceRule
      const complianceRules = await ComplianceRule.find({ approvalId: application.approvalId._id });
      if (complianceRules.length > 0) {
        const items = complianceRules.map(rule => {
          const dueDate = new Date(now);
          dueDate.setDate(now.getDate() + rule.daysUntilDue);
          return {
            industryId: application.industryId._id,
            approvalId: application.approvalId._id,
            requirementText: rule.requirementText,
            recurrence: rule.recurrence,
            status: 'UPCOMING',
            dueDate,
            source: rule.source || ''
          };
        });
        await ComplianceItem.insertMany(items);
      }
    }

    if (status === 'REJECTED') {
      application.rejectionDate = now;
    }

    await application.save();

    AuditLog.record({
      userId: req.user.id,
      action: 'STATUS_CHANGED',
      targetModel: 'Application',
      targetId: application._id,
      previousValue: { status: previousStatus },
      newValue: { status }
    });

    // Attach computed SLA info to response
    const sla = getSLAStatus(application.submissionDate, application.expectedCompletionDate, application.status);

    return res.json({ success: true, data: { ...application.toObject(), sla } });
  } catch (error) {
    console.error('Update Application Status Error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error updating application' } });
  }
};

// @route   GET /applications
// @desc    Get all applications for the current user's industry
// @access  Protected
const getApplications = async (req, res) => {
  try {
    const industry = await Industry.findOne({ userId: req.user.id });
    if (!industry) {
      // User doesn't have an industry profile yet - return empty array instead of 404
      return res.json({ success: true, data: [] });
    }

    const applications = await Application.find({ industryId: industry._id }).populate('approvalId');

    const withSLA = applications.map(app => {
      const sla = getSLAStatus(app.submissionDate, app.expectedCompletionDate, app.status);
      return { ...app.toObject(), sla };
    });

    return res.json({ success: true, data: withSLA });
  } catch (error) {
    console.error('Get Applications Error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error fetching applications' } });
  }
};

// @route   GET /applications/:id
// @desc    Get a single application with SLA info
// @access  Protected
const getApplication = async (req, res) => {
  try {
    const application = await Application.findById(req.params.id).populate('approvalId').populate('industryId');
    if (!application) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } });
    }

    if (application.industryId.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    const sla = getSLAStatus(application.submissionDate, application.expectedCompletionDate, application.status);
    return res.json({ success: true, data: { ...application.toObject(), sla } });
  } catch (error) {
    console.error('Get Application Error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error fetching application' } });
  }
};

module.exports = {
  createApplication,
  updateApplicationStatus,
  getApplications,
  getApplication
};
