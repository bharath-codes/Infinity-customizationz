const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  categoryId: { type: String, required: true },
  price: { type: Number, required: true },
  image: { type: String, default: "" },
  images: [{ type: String }],
  description: { type: String, default: "" },
  inStock: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, strict: true, castObjectIdStrings: false });

module.exports = mongoose.model('Product', productSchema);