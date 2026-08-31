const fs       = require('fs');
const path     = require('path');
const Document = require('../models/Document');
const Industry = require('../models/Industry');

// ─── helpers ──────────────────────────────────────────────────────────────────

// Derive auto-tags from documentType and mimeType
function autoTags(documentType, mimeType) {
  const tags = [];
  if (mimeType === 'application/pdf')  tags.push('PDF');
  if (mimeType === 'image/jpeg')       tags.push('Image');
  const dt = documentType.toLowerCase();
  if (dt.includes('noc'))             tags.push('NOC');
  if (dt.includes('license') || dt.includes('licence')) tags.push('License');
  if (dt.includes('certificate'))     tags.push('Certificate');
  if (dt.includes('report'))          tags.push('Report');
  if (dt.includes('plan'))            tags.push('Plan');
  if (dt.includes('audit'))           tags.push('Audit');
  return tags;
}

// Simulate async extraction (mock — replace with real OCR/Gemini call)
async function runExtraction(docId) {
  try {
    await Document.findByIdAndUpdate(docId, { extractionStatus: 'PROCESSING' });

    // Simulate processing delay, then write mock extracted data
    await new Promise((r) => setTimeout(r, 2000));

    await Document.findByIdAndUpdate(docId, {
      extractionStatus: 'DONE',
      'extractedData.companyName':   'Extracted Company Name (Mock)',
      'extractedData.licenseNumber': 'LIC-MOCK-' + Date.now(),
      'extractedData.issuedBy':      'Government Authority (Mock)',
      'extractedData.raw':           'Mock extraction complete. Replace with real OCR.',
    });
  } catch (err) {
    console.error('Extraction error for doc', docId, err.message);
    await Document.findByIdAndUpdate(docId, { extractionStatus: 'FAILED' });
  }
}

// ─── controllers ──────────────────────────────────────────────────────────────

// @route   POST /documents/upload
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

    const tags = autoTags(documentType, req.file.mimetype);

    const doc = new Document({
      industryId,
      approvalId:       approvalId || null,
      documentType,
      fileUrl:          `/uploads/${req.file.filename}`,
      originalName:     req.file.originalname,
      fileSize:         req.file.size,
      mimeType:         req.file.mimetype,
      tags,
      extractionStatus: 'PENDING',
    });

    await doc.save();

    // Kick off async extraction (fire-and-forget)
    runExtraction(doc._id);

    return res.status(201).json({ success: true, data: doc });
  } catch (error) {
    console.error('Upload Error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error uploading document' } });
  }
};

// @route   GET /documents
// @access  Protected
const getDocuments = async (req, res) => {
  try {
    const industry = await Industry.findOne({ userId: req.user.id });
    if (!industry && req.user.role !== 'Admin') {
      return res.json({ success: true, data: [] });
    }

    let query = req.user.role === 'Admin' ? {} : { industryId: industry._id };
    if (req.query.approvalId) query.approvalId = req.query.approvalId;

    const documents = await Document.find(query).sort({ createdAt: -1 }).populate('approvalId', 'approvalName');
    return res.json({ success: true, data: documents });
  } catch (error) {
    console.error('Get Documents Error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error fetching documents' } });
  }
};

// @route   DELETE /documents/:id
// @access  Protected
const deleteDocument = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    const industry = await Industry.findById(doc.industryId);
    if (!industry || (industry.userId.toString() !== req.user.id && req.user.role !== 'Admin')) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    // Delete physical file
    const filePath = path.join(__dirname, '../../', doc.fileUrl);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await Document.findByIdAndDelete(req.params.id);
    return res.json({ success: true, data: { message: 'Document deleted' } });
  } catch (error) {
    console.error('Delete Document Error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error deleting document' } });
  }
};

// @route   POST /documents/:id/extract
// @desc    Trigger (re)extraction for a document
// @access  Protected
const triggerExtraction = async (req, res) => {
  try {
    const doc = await Document.findById(req.params.id);
    if (!doc) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Document not found' } });
    }

    const industry = await Industry.findById(doc.industryId);
    if (!industry || (industry.userId.toString() !== req.user.id && req.user.role !== 'Admin')) {
      return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Not authorized' } });
    }

    // Reset status and re-run
    await Document.findByIdAndUpdate(doc._id, { extractionStatus: 'PENDING' });
    runExtraction(doc._id);

    return res.json({ success: true, data: { message: 'Extraction triggered' } });
  } catch (error) {
    console.error('Trigger Extraction Error:', error);
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: 'Server error triggering extraction' } });
  }
};

module.exports = { uploadDocument, getDocuments, deleteDocument, triggerExtraction };
