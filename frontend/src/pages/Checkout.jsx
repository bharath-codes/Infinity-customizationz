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
        <h2 className="text-2xl font-bold font-serif text-brand-primary mb-2">Login Required</h2>
        <p className="text-brand-primary/70 mb-6">Please log in to proceed with checkout</p>
        <button
          onClick={() => navigate('/login')}
          className="bg-brand-secondary hover:bg-brand-secondary/90 text-white px-8 py-3 rounded-lg font-bold transition-colors duration-200"
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
        <AlertCircle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-2xl font-bold font-serif text-brand-primary mb-2">Your Cart is Empty</h2>
        <p className="text-brand-primary/70 mb-6">Add products to your cart before checking out</p>
        <button
          onClick={() => navigate('/')}
          className="bg-brand-secondary hover:bg-brand-secondary/90 text-white px-8 py-3 rounded-lg font-bold transition-colors duration-200"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  const subtotal = getTotalPrice();
  const hamperItemsTotal = cart.reduce((sum, item) => sum + (Number(item.hamperItemTotal) || 0), 0);
  const subtotalWithHamper = subtotal + hamperItemsTotal;
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
  const total = subtotalWithHamper + shipping + tax;

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

  const generateInvoice = () => {
    const od = orderDetails || {};
    const id = od.orderId || upiData?.orderId || 'order';
    const createdAt = od.createdAt ? new Date(od.createdAt).toLocaleString() : new Date().toLocaleString();
    const items = (od.items || []).map(i => ({ name: i.productName || i.name || 'Item', qty: i.quantity || 1, price: i.price || 0 }));
    const subtotalLocal = od.subtotal || subtotalWithHamper;
    const shippingLocal = od.shippingCost || shipping;
    const taxLocal = od.tax || tax;
    const totalLocal = od.totalAmount || total;

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${id}</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111}h1{color:#0b63a7}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{padding:8px;border:1px solid #ddd;text-align:left}tfoot td{font-weight:bold}</style></head><body><h1>Infinity Customizations — Invoice</h1><p>Order ID: <strong>${id}</strong></p><p>Date: ${createdAt}</p><h3>Billing / Shipping</h3><p>${orderData.customerName}<br/>${orderData.address}<br/>${orderData.city}, ${orderData.state} ${orderData.pincode}<br/>Phone: ${orderData.phoneNumber}<br/>Email: ${orderData.email}</p><h3>Items</h3><table><thead><tr><th>Item</th><th>Qty</th><th>Price (₹)</th><th>Line Total (₹)</th></tr></thead><tbody>${items.map(it=>`<tr><td>${it.name}</td><td>${it.qty}</td><td>${it.price.toLocaleString('en-IN')}</td><td>${(it.price*it.qty).toLocaleString('en-IN')}</td></tr>`).join('')}</tbody><tfoot><tr><td colspan="3">Subtotal</td><td>₹${Number(subtotalLocal).toLocaleString('en-IN')}</td></tr><tr><td colspan="3">Shipping</td><td>₹${Number(shippingLocal).toLocaleString('en-IN')}</td></tr><tr><td colspan="3">Taxes</td><td>₹${Number(taxLocal).toLocaleString('en-IN')}</td></tr><tr><td colspan="3">Total</td><td>₹${Number(totalLocal).toLocaleString('en-IN')}</td></tr></tfoot></table><p style="margin-top:18px;font-size:12px;color:#555">Thank you for your order. For support, contact infinitycustomizations@gmail.com or WhatsApp +91 89859 93948.</p></body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${id}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  // ===== STEP 1: DELIVERY DETAILS =====
  if (step === 'details') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-surface-light to-surface-elevated py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center gap-2 text-brand-secondary hover:text-brand-secondary/80 mb-8 font-semibold transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5" />
            Return to Cart
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-8 border border-border-light">
                <div className="mb-4"><BackButton /></div>
                <h1 className="text-3xl font-serif font-bold text-brand-primary mb-8">Delivery Information</h1>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg mb-6 flex gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5 text-red-600" />
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <form onSubmit={handleCheckout} className="space-y-6">
                  {/* Personal Information */}
                  <div>
                    <h3 className="text-lg font-semibold text-brand-primary mb-4">Personal Information</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        name="customerName"
                        placeholder="Full Name"
                        value={orderData.customerName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 transition-all duration-200 text-sm placeholder:text-brand-primary/40"
                        required
                      />
                      <input
                        type="email"
                        name="email"
                        placeholder="Email Address"
                        value={orderData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 transition-all duration-200 text-sm placeholder:text-brand-primary/40"
                        required
                      />
                    </div>
                    <input
                      type="tel"
                      name="phoneNumber"
                      placeholder="Phone Number (WhatsApp)"
                      value={orderData.phoneNumber}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 transition-all duration-200 text-sm placeholder:text-brand-primary/40 mt-4"
                      required
                    />
                  </div>

                  {/* Delivery Address */}
                  <div>
                    <h3 className="text-lg font-semibold text-brand-primary mb-4">Delivery Address</h3>
                    <textarea
                      name="address"
                      placeholder="Street address, building name, apartment details"
                      value={orderData.address}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 transition-all duration-200 h-24 text-sm placeholder:text-brand-primary/40"
                      required
                    />
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      <input
                        type="text"
                        name="city"
                        placeholder="City"
                        value={orderData.city}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 transition-all duration-200 text-sm placeholder:text-brand-primary/40"
                        required
                      />
                      <input
                        type="text"
                        name="state"
                        placeholder="State"
                        value={orderData.state}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 transition-all duration-200 text-sm placeholder:text-brand-primary/40"
                        required
                      />
                      <input
                        type="text"
                        name="pincode"
                        placeholder="Postal Code"
                        value={orderData.pincode}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 transition-all duration-200 text-sm placeholder:text-brand-primary/40"
                        required
                      />
                    </div>
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <h3 className="text-lg font-semibold text-brand-primary mb-4">Additional Notes (Optional)</h3>
                    <textarea
                      name="customerNotes"
                      placeholder="Any special instructions or requests for your order"
                      value={orderData.customerNotes}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/10 transition-all duration-200 h-20 text-sm placeholder:text-brand-primary/40"
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
                        <div className="text-sm">I agree to the <button type="button" onClick={() => setShowPolicy(s => !s)} className="text-brand-secondary hover:text-brand-secondary/80 underline font-medium transition-colors duration-200">Return & Refund Policy</button></div>
                        {showPolicy && (
                          <div className="mt-2 text-sm text-brand-primary/80 bg-surface-light p-3 rounded border border-border-light">
                            <h4 className="font-bold text-brand-primary mb-2">Return & Refund Terms & Conditions</h4>
                            <ul className="list-disc list-inside mb-2 space-y-1">
                              <li>All products are customized and made to order. Returns or refunds are not accepted except in specific cases.</li>
                              <li>Returns or replacements are accepted only if the product is completely damaged at delivery or if a wrong item is received.</li>
                              <li>A clear unboxing video is mandatory to claim any return, replacement, or refund.</li>
                              <li>The unboxing video must clearly show the package being opened and the damaged/wrong product.</li>
                              <li>No claim will be accepted without an unboxing video.</li>
                              <li>All claims must be raised within 24 hours of delivery.</li>
                              <li>If the claim is approved, a replacement will be provided first.</li>
                              <li>Refunds will be processed only if a replacement is not possible.</li>
                            </ul>
                            <h4 className="font-bold text-brand-primary mb-2 mt-4">No Return / No Refund Policy</h4>
                            <p className="mb-2">No returns or refunds will be provided in the following cases:</p>
                            <ul className="list-disc list-inside mb-2 space-y-1">
                              <li>Minor defects or slight imperfections</li>
                              <li>Change of mind after placing the order</li>
                              <li>Wrong product ordered by the customer</li>
                              <li>Dissatisfaction with color, size, or design</li>
                              <li>Any reason other than complete damage or wrong item received</li>
                            </ul>
                            <h4 className="font-bold text-brand-primary mb-2 mt-4">Color Disclaimer</h4>
                            <ul className="list-disc list-inside mb-2 space-y-1">
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
                    <h3 className="text-lg font-semibold text-brand-primary mb-4">Payment Method</h3>
                    <div className="space-y-3">
                      <label className="flex items-center gap-3 p-4 border-2 border-brand-secondary rounded-lg cursor-pointer bg-gradient-to-br from-brand-secondary/5 to-brand-secondary/10 hover:from-brand-secondary/10 hover:to-brand-secondary/15 transition-colors duration-200">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value="upi"
                          checked={orderData.paymentMethod === 'upi'}
                          onChange={handleInputChange}
                          className="w-4 h-4 accent-brand-secondary"
                        />
                        <div>
                          <span className="font-semibold text-brand-primary">UPI Payment</span>
                          <p className="text-xs text-brand-primary/60">Fast and secure payment through UPI</p>
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
              <div className="bg-white rounded-xl shadow-md p-6 border border-border-light sticky top-24">
                <h3 className="text-xl font-serif font-bold text-brand-primary mb-6">Order Summary</h3>

                {/* Items */}
                <div className="space-y-4 mb-6 pb-6 border-b border-border-light">
                  {cart.map((item) => (
                    <div key={item.id} className="text-sm">
                      <div className="flex justify-between">
                        <span className="text-brand-primary/70">{item.name} x {item.quantity}</span>
                        <span className="font-semibold text-brand-primary">₹{item.price * item.quantity}</span>
                      </div>
                      {item.addOn && item.addOn.price ? (
                        <div className="text-sm font-semibold text-brand-primary/80 mt-1">({item.addOn.type === 'normal' ? 'Standard Wrapping' : 'Premium Wrapping'}) ₹{item.addOn.price} x {item.quantity} = ₹{item.addOn.price * item.quantity}</div>
                      ) : null}
                      {item.hamperItems && item.hamperItems.length > 0 ? (
                        <div className="mt-2 pl-2 border-l-2 border-brand-secondary/30 space-y-1 text-xs">
                          <p className="font-semibold text-brand-secondary">Added Products:</p>
                          {item.hamperItems.map((hamper, idx) => (
                            <div key={idx} className="flex justify-between text-brand-primary/60">
                              <span>{hamper.link || 'Product'}</span>
                              <span className="font-semibold">₹{hamper.price}</span>
                            </div>
                          ))}
                          {item.hamperItemTotal > 0 && <p className="font-semibold text-brand-secondary/80 pt-1">Total Add-on Price: ₹{item.hamperItemTotal}</p>}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-3 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-primary/70">Subtotal</span>
                    <span className="text-brand-primary">₹{subtotalWithHamper.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-primary/70">Shipping</span>
                    <span className={shipping === 0 ? 'text-brand-secondary font-semibold' : 'text-brand-primary'}>
                      {shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-primary/70">Taxes</span>
                    <span className="text-brand-primary">₹0</span>
                  </div>
                  <div className="flex justify-between border-t border-border-light pt-3 font-bold text-lg">
                    <span className="text-brand-primary">Total</span>
                    <span className="text-brand-secondary">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="bg-amber-50 border border-amber-200 text-amber-800 text-xs p-3 rounded-lg font-medium">
                  Shipping is calculated per item based on price.
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
      <div className="min-h-screen bg-gradient-to-br from-surface-light to-surface-elevated py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Payment Section */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-md p-8 border border-border-light">
                <div className="mb-4"><BackButton /></div>
                <h1 className="text-3xl font-serif font-bold text-brand-primary mb-8">Secure Payment</h1>

                {/* Order ID */}
                <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-8">
                  <p className="text-sm text-brand-primary/70 mb-1">Order Reference</p>
                  <p className="text-xl font-bold font-mono text-brand-secondary">{upiData?.orderId}</p>
                </div>

                {/* Amount */}
                <div className="bg-gradient-to-br from-brand-secondary/5 to-brand-secondary/10 border border-brand-secondary/30 p-6 rounded-xl mb-8">
                  <p className="text-sm text-brand-primary/70 mb-2">Amount to Pay</p>
                  <p className="text-4xl font-serif font-bold text-brand-secondary">₹{upiData?.amount}</p>
                </div>

                {/* Payment Options */}
                <div className="space-y-4 mb-8">
                  <h3 className="text-lg font-semibold text-brand-primary">Payment Methods</h3>

                  {/* Loading State */}
                  {!upiData?.upiLink && (
                    <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-lg flex items-center gap-3">
                      <Loader className="w-5 h-5 animate-spin" />
                      <span className="font-medium">Generating payment link...</span>
                    </div>
                  )}

                  {/* Mobile Payment Button */}
                  {typeof window !== 'undefined' && window.innerWidth <= 768 && upiData?.upiLink && (
                    <>
                      {(() => {
                        const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                        return !isiOS ? (
                          <button
                            type="button"
                            onClick={() => {
                              try {
                                const link = upiData.upiLink;
                                if (/^upi:/i.test(link)) {
                                  window.open(link, '_self');
                                } else {
                                  window.open(link, '_blank', 'noopener');
                                }
                              } catch (err) { 
                                console.error('Failed to open UPI link', err); 
                                try { window.location.href = upiData.upiLink; } catch (e) {}
                              }
                            }}
                            className="block w-full border border-blue-600 text-blue-600 bg-white py-3 rounded-xl font-semibold text-lg text-center transition-all duration-200 hover:bg-blue-50"
                          >
                            Pay via UPI
                          </button>
                        ) : (
                          <div className="text-center text-sm text-yellow-700 bg-yellow-50 border border-yellow-200 p-3 rounded-lg">
                            <p className="font-semibold mb-2">⚠️ iPhone UPI Payment</p>
                            <p className="mb-3">Scan the QR code below with your UPI app or use the link button.</p>
                            <button
                              type="button"
                              onClick={() => {
                                try {
                                  window.open(upiData.upiLink, '_blank');
                                } catch (err) { 
                                  console.error('Failed to open payment link', err);
                                }
                              }}
                              className="block w-full border border-blue-600 text-blue-600 bg-white py-3 rounded-lg font-semibold text-base hover:bg-blue-50 transition-all duration-200"
                            >
                              Open Payment Link
                            </button>
                          </div>
                        );
                      })()}
                    </>
                  )}

                  {/* QR Code - Show on Desktop or iPhone */}
                  {typeof window !== 'undefined' && ((() => {
                    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                    return window.innerWidth > 768 || isiOS;
                  })()) && (
                    <div className="bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200 p-6 rounded-xl">
                      <p className="text-sm font-semibold text-gray-600 mb-4">UPI Payment</p>
                      <div className="flex justify-center">
                        <div className="w-72 h-72 border-2 border-gray-300 rounded-lg p-2 bg-white flex items-center justify-center overflow-hidden">
                          <img loading="lazy" src="/images/Payment-qr.png" alt="UPI QR" className="w-full h-full object-cover" />
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 text-center mt-4">Scan the QR code with your UPI app to complete payment.</p>
                    </div>
                  )}

                  {/* Manual Payment Link for Desktop - Only show on non-iOS desktop */}
                  {typeof window !== 'undefined' && window.innerWidth > 768 && upiData?.upiLink && ((() => {
                    const isiOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
                    return !isiOS;
                  })()) && (
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
                <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded mb-8">
                  <h4 className="font-bold text-amber-900 mb-3">Payment Instructions</h4>
                  <ol className="text-sm text-amber-900 space-y-2 list-decimal list-inside">
                    <li>Open your UPI app and scan the QR code above</li>
                    <li>Verify the transaction amount: ₹{upiData?.amount}</li>
                    <li>Complete the payment and note your transaction reference</li>
                    <li>Click the confirmation button below once payment is complete</li>
                    <li>We will verify and confirm your payment shortly</li>
                  </ol>
                </div>

                {/* Confirmation Button */}
                <button
                  onClick={handlePaymentConfirmed}
                  className="w-full bg-brand-secondary hover:bg-brand-secondary/90 text-white py-4 rounded-xl font-bold text-lg transition-colors duration-200"
                >
                  Confirm Payment
                </button>

                <p className="text-xs text-brand-primary/60 text-center mt-4 font-medium">
                  We will contact you to verify your payment
                </p>
              </div>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-md p-6 border border-border-light sticky top-24">
                <h3 className="text-xl font-serif font-bold text-brand-primary mb-6">Order Summary</h3>

                {/* Items */}
                <div className="space-y-3 mb-6 pb-6 border-b border-border-light">
                  {cart.map((item) => (
                    <div key={item.id || item._id} className="text-sm">
                      <div className="flex justify-between mb-1">
                        <span className="font-semibold text-brand-primary">{item.name}</span>
                        <span className="font-bold text-brand-primary">₹{item.price * item.quantity}</span>
                      </div>
                      <span className="text-xs text-brand-primary/60">Quantity: {item.quantity}</span>
                      {item.addOn && item.addOn.price ? (
                        <div className="text-xs text-brand-primary/60 mt-1">Add-on ({item.addOn.type === 'normal' ? 'Standard' : 'Premium'}) ₹{item.addOn.price} x {item.quantity} = ₹{item.addOn.price * item.quantity}</div>
                      ) : null}
                      {item.hamperItems && item.hamperItems.length > 0 ? (
                        <div className="mt-2 pl-2 border-l-2 border-brand-secondary/30 space-y-1 text-xs">
                          <p className="font-semibold text-brand-secondary">Added Products:</p>
                          {item.hamperItems.map((hamper, idx) => (
                            <div key={idx} className="flex justify-between text-brand-primary/60">
                              <span>{hamper.link || 'Product'}</span>
                              <span className="font-semibold">₹{hamper.price}</span>
                            </div>
                          ))}
                          {item.hamperItemTotal > 0 && <p className="font-semibold text-brand-secondary/80 pt-1">Total Add-on: ₹{item.hamperItemTotal}</p>}
                        </div>
                      ) : null}
                    </div>
                  ))}
                </div>

                {/* Pricing */}
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-primary/70">Subtotal</span>
                    <span className="text-brand-primary">₹{subtotalWithHamper.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-primary/70">Shipping</span>
                    <span className={shipping === 0 ? 'text-brand-secondary font-semibold' : 'text-brand-primary'}>{shipping === 0 ? 'FREE' : `₹${shipping.toLocaleString('en-IN')}`}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-brand-primary/70">Taxes</span>
                    <span className="text-brand-primary">₹0</span>
                  </div>
                  <div className="flex justify-between border-t border-border-light pt-2 font-bold text-lg">
                    <span className="text-brand-primary">Total</span>
                    <span className="text-brand-secondary">₹{total.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="bg-gradient-to-br from-brand-secondary/5 to-brand-secondary/10 border border-brand-secondary/30 p-3 rounded-lg">
                  <p className="text-xs font-semibold text-brand-primary mb-2">Delivery Address</p>
                  <p className="text-xs text-brand-primary/80">{orderData.customerName}</p>
                  <p className="text-xs text-brand-primary/80">{orderData.address}</p>
                  <p className="text-xs text-brand-primary/80">{orderData.city}, {orderData.state} {orderData.pincode}</p>
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
      <div className="min-h-screen bg-gradient-to-br from-surface-light to-surface-elevated flex flex-col items-center justify-center px-4 py-8">
        <div className="max-w-2xl w-full bg-white rounded-xl shadow-lg p-8 border border-border-light">
          <div className="text-center mb-8">
            <CheckCircle className="w-16 h-16 text-brand-secondary mx-auto mb-4 animate-pulse" />
            <h1 className="text-3xl font-serif font-bold text-brand-primary mb-2">Payment Submitted</h1>
            <p className="text-brand-primary/70 font-medium">Your payment is awaiting verification</p>
          </div>

          {/* Order ID */}
          <div className="bg-surface-elevated border border-border-light p-6 rounded-lg mb-8">
            <p className="text-xs text-brand-primary/70 mb-3 font-medium uppercase tracking-wide">Order Reference</p>
            <div className="flex items-center gap-2">
              <code className="text-lg font-mono font-bold text-brand-secondary">
                {upiData?.orderId}
              </code>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(upiData?.orderId);
                  alert('Order ID copied to clipboard');
                }}
                className="text-brand-primary/60 hover:text-brand-secondary transition-colors duration-200"
                title="Copy Order ID"
              >
                <Copy className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="bg-amber-50 border-2 border-amber-200 p-6 rounded-lg mb-8">
            <h3 className="text-lg font-bold text-amber-900 mb-2">Payment Verification Pending</h3>
            <p className="text-amber-900/80 mb-4 text-sm leading-relaxed">
              Your payment has been received and is awaiting verification. We will confirm your payment within 1-2 hours and contact you via WhatsApp with order confirmation details.
            </p>
            <div className="bg-white p-4 rounded border border-amber-200">
              <p className="text-xs text-brand-primary/70 mb-2 font-medium">Paid Amount</p>
              <p className="text-2xl font-bold text-brand-secondary">₹{upiData?.amount}</p>
            </div>
          </div>

          {/* Order Details */}
          <div className="mb-8">
            <h3 className="text-lg font-bold text-brand-primary mb-4">Delivery Address</h3>
            <div className="space-y-3 text-sm">
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-brand-secondary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-brand-primary">{orderData.customerName}</p>
                  <p className="text-brand-primary/70">{orderData.address}</p>
                  <p className="text-brand-primary/70">{orderData.city}, {orderData.state} {orderData.pincode}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Phone className="w-5 h-5 text-brand-secondary" />
                <p className="text-brand-primary/70 text-sm">{orderData.phoneNumber}</p>
              </div>
              <div className="flex gap-3">
                <Mail className="w-5 h-5 text-brand-secondary" />
                <p className="text-brand-primary/70 text-sm">{orderData.email}</p>
              </div>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-brand-secondary/5 border border-brand-secondary/30 p-4 rounded-lg mb-8">
            <p className="text-sm font-bold text-brand-primary mb-3">Next Steps</p>
            <ul className="text-sm text-brand-primary/80 space-y-2">
              <li className="flex gap-2">
                <span className="text-brand-secondary font-bold">1.</span>
                <span>Admin verifies payment (1-2 hours)</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-secondary font-bold">2.</span>
                <span>Admin contacts you via WhatsApp</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-secondary font-bold">3.</span>
                <span>Share product photos on WhatsApp</span>
              </li>
              <li className="flex gap-2">
                <span className="text-brand-secondary font-bold">4.</span>
                <span>Customization & shipping begins</span>
              </li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
            <a
              href={`https://wa.me/918985993948?text=${encodeURIComponent(`Hi, I have placed order ${upiData?.orderId}. My payment of ₹${upiData?.amount} is pending confirmation. Order ID: ${upiData?.orderId}`)}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center bg-brand-secondary hover:bg-brand-secondary/90 text-white py-3 rounded-lg font-bold transition-colors duration-200"
            >
              Contact Admin
            </a>

            <a
              href={`https://wa.me/918985993948?text=${encodeURIComponent(`Hi, I placed order ${upiData?.orderId}. I want to send product photos for customization. Order ID: ${upiData?.orderId}`)}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center bg-[#25D366] hover:bg-[#20ba5c] text-white py-3 rounded-lg font-bold transition-colors duration-200"
            >
              Message on WhatsApp
            </a>

            <button
              onClick={() => navigate('/')}
              className="md:col-span-2 bg-brand-primary hover:bg-brand-primary/90 text-white py-3 rounded-lg font-bold transition-colors duration-200"
            >
              Continue Shopping
            </button>
          </div>

          <p className="text-xs text-brand-primary/60 text-center font-medium">
            Save your order ID for future reference and support inquiries
          </p>

          {/* Related Products Section */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-12">
              <h3 className="text-xl font-serif font-bold mb-4 text-brand-primary">Related Products</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedProducts.map(p => (
                  <a
                    href={`/product/${p._id || p.id}`}
                    key={p._id || p.id}
                    className="block group"
                  >
                    <div className="rounded-lg overflow-hidden aspect-[4/5] bg-surface-light shadow-sm hover:shadow-md transition-shadow duration-200">
                      <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                    <h4 className="font-serif font-bold text-brand-primary text-sm mt-3 truncate">{p.name}</h4>
                    <p className="text-brand-secondary font-bold text-sm">₹{p.price}</p>
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
