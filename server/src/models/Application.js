const mongoose = require('mongoose');

const statusHistoryEntry = new mongoose.Schema({
  status:    { type: String, required: true },
  changedAt: { type: Date, default: Date.now },
  remarks:   { type: String }
}, { _id: false });

const applicationSchema = new mongoose.Schema(
  {
    industryId:             { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true, index: true },
    approvalId:             { type: mongoose.Schema.Types.ObjectId, ref: 'Approval', required: true },
    status: { 
      type: String, 
      enum: ['NOT_STARTED', 'DOCUMENTS_PREPARED', 'SUBMITTED', 'UNDER_REVIEW', 'INSPECTION', 'APPROVED', 'REJECTED'],
      default: 'NOT_STARTED'
    },
    statusHistory:          [statusHistoryEntry],
    submissionDate:         { type: Date },
    expectedCompletionDate: { type: Date },
    inspectionDate:         { type: Date },
    approvalDate:           { type: Date },
    rejectionDate:          { type: Date },
    remarks:                { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Application', applicationSchema);

