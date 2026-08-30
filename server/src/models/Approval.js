const mongoose = require('mongoose');

// Expanded Approval model per REQUIREMENT.md
const approvalSchema = new mongoose.Schema(
  {
    approvalName:      { type: String, required: true },
    authority:         { type: String, required: true },
    description:       { type: String, default: '' },
    // Category for grouping on the roadmap UI
    category:          { type: String, default: 'General',
                         enum: ['Pre-establishment', 'Environmental', 'Labour & Safety', 'Fire & Emergency', 'General'] },
    // Approvals that must be obtained before this one
    dependencies:      [{ type: String }],   // stores approvalName strings for display
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
