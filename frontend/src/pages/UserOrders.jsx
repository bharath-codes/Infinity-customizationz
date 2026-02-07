import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Package, AlertCircle, Loader } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useAuth } from '../contexts/AuthContext';
import { API_BASE_URL, orders as ordersApi } from '../services/api';

const UserOrders = () => {
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading: authLoading } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  useEffect(() => {
    if (user && token) {
      fetchUserOrders();
    }
  }, [user, token]);

  const fetchUserOrders = async () => {
    try {
      setLoading(true);
      setError('');

      // Use centralized Orders API (auth token required)
      const result = await ordersApi.getMyOrders(token);

      // Normalize response which might be an array or an object with `orders`
      if (Array.isArray(result)) {
        setOrders(result);
      } else if (result && result.orders) {
        setOrders(result.orders);
      } else if (result && result.data && Array.isArray(result.data.orders)) {
        setOrders(result.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error('Error fetching user orders:', err);
      // Show backend-friendly message if available
      const msg = err?.message || (err?.data && err.data.message) || 'Failed to load your orders. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
      confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
      processing: 'bg-purple-50 text-purple-700 border-purple-200',
      shipped: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      delivered: 'bg-green-50 text-green-700 border-green-200',
      cancelled: 'bg-red-50 text-red-700 border-red-200'
    };
    return statusColors[status?.toLowerCase()] || 'bg-gray-50 text-gray-700 border-gray-200';
  };

  const getStatusLabel = (status) => {
    const labels = {
      pending: 'Pending',
      confirmed: 'Confirmed',
      processing: 'Processing',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    };
    return labels[status?.toLowerCase()] || status || 'Pending';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-surface-light to-surface-elevated">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-brand-secondary mx-auto mb-4" />
          <p className="text-brand-primary/70">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-light to-surface-elevated py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="mb-2"><BackButton to="/profile" /></div>
            <h1 className="text-4xl font-serif font-bold text-brand-primary">Order History</h1>
            <p className="text-brand-primary/70 mt-2 font-light">Track and manage your orders</p>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Unable to Load Orders</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-border-light">
            <Package className="w-16 h-16 text-brand-primary/20 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-brand-primary mb-2">No Orders Found</h2>
            <p className="text-brand-primary/70 mb-6 font-light">You haven't placed any orders yet. Start shopping to see your orders here.</p>
            <Link to="/" className="inline-block bg-brand-secondary text-white px-8 py-3 rounded-lg hover:bg-brand-secondary/90 font-semibold transition-colors duration-200">
              Continue Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-xl shadow hover:shadow-lg transition-all duration-200 border border-border-light overflow-hidden">
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-surface-elevated transition-colors duration-200"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-brand-primary">Order #{order._id?.slice(-6) || 'N/A'}</h3>
                        <span className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                          {getStatusLabel(order.status)}
                        </span>
                      </div>
                      <p className="text-sm text-brand-primary/70 font-light">
                        Ordered on {new Date(order.createdAt).toLocaleString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-lg text-brand-secondary">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                  </div>
                  {expandedOrderId === order._id ? (
                    <ChevronUp className="text-brand-primary/60" />
                  ) : (
                    <ChevronDown className="text-brand-primary/60" />
                  )}
                </button>

                {/* Order Details - Expanded */}
                {expandedOrderId === order._id && (
                  <div className="border-t border-border-light px-6 py-6 space-y-6 bg-surface-elevated">
                    {/* Items Section */}
                    <div>
                      <h4 className="font-semibold text-brand-primary mb-3">Order Items</h4>
                      <div className="space-y-3">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start p-3 bg-white rounded-lg border border-border-light hover:shadow-sm transition-shadow">
                            <div>
                              <p className="font-medium text-brand-primary">{item.name}</p>
                              <p className="text-sm text-brand-primary/70">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-brand-primary">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                              <p className="text-sm text-brand-primary/70">₹{item.price.toLocaleString('en-IN')} each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div>
                      <h4 className="font-semibold text-brand-primary mb-3">Price Breakdown</h4>
                      <div className="bg-white rounded-lg border border-border-light p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                          <span className="text-brand-primary/70">Subtotal</span>
                          <span className="font-medium text-brand-primary">₹{(order.subtotal || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-brand-primary/70">Shipping Charges</span>
                          <span className="font-medium text-brand-primary">₹{(order.shippingCost || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-brand-primary/70">Taxes & Fees</span>
                          <span className="font-medium text-brand-primary">₹{(order.tax || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="border-t border-border-light pt-3 flex justify-between font-semibold text-base">
                          <span className="text-brand-primary">Total Amount</span>
                          <span className="text-brand-secondary">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-semibold text-brand-primary mb-3">Delivery Address</h4>
                      <div className="bg-white rounded-lg border border-border-light p-4">
                        <p className="font-medium text-brand-primary mb-1">{order.shippingAddress?.name || user?.name}</p>
                        <p className="text-brand-primary/70 text-sm mb-1">
                          {order.shippingAddress?.street || user?.address}
                        </p>
                        <p className="text-brand-primary/70 text-sm mb-3">
                          {order.shippingAddress?.city || user?.city}, {order.shippingAddress?.state || user?.state} {order.shippingAddress?.pincode || user?.pincode}
                        </p>
                        <div className="flex items-center gap-2 text-sm text-brand-primary/70">
                          <Phone size={16} className="text-brand-secondary" />
                          <span>{order.shippingAddress?.phone || user?.phoneNumber}</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Method */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">💳 Payment Method</h4>
                      <div className="bg-white rounded border border-gray-200 p-4">
                        <p className="text-gray-900">{order.paymentMethod || 'Card Payment'}</p>
                      </div>
                    </div>

                    {/* Status Timeline */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">📅 Status Timeline</h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">Order Placed</p>
                            <p className="text-xs text-gray-600">{new Date(order.createdAt).toLocaleString('en-IN')}</p>
                          </div>
                        </div>
                        {order.status && ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status.toLowerCase()) && (
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Order Confirmed</p>
                              <p className="text-xs text-gray-600">{new Date(order.confirmedAt || order.createdAt).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        )}
                        {order.status && ['processing', 'shipped', 'delivered'].includes(order.status.toLowerCase()) && (
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Processing</p>
                              <p className="text-xs text-gray-600">Your order is being prepared</p>
                            </div>
                          </div>
                        )}
                        {order.status && ['shipped', 'delivered'].includes(order.status.toLowerCase()) && (
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Shipped</p>
                              <p className="text-xs text-gray-600">On its way to you</p>
                            </div>
                          </div>
                        )}
                        {order.status && order.status.toLowerCase() === 'delivered' && (
                          <div className="flex items-center gap-3">
                            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                            <div>
                              <p className="text-sm font-medium text-gray-900">Delivered</p>
                              <p className="text-xs text-gray-600">{new Date(order.updatedAt).toLocaleString('en-IN')}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-4">
                      <button onClick={fetchUserOrders} className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 font-semibold">
                        Refresh Status
                      </button>
                      <Link to="/shop" className="flex-1 bg-gray-200 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-300 font-semibold text-center">
                        Continue Shopping
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserOrders;
