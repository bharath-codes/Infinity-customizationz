import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, AlertCircle, CheckCircle, Copy, Truck, MapPin, Phone, Mail } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const Checkout = () => {
  const navigate = useNavigate();
  const { cart, getTotalPrice, clearCart } = useCart();
  const { user, token, isAuthenticated } = useAuth();

  // Checkout states
  const [step, setStep] = useState('details'); // details, payment, success
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
    paymentMethod: 'upi',
    customerNotes: ''
  });

  const [orderDetails, setOrderDetails] = useState(null);
  const [upiData, setUpiData] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);

  // Check if user is logged in
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Login Required</h2>
        <p className="text-gray-600 mb-6">Please login to proceed with checkout.</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-brand-blue text-white px-8 py-3 rounded-lg font-bold"
        >
          Go to Login
        </button>
      </div>
    );
  }

  // Check if cart is empty
  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-4">
        <AlertCircle className="w-12 h-12 text-yellow-500 mb-4" />
        <h2 className="text-2xl font-bold mb-2">Cart is Empty</h2>
        <p className="text-gray-600 mb-6">Add some products before checkout.</p>
        <button
          onClick={() => navigate('/')}
          className="bg-brand-blue text-white px-8 py-3 rounded-lg font-bold"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const shipping = subtotal > 999 ? 0 : 100;
  const tax = Math.round(subtotal * 0.18);
  const total = subtotal + shipping + tax;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setOrderData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!orderData.customerName.trim()) return 'Name is required';
    if (!orderData.phoneNumber.trim()) return 'Phone is required';
    if (!orderData.email.trim()) return 'Email is required';
    if (!orderData.address.trim()) return 'Address is required';
    if (!orderData.city.trim()) return 'City is required';
    if (!orderData.state.trim()) return 'State is required';
    if (!orderData.pincode.trim()) return 'Pincode is required';
    return null;
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Create order with UPI payment
      const response = await api.orders.create({
        items: cart.map(item => ({
          productId: item.id || item._id,
          quantity: item.quantity,
          customizationDetails: item.customizationDetails || ''
        })),
        ...orderData
      }, token);

      console.log('Order created:', response);

      setOrderDetails(response.order);
      setUpiData({
        orderId: response.orderId,
        upiLink: response.upiDeepLink,
        amount: total
      });

      setStep('payment');
    } catch (err) {
      console.error('Checkout error:', err);
      setError(err.message || 'Failed to create order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentConfirmed = () => {
    setPaymentConfirmed(true);
    clearCart();
    setStep('success');
  };

  // ===== STEP 1: DELIVERY DETAILS =====
  if (step === 'details') {
    return (
      <div className="min-h-screen bg-brand-light py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-brand-blue hover:text-brand-dark mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Cart
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-md p-8 border">
                <h1 className="text-3xl font-bold text-brand-dark mb-8">Delivery Details</h1>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 flex gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    {error}
                  </div>
                )}

                <form onSubmit={handleCheckout} className="space-y-6">
                  {/* Personal Info */}
                  <div>
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="customerName"
                        placeholder="Full Name *"
                        value={orderData.customerName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors"
                        required
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address *"
                        value={orderData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors"
                        required
                      />
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="WhatsApp Number *"
                      value={orderData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors mt-4"
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Delivery Address</h3>
                    <textarea
                      name="address"
                      placeholder="House No., Building Name, Road, Area, Village *"
                      value={orderData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors h-24"
                      required
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <input
                        type="text"
                        name="city"
                        placeholder="City *"
                        value={orderData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors"
                        required
                      />
                      <input
                        type="text"
                        name="state"
                        placeholder="State *"
                        value={orderData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors"
                        required
                      />
                      <input
                        type="text"
                        name="pincode"
                        placeholder="Pincode *"
                        value={orderData.pincode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Additional Notes (Optional)</h3>
                    <textarea
                      name="customerNotes"
                      placeholder="Any special instructions for delivery..."
                      value={orderData.customerNotes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors h-20"
                    />
                  </div>

                  {/* Payment Method */}
                  <div>
                    <h3 className="text-lg font-semibold text-brand-dark mb-4">Payment Method</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border-2 border-brand-blue rounded-lg cursor-pointer bg-blue-50">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={orderData.paymentMethod === 'upi'}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-brand-blue"
                        />
                        <div>
                          <span className="font-semibold text-brand-dark">UPI Payment</span>
                          <p className="text-xs text-gray-600">PhonePe, Google Pay, Paytm, or any UPI app</p>
                        </div>
                      </label>
                      <label className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:border-brand-blue transition-colors">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="cod"
                          checked={orderData.paymentMethod === 'cod'}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-brand-blue"
                        />
                        <span className="font-semibold text-brand-dark">Cash on Delivery</span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    {loading ? (
                      <>
                        <Loader className="w-5 h-5 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      <>
                        <Truck className="w-5 h-5" />
                        Place Order
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-6 border sticky top-24">
                <h3 className="text-xl font-bold text-brand-dark mb-6">Order Summary</h3>

                {/* Items */}
                <div className="space-y-4 mb-6 pb-6 border-b">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-gray-600">
                        {item.name} x {item.quantity}
                      </span>
                      <span className="font-semibold text-gray-800">₹{item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                      {shipping === 0 ? 'FREE' : `₹${shipping}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span>₹{tax}</span>
                  </div>
                  <div className="flex justify-between border-t pt-3 font-bold text-lg">
                    <span>Total</span>
                    <span className="text-brand-blue">₹{total}</span>
                  </div>
                </div>

                {subtotal < 1000 && (
                  <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-3 rounded-lg">
                    💡 Free shipping on orders above ₹999
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== STEP 2: UPI PAYMENT PAGE =====
  if (step === 'payment') {
    return (
      <div className="min-h-screen bg-brand-light py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-2xl shadow-md p-8 border">
                <h1 className="text-3xl font-bold text-brand-dark mb-8">🔐 UPI Payment</h1>

                {/* Order ID */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
                  <p className="text-sm text-gray-600 mb-1">Order ID</p>
                  <p className="text-xl font-bold text-brand-blue">{upiData?.orderId}</p>
                </div>

                {/* Amount */}
                <div className="bg-green-50 border border-green-200 p-6 rounded-xl mb-8">
                  <p className="text-sm text-gray-600 mb-2">Amount to Pay</p>
                  <p className="text-4xl font-bold text-green-600">₹{upiData?.amount}</p>
                </div>

                {/* Payment Options */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-brand-dark">Payment Methods</h3>

                  {/* Loading State */}
                  {!upiData?.upiLink && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-3">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Generating payment link...</span>
                    </div>
                  )}

                  {/* Mobile Payment Button */}
                  {typeof window !== 'undefined' && window.innerWidth <= 768 && upiData?.upiLink && (
                    <a
                      href={upiData.upiLink}
                      className="block w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white py-4 rounded-xl font-bold text-lg text-center transition-all duration-300 transform hover:scale-105 shadow-md active:scale-95"
                    >
                      📱 Open UPI App
                    </a>
                  )}

                  {/* Desktop PhonePe QR Screenshot */}
                  {typeof window !== 'undefined' && window.innerWidth > 768 && (
                    <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 p-6 rounded-xl">
                      <p className="text-sm font-semibold text-gray-600 mb-4">
                        💜 Scan with PhonePe
                      </p>
                      <div className="flex justify-center">
                        <div className="w-64 h-64 border-2 border-gray-300 rounded-lg p-2 bg-white flex items-center justify-center">
                          <img loading="lazy" src="/images/phonepe-qr.png" alt="PhonePe QR" className="w-full h-full object-contain" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 text-center mt-4">
                        Scan this QR with PhonePe app to complete payment
                      </p>
                    </div>
                  )}

                  {/* Manual Payment Link for Desktop */}
                  {typeof window !== 'undefined' && window.innerWidth > 768 && upiData?.upiLink && (
                    <a
                      href={upiData.upiLink}
                      target="_blank"
                      rel="noreferrer"
                      className="block w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white py-4 rounded-xl font-bold text-lg text-center transition-all duration-300 transform hover:scale-105 shadow-md active:scale-95"
                    >
                      💳 Open with UPI App
                    </a>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-8">
                  <h4 className="font-bold text-yellow-900 mb-2">📋 Instructions</h4>
                  <ol className="text-sm text-yellow-800 space-y-2">
                    <li>1️⃣ Open PhonePe app and scan the QR code above</li>
                    <li>2️⃣ Verify the amount: ₹{upiData?.amount}</li>
                    <li>3️⃣ Complete the payment</li>
                    <li>4️⃣ Click "I have paid" button below</li>
                    <li>5️⃣ Admin will verify and confirm your payment</li>
                  </ol>
                </div>

                {/* Confirmation Button */}
                <button
                  onClick={handlePaymentConfirmed}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition-colors"
                >
                  ✅ I have paid - Confirm Payment
                </button>

                <p className="text-xs text-gray-600 text-center mt-4">
                  Admin will contact you shortly to verify the payment
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-md p-6 border sticky top-24">
                <h3 className="text-xl font-bold text-brand-dark mb-6">Order Summary</h3>

                {/* Items */}
                <div className="space-y-3 mb-6 pb-6 border-b">
                  {cart.map((item) => (
                    <div key={item.id || item._id} className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{item.name}</span>
                        <span className="font-semibold">₹{item.price * item.quantity}</span>
                      </div>
                      <span className="text-xs text-gray-500">x {item.quantity}</span>
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax (18%)</span>
                    <span>₹{tax}</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">₹{total}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-blue-900 mb-2">Delivery To:</p>
                  <p className="text-xs text-blue-800">{orderData.customerName}</p>
                  <p className="text-xs text-blue-800">{orderData.address}</p>
                  <p className="text-xs text-blue-800">{orderData.city}, {orderData.state} {orderData.pincode}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ===== STEP 3: SUCCESS PAGE =====
  if (step === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 border">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4 animate-bounce" />
            <h1 className="text-3xl font-bold text-brand-dark mb-2">Payment Submitted!</h1>
            <p className="text-gray-600">Your payment is pending admin verification</p>
          </div>

          {/* Order ID */}
          <div className="bg-brand-light p-6 rounded-xl mb-8">
            <p className="text-sm text-gray-600 mb-2">Order ID</p>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono font-bold text-brand-blue">
                {upiData?.orderId}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(upiData?.orderId);
                  alert('Order ID copied!');
                }}
                className="text-gray-500 hover:text-brand-blue"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="bg-yellow-50 border-2 border-yellow-200 p-6 rounded-xl mb-8">
            <h3 className="text-lg font-bold text-yellow-900 mb-2">⏳ Payment Status</h3>
            <p className="text-yellow-800 mb-4">
              Your payment is <strong>pending confirmation</strong>. Admin will verify the payment amount within 1-2 hours and contact you on WhatsApp.
            </p>
            <div className="bg-white p-3 rounded border border-yellow-200">
              <p className="text-sm text-gray-600 mb-1">Amount Paid:</p>
              <p className="text-2xl font-bold text-green-600">₹{upiData?.amount}</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-brand-dark mb-4">Delivery Address</h3>
            <div className="space-y-2 text-sm">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="font-semibold">{orderData.customerName}</p>
                  <p className="text-gray-600">{orderData.address}</p>
                  <p className="text-gray-600">{orderData.city}, {orderData.state} {orderData.pincode}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <p className="text-gray-600">{orderData.phoneNumber}</p>
              </div>
              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <p className="text-gray-600">{orderData.email}</p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
            <p className="text-sm font-semibold text-blue-900 mb-2">📋 What's Next?</p>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>✓ Admin verifies payment (1-2 hours)</li>
              <li>✓ Admin contacts you on WhatsApp</li>
              <li>✓ Send product photos on WhatsApp</li>
              <li>✓ Customization & shipping starts</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <a
              href={`https://wa.me/${orderData.phoneNumber?.replace(/\D/g, '')}?text=Hi! I've placed order ${upiData?.orderId}. My payment of ₹${upiData?.amount} is pending confirmation. Reference: ${upiData?.orderId}`}
              className="block text-center bg-[#25D366] text-white py-3 rounded-lg font-bold hover:bg-[#20ba5c] transition-colors"
            >
              📞 Notify on WhatsApp
            </a>
            <button
              onClick={() => navigate('/')}
              className="bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-brand-dark transition-colors"
            >
              Continue Shopping
            </button>
          </div>

          <p className="text-xs text-gray-600 text-center mt-4">
            Keep this order ID safe. You'll need it for support.
          </p>
        </div>
      </div>
    );
  }
};

export default Checkout;
