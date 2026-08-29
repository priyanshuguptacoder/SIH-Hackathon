const mongoose = require('mongoose');

const complianceItemSchema = new mongoose.Schema(
  {
    industryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true, index: true },
    approvalId: { type: mongoose.Schema.Types.ObjectId, ref: 'Approval', required: true },
    requirementText: { type: String, required: true },
    recurrence: { 
      type: String, 
      enum: ['ONE_TIME', 'MONTHLY', 'QUARTERLY', 'ANNUAL', 'RENEWAL'], 
      required: true 
    },
    status: { 
      type: String, 
      enum: ['UPCOMING', 'DUE', 'OVERDUE', 'COMPLETED'], 
      default: 'UPCOMING' 
    },
    dueDate: { type: Date, required: true },
    source: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('ComplianceItem', complianceItemSchema);
