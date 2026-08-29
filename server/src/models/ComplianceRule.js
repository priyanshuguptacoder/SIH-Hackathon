const mongoose = require('mongoose');

const complianceRuleSchema = new mongoose.Schema(
  {
    approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval', required: true },
    requirementText: { type: String, required: true },
    recurrence: { 
      type: String, 
      enum: ['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'RENEWAL'], 
      required: true 
    },
    daysUntilDue: { type: Number, required: true },
    source: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ComplianceRule', complianceRuleSchema);
