const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, unique: true, sparse: true },  // INF-XXXX-XXXXXX format
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  phoneNumber: { type: String, required: true },
  customerName: { type: String, required: true },
  email: { type: String, default: "" },
  
  // Shipping Address
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  pincode: { type: String, required: true },
  
  // Order Items
  items: [{
    productId: { type: String },  // Changed from ObjectId to String
    productName: String,
    price: Number,
    quantity: Number,
    customizationDetails: String  // For custom photo products
  }],
  
  // Pricing
  subtotal: { type: Number, required: true },
  shippingCost: { type: Number, default: 0 },
  tax: { type: Number, default: 0 },
  totalAmount: { type: Number, required: true },
  
  // Order Status
  status: {
    type: String,
    enum: ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
    default: "pending"
  },
  
  // Payment
  paymentMethod: { type: String, enum: ["cod", "upi", "upi_qr", "card"], default: "cod" },
  paymentStatus: { type: String, enum: ["pending", "pending_confirmation", "completed", "failed"], default: "pending" },
  upiDeepLink: { type: String, default: "" },  // Store UPI deep link
  paymentConfirmedBy: { type: String, default: "" },  // Admin username who confirmed
  paymentConfirmedAt: { type: Date, default: null },  // When admin confirmed
  
  // Shipping
  trackingNumber: { type: String, default: null },
  shippedDate: { type: Date, default: null },
  
  // Custom Images/Files Uploaded
  uploadedImages: [{ 
    fileName: String,
    fileUrl: String,
    uploadedAt: { type: Date, default: Date.now }
  }],
  
  // Notes
  adminNotes: { type: String, default: "" },
  customerNotes: { type: String, default: "" },
  
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);
