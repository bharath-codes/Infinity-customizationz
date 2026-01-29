# Code Examples: E-Commerce Implementation

## 1. ProductPage with Buy Now & Add to Cart

**File**: [App.jsx - ProductPage Component](frontend/src/App.jsx#L327-L371)

```jsx
const ProductPage = ({ addToCart }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart: addToCartContext } = useCart();
  const p = products.find(item => item.id === id);
  const [qty, setQty] = useState(1);

  // Handle Add to Cart
  const handleAddToCart = () => {
    const item = {...p, quantity: qty, finalPrice: p.price*qty};
    addToCart(item);              // Legacy state
    addToCartContext(item);       // CartContext
  };

  // Handle Buy Now (Add + Navigate)
  const handleBuyNow = () => {
    const item = {...p, quantity: qty, finalPrice: p.price*qty};
    addToCart(item);              // Add to legacy cart
    addToCartContext(item);       // Add to CartContext
    navigate('/checkout');        // Go to checkout
  };

  return (
    <div className="min-h-screen bg-white pb-24 md:pb-12">
      <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Product Image */}
        <div className="aspect-[4/5] rounded-2xl overflow-hidden shadow-sm border border-gray-100">
          <img src={mainImage} className="w-full h-full object-cover" alt="" />
        </div>

        {/* Product Details */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-brand-dark">
            {p.name}
          </h1>
          <p className="text-3xl font-bold text-brand-blue">₹{p.price * qty}</p>

          {/* Quantity Selector */}
          <div className="bg-gray-50 p-6 rounded-xl border space-y-6">
            <div>
              <span className="block text-sm font-bold text-gray-500 mb-3">QUANTITY</span>
              <div className="flex items-center gap-6">
                <button onClick={() => setQty(Math.max(1, qty-1))} 
                  className="w-10 h-10 border rounded-full font-bold bg-white">
                  -
                </button>
                <span className="text-xl font-bold">{qty}</span>
                <button onClick={() => setQty(qty+1)} 
                  className="w-10 h-10 border rounded-full font-bold bg-white">
                  +
                </button>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg flex gap-3 text-sm text-blue-900 font-bold">
              <Info size={18}/>
              Photo Upload: Please send photos on WhatsApp after order.
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button onClick={handleBuyNow} 
              className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition">
              Buy Now
            </button>
            <button onClick={handleAddToCart} 
              className="w-full bg-gray-200 text-brand-dark py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition">
              Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
```

## 2. CartContext with localStorage

**File**: [CartContext.jsx](frontend/src/contexts/CartContext.jsx)

```jsx
import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // Load from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        setCart(JSON.parse(savedCart));
      } catch (error) {
        console.error('Failed to load cart:', error);
      }
    }
  }, []);

  // Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  // Add or merge items
  const addToCart = (product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item.id === product.id);
      
      if (existingItem) {
        // Merge quantities
        return prevCart.map(item =>
          item.id === product.id
            ? {
                ...item,
                quantity: item.quantity + product.quantity,
                finalPrice: item.price * (item.quantity + product.quantity)
              }
            : item
        );
      }
      
      // Add new item
      return [...prevCart, product];
    });
  };

  // Update quantity
  const updateQuantity = (productId, quantity) => {
    setCart(prevCart => {
      if (quantity <= 0) {
        // Remove if quantity becomes 0
        return prevCart.filter(item => item.id !== productId);
      }
      
      return prevCart.map(item =>
        item.id === productId
          ? {
              ...item,
              quantity,
              finalPrice: item.price * quantity
            }
          : item
      );
    });
  };

  // Remove specific item
  const removeFromCart = (productId) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
  };

  // Clear entire cart
  const clearCart = () => {
    setCart([]);
  };

  // Get total items
  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  // Get total price
  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + item.finalPrice, 0);
  };

  const value = {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    getTotalItems,
    getTotalPrice
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

// Hook to use cart
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within CartProvider');
  }
  return context;
};
```

## 3. Multi-Step Checkout Form

**File**: [Checkout.jsx](frontend/src/pages/Checkout.jsx) - Key sections

```jsx
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, clearCart, getTotalPrice } = useCart();
  const { user, token, isAuthenticated } = useAuth();

  const [step, setStep] = useState('details');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [orderData, setOrderData] = useState({
    customerName: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: '',
    city: '',
    state: '',
    pincode: '',
    paymentMethod: 'online',
    customerNotes: ''
  });

  // Validate form
  const validateForm = () => {
    if (!orderData.customerName) return 'Name required';
    if (!orderData.email) return 'Email required';
    if (!orderData.phoneNumber || orderData.phoneNumber.length !== 10) {
      return 'Valid 10-digit phone required';
    }
    if (!orderData.address) return 'Address required';
    if (!orderData.city) return 'City required';
    if (!orderData.state) return 'State required';
    if (!orderData.pincode || orderData.pincode.length !== 6) {
      return 'Valid 6-digit pincode required';
    }
    return '';
  };

  // Handle checkout
  const handleCheckout = async (e) => {
    e.preventDefault();
    
    // Validate
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');
    setStep('processing');

    try {
      // 1. Create order in backend
      const orderPayload = {
        ...orderData,
        items: cart,
        subtotal: getTotalPrice(),
        shipping: getTotalPrice() > 999 ? 0 : 99,
        total: getTotalPrice() + (getTotalPrice() > 999 ? 0 : 99)
      };

      const orderResponse = await api.orders.create(orderPayload, token);
      const orderId = orderResponse._id;

      // 2. Integrate with Shiprocket
      const shiprocketResponse = await fetch('/api/orders/integrate-shiprocket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ orderId })
      });

      if (!shiprocketResponse.ok) {
        throw new Error('Failed to generate tracking');
      }

      const trackingData = await shiprocketResponse.json();

      // 3. Clear cart and show success
      clearCart();
      setTrackingInfo({
        shiprocketOrderId: trackingData.order?.shiprocketOrderId,
        trackingId: trackingData.tracking?.id,
        estimatedDelivery: trackingData.tracking?.estimatedDelivery,
        carrier: trackingData.tracking?.carrier,
        trackingUrl: trackingData.tracking?.url
      });

      setStep('success');
    } catch (err) {
      setError(err.message || 'Order creation failed');
      setStep('details');
    } finally {
      setLoading(false);
    }
  };

  // Step 1: Details Form
  if (step === 'details') {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 flex items-center justify-center">
        <form onSubmit={handleCheckout} className="bg-white p-8 rounded-2xl shadow-sm border w-full max-w-2xl space-y-6">
          <h2 className="text-3xl font-serif font-bold text-brand-dark">Delivery Details</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex gap-3">
              <AlertCircle size={20} />
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              type="text"
              placeholder="Full Name"
              value={orderData.customerName}
              onChange={e => setOrderData({...orderData, customerName: e.target.value})}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-brand-blue"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={orderData.email}
              onChange={e => setOrderData({...orderData, email: e.target.value})}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-brand-blue"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              required
              type="tel"
              placeholder="Phone Number (10 digits)"
              value={orderData.phoneNumber}
              onChange={e => setOrderData({...orderData, phoneNumber: e.target.value})}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-brand-blue"
            />
            <select
              value={orderData.paymentMethod}
              onChange={e => setOrderData({...orderData, paymentMethod: e.target.value})}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-brand-blue"
            >
              <option value="online">Online Payment</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          <textarea
            required
            placeholder="Full Address (Street, Building, Area)"
            value={orderData.address}
            onChange={e => setOrderData({...orderData, address: e.target.value})}
            className="w-full p-3 border rounded-lg h-24 focus:outline-none focus:border-brand-blue"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <input
              required
              type="text"
              placeholder="City"
              value={orderData.city}
              onChange={e => setOrderData({...orderData, city: e.target.value})}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-brand-blue"
            />
            <input
              required
              type="text"
              placeholder="State"
              value={orderData.state}
              onChange={e => setOrderData({...orderData, state: e.target.value})}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-brand-blue"
            />
            <input
              required
              type="text"
              placeholder="Pincode (6 digits)"
              value={orderData.pincode}
              onChange={e => setOrderData({...orderData, pincode: e.target.value})}
              className="w-full p-3 border rounded-lg focus:outline-none focus:border-brand-blue"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-brand-blue text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {loading ? 'Processing...' : 'Confirm Order'}
          </button>
        </form>
      </div>
    );
  }

  // Step 2: Processing
  if (step === 'processing') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <div className="text-center">
          <Loader className="w-16 h-16 animate-spin text-brand-blue mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Processing Your Order</h2>
          <p className="text-gray-600">Creating shipment and generating tracking...</p>
        </div>
      </div>
    );
  }

  // Step 3: Success
  if (step === 'success' && trackingInfo) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg border max-w-2xl w-full p-8 text-center space-y-8">
          {/* Success Icon */}
          <div className="flex justify-center">
            <CheckCircle className="w-20 h-20 text-green-600" />
          </div>

          {/* Message */}
          <div>
            <h2 className="text-4xl font-serif font-bold text-brand-dark mb-2">Order Confirmed! ✓</h2>
            <p className="text-gray-600 text-lg">Your order has been placed successfully</p>
          </div>

          {/* Tracking Info */}
          <div className="bg-blue-50 p-6 rounded-xl border border-blue-200 space-y-4">
            <div className="flex items-center gap-3 justify-center">
              <Truck className="w-6 h-6 text-brand-blue" />
              <h3 className="text-xl font-bold text-brand-dark">Tracking Information</h3>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex justify-between items-center pb-3 border-b">
                <span className="text-gray-600">Tracking ID:</span>
                <div className="flex gap-2">
                  <span className="font-bold text-brand-blue">{trackingInfo.trackingId}</span>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(trackingInfo.trackingId);
                      alert('Copied to clipboard!');
                    }}
                    className="text-gray-400 hover:text-brand-blue"
                  >
                    <Copy size={18} />
                  </button>
                </div>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Estimated Delivery:</span>
                <span className="font-bold">{trackingInfo.estimatedDelivery}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-gray-600">Carrier:</span>
                <span className="font-bold">{trackingInfo.carrier}</span>
              </div>

              {trackingInfo.trackingUrl && (
                <button
                  onClick={() => window.open(trackingInfo.trackingUrl)}
                  className="w-full mt-4 text-brand-blue hover:underline font-bold"
                >
                  Track Package →
                </button>
              )}
            </div>
          </div>

          {/* WhatsApp Button */}
          <button
            onClick={() => window.open(`https://wa.me/918985993948?text=I ordered with ID ${trackingInfo.trackingId}. Please update me.`)}
            className="w-full bg-[#25D366] text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition flex items-center justify-center gap-2"
          >
            <MessageCircle size={20} />
            Send Photos via WhatsApp
          </button>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <button
              onClick={() => navigate('/')}
              className="flex-1 bg-gray-200 text-brand-dark py-3 rounded-xl font-bold hover:bg-gray-300 transition"
            >
              Continue Shopping
            </button>
            <button
              onClick={() => navigate('/profile')}
              className="flex-1 bg-brand-blue text-white py-3 rounded-xl font-bold hover:bg-blue-700 transition"
            >
              View Orders
            </button>
          </div>
        </div>
      </div>
    );
  }
};

