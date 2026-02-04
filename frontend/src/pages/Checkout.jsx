import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader, AlertCircle, CheckCircle, Copy, Truck, MapPin, Phone, Mail } from 'lucide-react';
import { useCart } from '../contexts/CartContext';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import BackButton from '../components/BackButton';

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
    customerNotes: '',
    acceptedTerms: false
  });

  const [orderDetails, setOrderDetails] = useState(null);
  const [upiData, setUpiData] = useState(null);
  const [paymentConfirmed, setPaymentConfirmed] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);

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
  const calcShippingForItems = (items) => {
    let s = 0;
    items.forEach(item => {
      const price = Number(item.price || 0);
      let per = 150;
      if (price < 300) per = 69;
      else if (price <= 500) per = 99;
      else {
        const extra = Math.min(30, Math.max(0, Math.floor((price - 500) / 100) * 10));
        per = 150 + extra;
      }
      s += per * (item.quantity || 1);
    });
    return s;
  };
  const shipping = calcShippingForItems(cart);
  const tax = 0;
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
    if (!orderData.acceptedTerms) return 'You must accept the Return & Refund Policy to proceed';
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
                <div className="mb-4"><BackButton /></div>
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

                  {/* Terms & Refund Policy */}
                  <div>
                    <label className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        name="acceptedTerms"
                        checked={orderData.acceptedTerms}
                        onChange={(e) => setOrderData(prev => ({ ...prev, acceptedTerms: e.target.checked }))}
                        className="mt-1 w-4 h-4"
                      />
                      <div>
                        <div className="text-sm">I agree to the <button type="button" onClick={() => setShowPolicy(s => !s)} className="text-brand-blue underline">Return & Refund Policy</button></div>
                        {showPolicy && (
                          <div className="mt-2 text-sm text-gray-700 bg-gray-50 p-3 rounded border">
                            <h4 className="font-bold mb-2">Return & Refund Terms & Conditions</h4>
                            <ul className="list-disc list-inside mb-2">
                              <li>All products are customized and made to order. Hence, returns or refunds are not accepted except in cases mentioned below.</li>
                              <li>Returns or replacements are accepted only if the product is 100% damaged at the time of delivery or if a wrong item is received.</li>
                              <li>A clear unboxing video is mandatory to claim any return, replacement, or refund.</li>
                              <li>The unboxing video must clearly show the package being opened and the damaged/wrong product.</li>
                              <li>No claim will be accepted without an unboxing video.</li>
                              <li>All claims must be raised within 24 hours of delivery.</li>
                              <li>If the claim is approved, a replacement will be provided first.</li>
                              <li>Refunds will be processed only if a replacement is not possible.</li>
                            </ul>
                            <h4 className="font-bold mb-2 mt-4">No Return / No Refund Policy</h4>
                            <p className="mb-2">No returns or refunds will be provided in the following cases:</p>
                            <ul className="list-disc list-inside mb-2">
                              <li>Minor defects or slight imperfections</li>
                              <li>Change of mind after placing the order</li>
                              <li>Wrong product ordered by the customer</li>
                              <li>Dissatisfaction with color, size, or design</li>
                              <li>Any reason other than complete damage or wrong item received</li>
                            </ul>
                            <h4 className="font-bold mb-2 mt-4">Color Disclaimer</h4>
                            <ul className="list-disc list-inside mb-2">
                              <li>Product colors may vary slightly due to lighting, photography, or screen settings.</li>
                              <li>A 5%–10% color variation from the website images is normal and not considered a defect.</li>
                              <li>By placing an order on our website, the customer agrees to all the above Terms & Conditions.</li>
                            </ul>
                          </div>
                        )}
                      </div>
                    </label>
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
                          <p className="text-xs text-gray-600">UPI payment</p>
                        </div>
                      </label>

                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading || !orderData.acceptedTerms}
                    className={`w-full bg-green-600 hover:bg-green-700 ${(!orderData.acceptedTerms && !loading) ? 'opacity-60 cursor-not-allowed' : ''} disabled:bg-gray-400 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors`}
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
                    <div key={item.id} className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{item.name} x {item.quantity}</span>
                        <span className="font-semibold text-gray-800">₹{item.price * item.quantity}</span>
                      </div>
                      {item.addOn && item.addOn.price ? (
                        <div className="text-xs text-gray-500">Add-on ({item.addOn.type}) ₹{item.addOn.price} x {item.quantity} = ₹{item.addOn.price * item.quantity}</div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span className={shipping === 0 ? 'text-green-600 font-semibold' : ''}>
                      {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between border-t pt-3 font-bold text-lg">
                    <span>Total</span>
                    <span className="text-brand-blue">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-xs p-3 rounded-lg">
                  💡 Shipping is calculated per item based on price.
                </div>
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
                <div className="mb-4"><BackButton /></div>
                <h1 className="text-3xl font-bold text-brand-dark mb-8">UPI Payment</h1>

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
                    <button
                      type="button"
                      onClick={() => {
                        try {
                          const link = upiData.upiLink;
                          const isiOS = /iP(hone|od|ad)/.test(navigator.platform) || (navigator.userAgent.includes('Mac') && 'ontouchend' in document);
                          // Prefer same-window navigation on iOS to reliably open UPI apps
                          if (/^upi:/i.test(link)) {
                            if (isiOS) window.location.href = link; else window.open(link, '_self');
                          } else {
                            // Fallback to opening in new tab for https links
                            window.open(link, '_blank', 'noopener');
                          }
                        } catch (err) { console.error('Failed to open UPI link', err); window.location.href = upiData.upiLink; }
                      }}
                      className="block w-full border border-blue-600 text-blue-600 bg-white py-3 rounded-xl font-semibold text-lg text-center transition-all duration-200 hover:bg-blue-50"
                    >
                      Pay via UPI
                    </button>
                  )}

                  {/* Desktop PhonePe QR Screenshot */}
                  {typeof window !== 'undefined' && window.innerWidth > 768 && (
                    <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 p-6 rounded-xl">
                      <p className="text-sm font-semibold text-gray-600 mb-4">UPI Payment</p>
                      <div className="flex justify-center">
                        <div className="w-72 h-72 border-2 border-gray-300 rounded-lg p-2 bg-white flex items-center justify-center overflow-hidden">
                          <img loading="lazy" src="/images/phonepe-qr.png" alt="UPI QR" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 text-center mt-4">Scan the QR code with your UPI app to complete payment.</p>
                    </div>
                  )}

                  {/* Manual Payment Link for Desktop */}
                  {typeof window !== 'undefined' && window.innerWidth > 768 && upiData?.upiLink && (
                    <button
                      type="button"
                      onClick={() => { try { window.open(upiData.upiLink, '_blank', 'noopener'); } catch (err) { window.location.href = upiData.upiLink; } }}
                      className="block w-full border border-blue-600 text-blue-600 bg-white py-3 rounded-xl font-semibold text-lg text-center hover:bg-blue-50 transition-all duration-200"
                    >
                      Open payment link
                    </button>
                  )}
                </div>

                {/* Instructions */}
                <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded mb-8">
                  <h4 className="font-bold text-yellow-900 mb-2">Instructions</h4>
                  <ol className="text-sm text-yellow-800 space-y-2">
                    <li>Open your UPI app and scan the QR code above.</li>
                    <li>Verify the amount: ₹{upiData?.amount}.</li>
                    <li>Complete the payment and note the transaction details.</li>
                    <li>Click the "I have paid" button below once payment is done.</li>
                    <li>We will verify and confirm your payment.</li>
                  </ol>
                </div>

                {/* Confirmation Button */}
                <button
                  onClick={handlePaymentConfirmed}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-4 rounded-xl font-bold text-lg transition-colors"
                >
                  I have paid — Confirm Payment
                </button>

                <p className="text-xs text-gray-600 text-center mt-4">
                  We will contact you shortly to verify the payment
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
                      {item.addOn && item.addOn.price ? (
                        <div className="text-xs text-gray-500">Add-on ({item.addOn.type}) ₹{item.addOn.price} x {item.quantity} = ₹{item.addOn.price * item.quantity}</div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span>₹{subtotal.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Shipping</span>
                    <span>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Taxes</span>
                    <span>₹0</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 font-bold text-lg">
                    <span>Total</span>
                    <span className="text-green-600">₹{total.toLocaleString('en-IN')}</span>
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
    // --- Related Products logic ---
    // Find the first purchased product from the cart/orderDetails
    let relatedCategoryId = null;
    let purchasedProductId = null;
    if (orderDetails && orderDetails.items && orderDetails.items.length > 0) {
      purchasedProductId = orderDetails.items[0].productId;
    }
    // Import products from data.js
    let relatedProducts = [];
    try {
      // eslint-disable-next-line
      // @ts-ignore
      // products is available if imported at the top
      if (purchasedProductId && typeof require !== 'undefined') {
        const { products } = require('../data');
        const purchased = products.find(p => (p.id === purchasedProductId || p._id === purchasedProductId));
        if (purchased) {
          relatedCategoryId = purchased.categoryId;
          relatedProducts = products.filter(
            p => p.categoryId === relatedCategoryId && (p._id || p.id) !== purchasedProductId
          ).slice(0, 4);
        }
      }
    } catch (e) {
      // fallback: do nothing
    }

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
              Your payment is <strong>pending confirmation</strong>. We will verify the payment amount within 1-2 hours and contact you on WhatsApp.
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
              href={`https://wa.me/918985993948?text=${encodeURIComponent(`Hi, I have placed order ${upiData?.orderId}. My payment of ₹${upiData?.amount} is pending confirmation. Order ID: ${upiData?.orderId}`)}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              📞 Notify Admin on WhatsApp
            </a>

            <a
              href={`https://wa.me/918985993948?text=${encodeURIComponent(`Hi, I placed order ${upiData?.orderId}. I want to send product photos for customization. Order ID: ${upiData?.orderId}`)}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center bg-[#25D366] text-white py-3 rounded-lg font-bold hover:bg-[#20ba5c] transition-colors"
            >
              📸 Send Photos via WhatsApp
            </a>

            <button
              onClick={() => navigate('/')}
              className="md:col-span-2 bg-brand-blue text-white py-3 rounded-lg font-bold hover:bg-brand-dark transition-colors"
            >
              Continue Shopping
            </button>
          </div>

          <p className="text-xs text-gray-600 text-center mt-4">
            Keep this order ID safe. You'll need it for support.
          </p>

          {/* Related Products Section */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-bold mb-4 text-brand-dark font-serif">Related Products</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
                {relatedProducts.map(p => (
                  <a
                    href={`/product/${p._id || p.id}`}
                    key={p._id || p.id}
                    className="block group"
                  >
                    <div className="rounded-xl overflow-hidden aspect-[4/5] bg-gray-100">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition" />
                    </div>
                    <h4 className="font-serif font-bold text-brand-dark text-sm mt-3 truncate">{p.name}</h4>
                    <p className="text-brand-blue font-bold text-sm">₹{p.price}</p>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
};

export default Checkout;
