const Inspection = require('../models/Inspection');
const Application = require('../models/Application');
const Industry = require('../models/Industry');

// @route   POST /inspections
// @desc    Schedule an inspection for an application
// @access  Protected
const createInspection = async (req, res) => {
  try {
    const { applicationId, department, scheduledDate } = req.body;
    if (!applicationId || !department || !scheduledDate) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'applicationId, department, and scheduledDate are required' } });
    }

    const application = await Application.findById(applicationId).populate('industryId');
    if (!application) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Application not found' } });
    }

    if (application.industryId.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    if (application.status !== 'INSPECTION') {
      return res.status(400).json({ success: false, error: { code: 'INVALID_STATE', message: 'Application must be in INSPECTION state to schedule an inspection' } });
    }

    const inspectionDateObj = new Date(scheduledDate);

    const inspection = await Inspection.create({
      applicationId,
      industryId: application.industryId._id,
      department,
      scheduledDate: inspectionDateObj,
      status: 'SCHEDULED'
    });

    // Synchronize the application's inspectionDate
    application.inspectionDate = inspectionDateObj;
    await application.save();

    return res.status(201).json({ success: true, data: inspection });
  } catch (err) {
    console.error('Create Inspection Error:', err);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error creating inspection' } });
  }
};

// @route   GET /inspections
// @desc    Get all inspections for the current user's industry
// @access  Protected
const getInspections = async (req, res) => {
  try {
    const industry = await Industry.findOne({ userId: req.user.id });
    if (!industry) {
      return res.json({ success: true, data: [] });
    }

    const inspections = await Inspection.find({ industryId: industry._id })
      .populate({ path: 'applicationId', populate: { path: 'approvalId', select: 'approvalName authority slaDays' } })
      .sort({ scheduledDate: 1 });
    return res.json({ success: true, data: inspections });
  } catch (err) {
    console.error('Get Inspections Error:', err);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error fetching inspections' } });
  }
};

// @route   PUT /inspections/:id
// @desc    Update inspection status / remarks
// @access  Protected
const updateInspection = async (req, res) => {
  try {
    const { status, remarks } = req.body;
    const inspection = await Inspection.findById(req.params.id).populate('industryId');
    if (!inspection) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Inspection not found' } });
    }

    const industry = await Industry.findById(inspection.industryId._id);
    if (industry.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    if (status) {
      const validTransitions = {
        'SCHEDULED': ['COMPLETED', 'CANCELLED'],
        'COMPLETED': [],
        'CANCELLED': []
      };
      
      const allowedNext = validTransitions[inspection.status];
      if (!allowedNext || !allowedNext.includes(status)) {
        return res.status(400).json({ success: false, error: { code: 'INVALID_TRANSITION', message: `Cannot transition inspection from ${inspection.status} to ${status}` } });
      }
      inspection.status = status;
    }
    if (remarks) inspection.remarks = remarks;
    await inspection.save();

    return res.json({ success: true, data: inspection });
  } catch (err) {
    console.error('Update Inspection Error:', err);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error updating inspection' } });
  }
};

module.exports = { createInspection, getInspections, updateInspection };
