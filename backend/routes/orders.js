const express = require('express');
const router = express.Router();
const Order = require('../models/order');
const Product = require('../models/product');
const { authAdmin, authorize } = require('../middleware/auth');
const { authUser } = require('../middleware/auth');
const { generateOrderId, generateUpiDeepLink } = require('../services/upiService');

// ========== ADMIN ROUTES ==========

// 1. Get All Orders (Admin)
router.get('/admin/orders', authAdmin, authorize(['view_orders']), async (req, res) => {
  try {
    const { status, phoneNumber } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (phoneNumber) filter.phoneNumber = phoneNumber;
    
    const orders = await Order.find(filter)
      .populate('userId', 'name phoneNumber')
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 2. Get Single Order (Admin)
router.get('/admin/orders/:id', authAdmin, authorize(['view_orders']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('userId');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 3. Update Order Status (Admin)
router.put('/admin/orders/:id/status', authAdmin, authorize(['update_orders']), async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    order.status = status;
    if (adminNotes) order.adminNotes = adminNotes;
    order.updatedAt = new Date();
    
    await order.save();
    
    res.json({ message: 'Order status updated', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 4. View Uploaded Images for Order (Admin)
router.get('/admin/orders/:id/images', authAdmin, authorize(['view_images']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id, 'uploadedImages');
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    res.json({ images: order.uploadedImages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5. Add Admin Notes to Order
router.put('/admin/orders/:id/notes', authAdmin, authorize(['update_orders']), async (req, res) => {
  try {
    const { notes } = req.body;
    
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { adminNotes: notes },
      { new: true }
    );
    
    res.json({ message: 'Notes added', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 5.5. Confirm UPI Payment (Admin)
router.put('/admin/orders/:id/confirm-payment', authAdmin, authorize(['update_orders']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.paymentMethod !== 'upi_qr' || order.paymentStatus !== 'pending_confirmation') {
      return res.status(400).json({ message: 'This order is not waiting for UPI payment confirmation' });
    }
    
    // Update payment status
    order.paymentStatus = 'completed';
    order.paymentConfirmedBy = req.adminName || 'admin';
    order.paymentConfirmedAt = new Date();
    order.status = 'confirmed';  // Auto-confirm the order after payment
    
    await order.save();
    
    res.json({ 
      message: 'Payment confirmed successfully',
      order 
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 6. Trigger Shiprocket Shipment (Admin)
router.post('/admin/orders/:id/ship', authAdmin, authorize(['trigger_shipment']), async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.shiprocketOrderId) {
      return res.status(400).json({ message: 'Order already shipped' });
    }
    
    // TODO: Integrate with Shiprocket API
    // For now, just simulate
    const shiprocketOrderId = 'SRP-' + Date.now();
    
    order.shiprocketOrderId = shiprocketOrderId;
    order.status = 'shipped';
    order.shippedDate = new Date();
    await order.save();
    
    res.json({ 
      message: 'Shipment triggered',
      shiprocketOrderId,
      order
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ========== USER ROUTES ==========

// 7. Create Order (User)
router.post('/create', authUser, async (req, res) => {
  try {
    const { items, phoneNumber, customerName, email, address, city, state, pincode, paymentMethod, customerNotes } = req.body;
    
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Items required' });
    }
    
    let subtotal = 0;
    const processedItems = [];
    
    for (const item of items) {
      // Find product by name or string ID (no casting to ObjectId)
      let product = await Product.findOne({ 
        $or: [
          { name: item.productId }, 
          { _id: item.productId }
        ] 
      }).catch(() => null);
      
      if (!product) {
        return res.status(404).json({ message: `Product ${item.productId} not found` });
      }
      
      processedItems.push({
        productId: product._id || item.productId,
        productName: product.name,
        price: product.price,
        quantity: item.quantity || 1,
        customizationDetails: item.customizationDetails || ''
      });
      
      subtotal += product.price * (item.quantity || 1);
    }
    
    // Compute per-item shipping based on product price:
    // - price < 300 => ₹69
    // - 300 <= price <= 500 => ₹99
    // - price > 500 => ₹150 + (small surcharge capped at ₹30) => range ₹150-₹180
    let shippingCost = 0;
    for (const it of processedItems) {
      const price = Number(it.price || 0);
      let perItemShipping = 150; // default for >500
      if (price < 300) perItemShipping = 69;
      else if (price <= 500) perItemShipping = 99;
      else {
        const extra = Math.min(30, Math.floor((price - 500) / 100) * 10);
        perItemShipping = 150 + extra; // between 150 and 180
      }
      shippingCost += perItemShipping * (it.quantity || 1);
    }

    // Taxes removed (set to zero)
    const tax = 0;
    const totalAmount = subtotal + shippingCost + tax;
    
    // Generate order ID
    const orderId = generateOrderId();
    
    // Generate UPI deep link if payment method is UPI
    let upiDeepLink = '';
    let paymentStatus = 'pending';
    
    if (paymentMethod === 'upi' || paymentMethod === 'upi_qr') {
      upiDeepLink = generateUpiDeepLink(orderId, totalAmount);
      paymentStatus = 'pending_confirmation';
    }
    
    const order = new Order({
      orderId,
      userId: req.userId,
      phoneNumber,
      customerName,
      email,
      address,
      city,
      state,
      pincode,
      items: processedItems,
      subtotal,
      shippingCost,
      tax,
      totalAmount,
      paymentMethod: paymentMethod === 'upi' || paymentMethod === 'upi_qr' ? 'upi_qr' : paymentMethod,
      paymentStatus,
      upiDeepLink,
      customerNotes
    });
    
    await order.save();
    
    res.status(201).json({
      message: 'Order created successfully',
      order,
      _id: order._id,
      orderId: order.orderId,
      upiDeepLink: order.upiDeepLink
    });
  } catch (err) {
    console.error('❌ Order creation error:', err);
    res.status(500).json({ message: err.message, error: err.toString() });
  }
});

// 8. Get User Orders
router.get('/my-orders', authUser, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.userId })
      .sort({ createdAt: -1 });
    
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 9. Get Single Order (User can only see their own)
router.get('/:id', authUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 10. Upload Images for Order (User)
router.post('/:id/upload-images', authUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }
    
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }
    
    // TODO: Handle file upload (multer)
    // For now, accept JSON with file URLs
    const { images } = req.body;
    
    if (!images || images.length === 0) {
      return res.status(400).json({ message: 'Images required' });
    }
    
    images.forEach(img => {
      order.uploadedImages.push({
        fileName: img.name,
        fileUrl: img.url,
        uploadedAt: new Date()
      });
    });
    
    await order.save();
    
    res.json({ message: 'Images uploaded', order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 11. Integrate Order with Shiprocket (Trigger Shipment)
router.post('/integrate-shiprocket', authUser, async (req, res) => {
  try {
    const { orderId, orderData } = req.body;
    const shiprocketService = require('../services/shiprocketService');

    // Find the order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check if user owns the order
    if (order.userId.toString() !== req.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Check if already integrated with Shiprocket
    if (order.shiprocketOrderId) {
      return res.status(400).json({ message: 'Order already integrated with Shiprocket' });
    }

    // Create order in Shiprocket
    const shiprocketResult = await shiprocketService.createShiprocketOrder(order);

    if (!shiprocketResult.success) {
      return res.status(400).json({
        message: 'Failed to integrate with Shiprocket',
        error: shiprocketResult.error
      });
    }

    // Update order with Shiprocket details
    order.shiprocketOrderId = shiprocketResult.shiprocketOrderId;
    order.shiprocketTrackingId = shiprocketResult.trackingNumber;
    order.status = 'confirmed';
    order.updatedAt = new Date();

    await order.save();

    res.json({
      message: 'Order integrated with Shiprocket',
      success: true,
      shiprocketOrderId: shiprocketResult.shiprocketOrderId,
      trackingNumber: shiprocketResult.trackingNumber,
      carrier: shiprocketResult.carrier || 'Multiple Carriers',
      order
    });
  } catch (err) {
    console.error('Shiprocket integration error:', err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
