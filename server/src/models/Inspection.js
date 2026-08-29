const mongoose = require('mongoose');

const inspectionSchema = new mongoose.Schema(
  {
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    industryId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Industry', required: true, index: true },
    department:    { type: String, required: true },
    scheduledDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['SCHEDULED', 'COMPLETED', 'CANCELLED'],
      default: 'SCHEDULED'
    },
    remarks: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Inspection', inspectionSchema);
