const Document = require('../models/Document');
const Industry = require('../models/Industry');

// @route   POST /documents/upload
// @desc    Upload a document
// @access  Protected
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    const { industryId, approvalId, documentType } = req.body;
    
    if (!industryId || !documentType) {
      return res.status(400).json({ success: false, error: 'industryId and documentType are required' });
    }

    const industry = await Industry.findById(industryId);
    if (!industry || (industry.userId.toString() !== req.user.id && req.user.role !== 'Admin')) {
      return res.status(403).json({ success: false, error: 'Not authorized' });
    }

    // Save metadata
    const docData = new Document({
      industryId,
      approvalId: approvalId || null,
      documentType,
      fileUrl: `/uploads/${req.file.filename}`, // Mock file URL
      companyName: 'Extracted Company (Mock)',
    });

    await docData.save();

    return res.status(201).json({ success: true, data: docData });
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ success: false, error: 'Server error uploading document' });
  }
};

// @route   GET /documents
// @desc    Get documents
// @access  Protected
const getDocuments = async (req, res) => {
  try {
    // For MVP, fetch by user's industry
    const industry = await Industry.findOne({ userId: req.user.id });
    if (!industry && req.user.role !== 'Admin') {
      return res.status(404).json({ success: false, error: 'Industry profile not found' });
    }

    let query = req.user.role === 'Admin' ? {} : { industryId: industry._id };
    
    if (req.query.approvalId) {
      query.approvalId = req.query.approvalId;
    }

    const documents = await Document.find(query);
    return res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Get Documents Error:', error);
    return res.status(500).json({ success: false, error: 'Server error fetching documents' });
  }
};

module.exports = {
  uploadDocument,
  getDocuments
};
