const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema(
  {
    userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    action:       { type: String, required: true },     // e.g. 'STATUS_CHANGED', 'RULE_CREATED'
    targetModel:  { type: String, required: true },     // e.g. 'Application', 'RegulatoryRule'
    targetId:     { type: mongoose.Schema.Types.ObjectId },
    previousValue:{ type: mongoose.Schema.Types.Mixed },
    newValue:     { type: mongoose.Schema.Types.Mixed },
    ip:           { type: String }
  },
  { timestamps: true }
);

// Helper to write an audit log entry without blocking request flow
auditLogSchema.statics.record = async function(data) {
  try {
    await this.create(data);
  } catch (e) {
    console.error('AuditLog write error:', e.message);
  }
};

module.exports = mongoose.model('AuditLog', auditLogSchema);
