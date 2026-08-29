const mongoose = require('mongoose');

const schemeSchema = new mongoose.Schema(
  {
    schemeName: { type: String, required: true },
    description: { type: String, required: true },
    state: { type: String, required: true },
    sector: { type: String, required: true },
    eligibilityCriteria: { type: mongoose.Schema.Types.Mixed, required: true }, // Same structure as RegulatoryRule condition
    benefits: { type: String, required: true },
    officialUrl: { type: String }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Scheme', schemeSchema);
