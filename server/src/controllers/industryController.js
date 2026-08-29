const Industry = require('../models/Industry');

// @route   POST /industries
// @desc    Create Industry Profile
// @access  Protected
const createIndustryProfile = async (req, res) => {
  try {
    const existing = await Industry.findOne({ userId: req.user.id });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Industry profile already exists for this user' });
    }

    const industryData = { ...req.body, userId: req.user.id };
    const industry = new Industry(industryData);
    await industry.save();

    return res.status(201).json({
      success: true,
      data: {
        industryId: industry._id,
      },
    });
  } catch (error) {
    console.error('Create Industry Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: 'Server error creating industry profile' });
  }
};

// @route   GET /industries/me
// @desc    Get Current User's Industry Profile
// @access  Protected
const getMyIndustryProfile = async (req, res) => {
  try {
    const industry = await Industry.findOne({ userId: req.user.id });
    if (!industry) {
      return res.status(404).json({ success: false, error: 'Industry profile not found' });
    }
    return res.status(200).json({
      success: true,
      data: industry,
    });
  } catch (error) {
    console.error('Get Industry Error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching industry profile' });
  }
};

// @route   PUT /industries/:id
// @desc    Update Industry Profile
// @access  Protected
const updateIndustryProfile = async (req, res) => {
  try {
    let industry = await Industry.findById(req.params.id);
    
    if (!industry) {
      return res.status(404).json({ success: false, error: 'Industry profile not found' });
    }

    // Ownership check
    if (industry.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: 'Not authorized to update this profile' });
    }

    industry = await Industry.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true, runValidators: true }
    );

    return res.status(200).json({
      success: true,
      data: industry,
    });
  } catch (error) {
    console.error('Update Industry Error:', error);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ success: false, error: error.message });
    }
    return res.status(500).json({ success: false, error: 'Server error updating industry profile' });
  }
};

module.exports = {
  createIndustryProfile,
  getMyIndustryProfile,
  updateIndustryProfile,
};
