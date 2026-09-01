const ComplianceItem = require('../models/ComplianceItem');
const Industry = require('../models/Industry');

// Valid compliance status transitions
const COMPLIANCE_TRANSITIONS = {
  'UPCOMING':  ['DUE', 'COMPLETED'],
  'DUE':       ['OVERDUE', 'COMPLETED'],
  'OVERDUE':   ['COMPLETED'],
  'COMPLETED': []  // terminal — recurrence generates a NEW item
};

// Compute next due date for recurring items
const computeNextDueDate = (currentDue, recurrence) => {
  const next = new Date(currentDue);
  switch (recurrence) {
    case 'MONTHLY':   next.setMonth(next.getMonth() + 1); break;
    case 'QUARTERLY': next.setMonth(next.getMonth() + 3); break;
    case 'ANNUAL':    next.setFullYear(next.getFullYear() + 1); break;
    case 'RENEWAL':   next.setFullYear(next.getFullYear() + 1); break;
    default: return null; // ONE_TIME — no next item
  }
  return next;
};

// Helper: get owning industry for an item, with ownership check
const getOwnerIndustry = async (item, userId, role) => {
  const industry = await Industry.findById(item.industryId);
  if (!industry) return null;
  if (industry.userId.toString() !== userId && role !== 'Admin') return null;
  return industry;
};

// @route   GET /compliance
// @desc    Get all compliance items for the user's industry
// @access  Protected
const getComplianceItems = async (req, res) => {
  try {
    const industry = await Industry.findOne({ userId: req.user.id });
    if (!industry && req.user.role !== 'Admin') {
      // User doesn't have an industry profile yet - return empty array instead of 404
      return res.json({ success: true, data: [] });
    }

    const query = req.user.role === 'Admin' ? {} : { industryId: industry._id };

    // Optional filter by status
    if (req.query.status) query.status = req.query.status;

    const items = await ComplianceItem.find(query)
      .populate('approvalId')
      .sort({ dueDate: 1 });

    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Get Compliance Error:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Server error fetching compliance items' }
    });
  }
};

// @route   GET /compliance/:id
// @desc    Get a specific compliance item
// @access  Protected
const getComplianceItem = async (req, res) => {
  try {
    const item = await ComplianceItem.findById(req.params.id).populate('approvalId');
    if (!item) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Compliance item not found' }
      });
    }

    const industry = await getOwnerIndustry(item, req.user.id, req.user.role);
    if (!industry) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' }
      });
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    console.error('Get Compliance Item Error:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Server error fetching compliance item' }
    });
  }
};

// @route   PUT /compliance/:id
// @desc    Update compliance status with validated transitions + optional proof/notes
// @access  Protected
const updateComplianceItem = async (req, res) => {
  try {
    const { status, notes, proofUrl } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'status is required' }
      });
    }

    const item = await ComplianceItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({
        success: false,
        error: { code: 'NOT_FOUND', message: 'Compliance item not found' }
      });
    }

    const industry = await getOwnerIndustry(item, req.user.id, req.user.role);
    if (!industry) {
      return res.status(403).json({
        success: false,
        error: { code: 'FORBIDDEN', message: 'Not authorized' }
      });
    }

    // Enforce valid transitions
    const allowed = COMPLIANCE_TRANSITIONS[item.status];
    if (!allowed || !allowed.includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_TRANSITION',
          message: `Cannot transition compliance status from ${item.status} to ${status}`
        }
      });
    }

    item.status = status;
    if (notes    !== undefined) item.notes    = notes;
    if (proofUrl !== undefined) item.proofUrl = proofUrl;
    if (status === 'COMPLETED') item.completedAt = new Date();

    await item.save();

    // For recurring items completed: generate the next UPCOMING item
    if (status === 'COMPLETED' && item.recurrence !== 'ONE_TIME') {
      const nextDue = computeNextDueDate(item.dueDate, item.recurrence);
      if (nextDue) {
        await ComplianceItem.create({
          industryId:      item.industryId,
          approvalId:      item.approvalId,
          requirementText: item.requirementText,
          recurrence:      item.recurrence,
          status:          'UPCOMING',
          dueDate:         nextDue,
          source:          item.source
        });
      }
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    console.error('Update Compliance Item Error:', error.message);
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: 'Server error updating compliance item' }
    });
  }
};

module.exports = { getComplianceItems, getComplianceItem, updateComplianceItem };
