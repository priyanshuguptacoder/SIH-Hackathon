const mongoose = require('mongoose');

const industrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },

    // ── Business ──────────────────────────────────────────────────────────
    companyName:           { type: String, required: true },
    sector:                { type: String, required: true },

    // ── Location ─────────────────────────────────────────────────────────
    state:                 { type: String, required: true },
    district:              { type: String, required: true },
    projectLocation:       { type: String, required: true },
    pincode:               { type: String, required: true },

    // ── Scale ─────────────────────────────────────────────────────────────
    investment:            { type: Number, required: true },
    employees:             { type: Number, required: true },
    productionCapacity:    { type: Number, required: true },

    // ── Activity ──────────────────────────────────────────────────────────
    manufacturingActivity: { type: String, required: true },
    processes:             { type: String, required: true },

    // ── Environment: Water ────────────────────────────────────────────────
    waterUsage:            { type: Number, required: true },
    waterSource:           { type: String, default: '' },

    // ── Environment: Wastewater ───────────────────────────────────────────
    generatesWastewater:   { type: Boolean, required: true },
    wastewater:            { type: Number, default: 0 },
    treatmentFacility:     { type: String, default: 'none' },

    // ── Environment: Hazardous ────────────────────────────────────────────
    hazardousWaste:        { type: Boolean, required: true },
    wasteCategory:         { type: String, default: '' },
    wasteQty:              { type: Number, default: 0 },
    disposalMethod:        { type: String, default: '' },

    // ── Project Stage ─────────────────────────────────────────────────────
    projectStage: {
      type: String,
      enum: ['Pre-establishment', 'construction', 'pre-operation', 'operational', 'expansion'],
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Industry', industrySchema);
