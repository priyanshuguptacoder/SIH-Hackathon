const ComplianceItem = require('../models/ComplianceItem');
const Industry = require('../models/Industry');

// @route   GET /compliance
// @desc    Get all compliance items for a user
// @access  Protected
const getComplianceItems = async (req, res) => {
  try {
    const industry = await Industry.findOne({ userId: req.user.id });
    if (!industry && req.user.role !== 'Admin') {
      return res.status(404).json({ success: false, error: 'Industry profile not found' });
    }

    const query = req.user.role === 'Admin' ? {} : { industryId: industry._id };
    const items = await ComplianceItem.find(query).populate('approvalId');
    
    return res.json({ success: true, data: items });
  } catch (error) {
    console.error('Get Compliance Error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching compliance items' });
  }
};

// @route   GET /compliance/:id
// @desc    Get specific compliance item
// @access  Protected
const getComplianceItem = async (req, res) => {
  try {
    const item = await ComplianceItem.findById(req.params.id).populate('approvalId');
    if (!item) {
      return res.status(404).json({ success: false, error: 'Compliance item not found' });
    }
    
    // Ownership check (simplified)
    const industry = await Industry.findById(item.industryId);
    if (industry.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    console.error('Get Compliance Item Error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching compliance item' });
  }
};

// @route   PUT /compliance/:id
// @desc    Update compliance status (e.g. Mark Completed)
// @access  Protected
const updateComplianceItem = async (req, res) => {
  try {
    const { status } = req.body;
    let item = await ComplianceItem.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, error: 'Compliance item not found' });
    }

    const industry = await Industry.findById(item.industryId);
    if (industry.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Only allow valid transitions (e.g., to COMPLETED)
    if (status) {
      item.status = status;
    }

    await item.save();

    // If marked completed and recurrence is not ONE_TIME, we could schedule the next one.
    // For MVP, just marking complete is fine, maybe generate next item on completion if needed.
    if (status === 'COMPLETED' && item.recurrence !== 'ONE_TIME') {
      // Mock generating next compliance
      let nextDue = new Date(item.dueDate);
      if (item.recurrence === 'MONTHLY') nextDue.setMonth(nextDue.getMonth() + 1);
      else if (item.recurrence === 'QUARTERLY') nextDue.setMonth(nextDue.getMonth() + 3);
      else if (item.recurrence === 'ANNUAL') nextDue.setFullYear(nextDue.getFullYear() + 1);

      const nextItem = new ComplianceItem({
        industryId: item.industryId,
        approvalId: item.approvalId,
        requirementText: item.requirementText,
        recurrence: item.recurrence,
        status: 'UPCOMING',
        dueDate: nextDue,
        source: item.source
      });
      await nextItem.save();
    }

    return res.json({ success: true, data: item });
  } catch (error) {
    console.error('Update Compliance Item Error:', error);
    return res.status(500).json({ success: false, error: 'Server error updating compliance item' });
  }
};

module.exports = {
  getComplianceItems,
  getComplianceItem,
  updateComplianceItem
};
