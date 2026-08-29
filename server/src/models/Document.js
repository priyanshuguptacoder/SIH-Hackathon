const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema(
  {
    industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true, index: true },
    approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval', required: false },
    fileUrl: { type: String, required: true },
    documentType: { type: String, required: true },
    companyName: { type: String },
    licenseNumber: { type: String },
    expiryDate: { type: Date }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Document', documentSchema);
