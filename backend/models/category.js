const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  _id: { type: String, required: true }, // e.g., "frames", "magazines"
  title: { type: String, required: true },
  desc: { type: String, default: "" },
  emoji: { type: String, default: "" },
  
  // Showcase products for home page (max 2)
  showcaseProducts: [{
    type: String,  // Product ID reference
  }],
  
  // Showcase images for home page slideshow (3 images as base64)
  showcaseImages: [
    { type: String, default: null },  // Image 1 (base64)
    { type: String, default: null },  // Image 2 (base64)
    { type: String, default: null }   // Image 3 (base64)
  ],
  
  // All products in this category
  products: [{
    type: String,  // Product ID reference
  }],
  
  // Sub-categories
  subCategories: [{
    name: String,
    description: String
  }],
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Category', categorySchema);
