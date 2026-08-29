const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    userId:   { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    type: {
      type: String,
      enum: ['DEADLINE', 'RENEWAL', 'DOCUMENT_EXPIRY', 'SLA_WARNING', 'SLA_BREACH', 'GENERAL'],
      required: true
    },
    title:   { type: String, required: true },
    message: { type: String, required: true },
    isRead:  { type: Boolean, default: false },
    // Optional links back to the relevant resource
    relatedModel: { type: String, enum: ['Application', 'ComplianceItem', 'Document', 'Scheme', null] },
    relatedId:    { type: mongoose.Schema.Types.ObjectId }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Notification', notificationSchema);
