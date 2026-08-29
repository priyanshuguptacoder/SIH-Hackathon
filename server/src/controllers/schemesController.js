const Scheme = require('../models/Scheme');
const Industry = require('../models/Industry');
const { evaluateRule } = require('../utils/rulesEngine');

// @route   GET /schemes/matched/:industryId
// @desc    Get matched government schemes
// @access  Protected
const getMatchedSchemes = async (req, res) => {
  try {
    const { industryId } = req.params;
    
    const industry = await Industry.findById(industryId);
    if (!industry) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Industry profile not found' } });
    }

    if (industry.userId.toString() !== req.user.id && req.user.role !== 'Admin') {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    const schemes = await Scheme.find({});
    
    const matchedSchemes = schemes.filter(scheme => {
      // Evaluate based on same deterministic engine
      return evaluateRule(scheme.eligibilityCriteria, industry.toObject());
    });

    return res.json({
      success: true,
      data: matchedSchemes.map(s => ({
        id: s._id,
        schemeName: s.schemeName,
        description: s.description,
        benefits: s.benefits,
        officialUrl: s.officialUrl,
        disclaimer: "Potentially eligible based on available criteria."
      })),
    });
  } catch (error) {
    console.error('Get Schemes Error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error fetching schemes' } });
  }
};

module.exports = {
  getMatchedSchemes
};
