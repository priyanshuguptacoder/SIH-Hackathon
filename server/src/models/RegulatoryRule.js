const mongoose = require('mongoose');

const regulatoryRuleSchema = new mongoose.Schema(
  {
    ruleId:              { type: String, required: true, unique: true },
    approvalId:          { type: mongoose.Schema.Types.ObjectId, ref: 'Approval', required: true },
    condition:           { type: mongoose.Schema.Types.Mixed, required: true },
    explanationTemplate: { type: String, required: true },
    priority:            { type: Number, required: true },
    effectiveDate:       { type: Date, required: true },
    version:             { type: String, required: true },
    isActive:            { type: Boolean, default: true },
    source:              { type: String, default: '' }   // Legal basis reference
  },
  { timestamps: true }
);

module.exports = mongoose.model('RegulatoryRule', regulatoryRuleSchema);

