const mongoose = require('mongoose');

const phoneModelSchema = new mongoose.Schema({
  company: { type: String, required: true, trim: true },
  models: [{ type: String, trim: true }], // Array of phone models for this company
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

// Ensure company name is unique
phoneModelSchema.index({ company: 1 }, { unique: true });

module.exports = mongoose.model('PhoneModel', phoneModelSchema);
