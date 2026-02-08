const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, required: true },
  categoryId: { type: String, required: true },
  subcategoryName: { type: String, default: "" }, // e.g., "Collared", "Collarless", "Signature"
  price: { type: Number, required: true },
  image: { type: String, default: "" },
  images: [{ type: String }],
  description: { type: String, default: "" },
  inStock: { type: Boolean, default: true },
  isBestSeller: { type: Boolean, default: false },
  weight: { type: String, default: "" },
  dimensions: { type: String, default: "" },
  pricing: { type: mongoose.Schema.Types.Mixed },
  colorPriceDiff: { type: Number, default: 50 },
  
  // Fabric/Material variants
  fabrics: [{
    name: { type: String }, // e.g., "Poly Cotton", "Pure Cotton", "Nylon"
    price: { type: Number }, // price for this fabric option
    priceDifference: { type: Number, default: 0 } // price difference from base
  }],
  
  // Available colors
  colors: [{ type: String }], // e.g., ["Maroon", "Navy Blue", "Black", "White"]
  
  // Available sizes
  sizes: [{ type: String }], // e.g., ["S", "M", "L", "XL", "XXL"]
  
  // MOQ - Minimum Order Quantity (0 means no minimum)
  minimumOrderQuantity: { type: Number, default: 0 },
  
  // For products with quantity-based pricing
  pricingType: { type: String, enum: ['standard', 'fabric-based', 'quantity-based'], default: 'standard' },
  quantityBasedPricing: [{
    quantity: { type: Number }, // minimum quantity for this price
    price: { type: Number }
  }],
  
  // Reviews: public user reviews with star rating and comments
  reviews: [{
    name: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  // Instagram reels / links related to this product (admin can add multiple)
  instagramLinks: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true, strict: true, castObjectIdStrings: false });

module.exports = mongoose.model('Product', productSchema);