export default Checkout;
```

## 4. Backend Order Creation

**File**: [backend/routes/orders.js](backend/routes/orders.js#L18-L80)

```javascript
// POST /api/orders/create
router.post('/create', authUser, async (req, res) => {
  try {
    const { customerName, email, phoneNumber, address, city, state, pincode, items, subtotal, shipping, total, paymentMethod } = req.body;

    // Validation
    if (!customerName || !email || !phoneNumber || !address || !city || !state || !pincode) {
      return res.status(400).json({ message: 'All fields required' });
    }

    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Cart cannot be empty' });
    }

    // Create order
    const order = new Order({
      userId: req.user._id,
      customerName,
      email,
      phoneNumber,
      address,
      city,
      state,
      pincode,
      items: items.map(item => ({
        productId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        image: item.image
      })),
      subtotal,
      shippingCost: shipping,
      totalAmount: total,
      paymentMethod,
      status: 'pending',
      paymentStatus: 'pending'
    });

    await order.save();

    res.json({
      success: true,
      _id: order._id,
      message: 'Order created successfully'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

## 5. Shiprocket Integration

**File**: [backend/routes/orders.js](backend/routes/orders.js#L277-L330)

```javascript
// POST /api/orders/integrate-shiprocket
router.post('/integrate-shiprocket', authUser, async (req, res) => {
  try {
    const { orderId } = req.body;

    // Validate order
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    // Check ownership
    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Call Shiprocket service
    const shiprocketResponse = await shiprocketService.createShiprocketOrder(order);

    if (!shiprocketResponse.success) {
      return res.status(400).json({ message: 'Failed to create shipment' });
    }

    // Update order with tracking info
    order.shiprocketOrderId = shiprocketResponse.shiprocketOrderId;
    order.shiprocketTrackingId = shiprocketResponse.trackingId;
    order.status = 'confirmed';
    await order.save();

    res.json({
      success: true,
      order: {
        _id: order._id,
        shiprocketOrderId: order.shiprocketOrderId,
        shiprocketTrackingId: order.shiprocketTrackingId
      },
      tracking: {
        id: shiprocketResponse.trackingId,
        estimatedDelivery: shiprocketResponse.estimatedDelivery,
        carrier: shiprocketResponse.carrier,
        url: shiprocketResponse.trackingUrl
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
```

## 6. Shiprocket Service

**File**: [backend/services/shiprocketService.js](backend/services/shiprocketService.js)

```javascript
const axios = require('axios');

let cachedToken = null;
let tokenExpiry = null;

const SHIPROCKET_BASE_URL = 'https://apiv2.shiprocket.in/v1/external';

// Authenticate with Shiprocket
const authenticateShiprocket = async () => {
  // Return cached token if still valid
  if (cachedToken && tokenExpiry > Date.now()) {
    return cachedToken;
  }

  try {
    const response = await axios.post(`${SHIPROCKET_BASE_URL}/auth/login`, {
      email: process.env.SHIPROCKET_EMAIL,
      password: process.env.SHIPROCKET_PASSWORD
    });

    cachedToken = response.data.token;
    // Cache for 12 hours
    tokenExpiry = Date.now() + (12 * 60 * 60 * 1000);

    return cachedToken;
  } catch (error) {
    console.error('Shiprocket auth failed:', error.message);
    throw new Error('Failed to authenticate with Shiprocket');
  }
};

// Create Shiprocket order
const createShiprocketOrder = async (order) => {
  try {
    const token = await authenticateShiprocket();

    const payload = {
      order_id: order._id.toString(),
      order_date: order.createdAt,
      pickup_location_id: process.env.SHIPROCKET_PICKUP_ID,
      billing_customer_name: order.customerName,
      billing_last_name: '',
      billing_address: order.address,
      billing_city: order.city,
      billing_state: order.state,
      billing_country: 'India',
      billing_email: order.email,
      billing_phone: order.phoneNumber,
      shipping_customer_name: order.customerName,
      shipping_address: order.address,
      shipping_city: order.city,
      shipping_state: order.state,
      shipping_country: 'India',
      shipping_email: order.email,
      shipping_phone: order.phoneNumber,
      order_items: order.items.map(item => ({
        name: item.name,
        sku: item.productId,
        units: item.quantity,
        selling_price: item.price
      })),
      payment_method: order.paymentMethod,
      cod: order.paymentMethod === 'cod',
      length: 10,
      breadth: 10,
      height: 10,
      weight: 0.5
    };

    const response = await axios.post(
      `${SHIPROCKET_BASE_URL}/orders/create/adhoc`,
      payload,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return {
      success: true,
      shiprocketOrderId: response.data.order_id,
      trackingId: response.data.awb,
      estimatedDelivery: response.data.estimated_delivery_date,
      carrier: response.data.carrier_name,
      trackingUrl: `https://shiprocket.in/tracking/${response.data.awb}`
    };
  } catch (error) {
    console.error('Shiprocket order creation failed:', error.message);
    return { success: false, error: error.message };
  }
};

module.exports = {
  authenticateShiprocket,
  createShiprocketOrder
};
```

These code examples provide the complete implementation of the e-commerce flow with Shiprocket integration!
