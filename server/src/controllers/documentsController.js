const Document = require('../models/Document');
const Industry = require('../models/Industry');

// @route   POST /documents/upload
// @desc    Upload a document
// @access  Protected
const uploadDocument = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No file uploaded' } });
    }

    const { industryId, approvalId, documentType } = req.body;
    
    if (!industryId || !documentType) {
      return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'industryId and documentType are required' } });
    }

    const industry = await Industry.findById(industryId);
    if (!industry || (industry.userId.toString() !== req.user.id && req.user.role !== 'Admin')) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
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
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error uploading document' } });
  }
};

// @route   GET /documents
// @desc    Get documents
// @access  Protected
const getDocuments = async (req, res) => {
  try {
    const industry = await Industry.findOne({ userId: req.user.id });
    if (!industry && req.user.role !== 'Admin') {
      // No industry profile yet — return empty array
      return res.json({ success: true, data: [] });
    }

    let query = req.user.role === 'Admin' ? {} : { industryId: industry._id };

    if (req.query.approvalId) {
      query.approvalId = req.query.approvalId;
    }

    const documents = await Document.find(query);
    return res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Get Documents Error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error fetching documents' } });
  }
};

module.exports = {
  uploadDocument,
  getDocuments
};
