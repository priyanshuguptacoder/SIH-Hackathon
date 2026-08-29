const mongoose = require('mongoose');

// Expanded Approval model per REQUIREMENT.md
const approvalSchema = new mongoose.Schema(
  {
    approvalName:      { type: String, required: true },
    authority:         { type: String, required: true },
    description:       { type: String, default: '' },
    // List of document names required to apply for this approval
    requiredDocuments: [{ type: String }],
    // Link to the official government portal for this approval
    officialUrl:       { type: String, default: '' },
    // Statutory SLA in days (used for expectedCompletionDate calculation)
    slaDays:           { type: Number, default: 30 },
    // Legal / regulatory basis for reference
    legalBasis:        { type: String, default: '' },
    isActive:          { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Approval', approvalSchema);
