const mongoose = require('mongoose');

const industrySchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    companyName: { type: String, required: true },
    sector: { type: String, required: true },
    state: { type: String, required: true },
    district: { type: String, required: true },
    projectLocation: { type: String, required: true },
    pincode: { type: String, required: true },
    investment: { type: Number, required: true },
    employees: { type: Number, required: true },
    productionCapacity: { type: Number, required: true },
    manufacturingActivity: { type: String, required: true },
    processes: { type: String, required: true },
    waterUsage: { type: Number, required: true },
    generatesWastewater: { type: Boolean, required: true },
    hazardousWaste: { type: Boolean, required: true },
    projectStage: { 
      type: String, 
      enum: ['Pre-establishment', 'construction', 'pre-operation', 'operational', 'expansion'], 
      required: true 
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Industry', industrySchema);
