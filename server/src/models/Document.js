const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    industryId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true, index: true },
    approvalId:  { type: mongoose.Schema.Types.ObjectId, ref: 'Approval', required: false },

    // File metadata
    fileUrl:      { type: String, required: true },
    originalName: { type: String, default: '' },
    fileSize:     { type: Number, default: 0 },       // bytes
    mimeType:     { type: String, default: '' },

    // Classification
    documentType: { type: String, required: true },
    tags:         [{ type: String }],

    // Extraction
    extractionStatus: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'DONE', 'FAILED'],
      default: 'PENDING'
    },
    extractedData: {
      companyName:   { type: String, default: '' },
      licenseNumber: { type: String, default: '' },
      expiryDate:    { type: Date },
      issuedBy:      { type: String, default: '' },
      raw:           { type: String, default: '' },
    },

    // Legacy flat fields kept for backward compat
    companyName:   { type: String },
    licenseNumber: { type: String },
    expiryDate:    { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
