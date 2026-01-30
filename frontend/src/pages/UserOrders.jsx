import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, ChevronUp, Package, AlertCircle, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
// 1. Import your dynamic API configuration
import { API_BASE_URL } from '../services/api'; 

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
      
      // 2. Use the dynamic API_BASE_URL instead of http://localhost:5000
      const res = await fetch(`${API_BASE_URL}/orders/user/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await res.json();
      setOrders(Array.isArray(data) ? data : data.orders || []);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load your orders. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      confirmed: 'bg-blue-100 text-blue-800 border-blue-300',
      processing: 'bg-purple-100 text-purple-800 border-purple-300',
      shipped: 'bg-indigo-100 text-indigo-800 border-indigo-300',
      delivered: 'bg-green-100 text-green-800 border-green-300',
      cancelled: 'bg-red-100 text-red-800 border-red-300'
    };
    return statusColors[status?.toLowerCase()] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  const getStatusEmoji = (status) => {
    const emojis = {
      pending: '⏳',
      confirmed: '✅',
      processing: '📦',
      shipped: '🚚',
      delivered: '✨',
      cancelled: '❌'
    };
    return emojis[status?.toLowerCase()] || '📋';
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
        <div className="text-center">
          <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">📦 My Orders</h1>
            <p className="text-gray-600 mt-2">Track your purchases and deliveries</p>
          </div>
          <Link to="/profile" className="text-blue-600 hover:text-blue-800 font-semibold">
            ← Back to Profile
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-800">Error</h3>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-lg p-12 text-center">
            <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Orders Yet</h2>
            <p className="text-gray-600 mb-6">You haven't placed any orders yet.</p>
            <Link to="/shop" className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 font-semibold">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow">
                {/* Order Header */}
                <button
                  onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-gray-900">Order #{order._id?.slice(-6) || 'N/A'}</h3>
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getStatusColor(order.status)}`}>
                          {getStatusEmoji(order.status)} {order.status || 'Pending'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right mr-4">
                    <p className="font-bold text-lg text-blue-600">₹{order.totalAmount?.toLocaleString('en-IN')}</p>
                  </div>
                  {expandedOrderId === order._id ? (
                    <ChevronUp className="text-gray-600" />
                  ) : (
                    <ChevronDown className="text-gray-600" />
                  )}
                </button>

                {/* Order Details - Expanded */}
                {expandedOrderId === order._id && (
                  <div className="border-t px-6 py-6 space-y-6 bg-gray-50">
                    {/* Items Section */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">📦 Items Ordered</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-start p-3 bg-white rounded border border-gray-200">
                            <div>
                              <p className="font-medium text-gray-900">{item.name}</p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                              <p className="text-sm text-gray-600">@ ₹{item.price.toLocaleString('en-IN')} each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">💰 Pricing Breakdown</h4>
                      <div className="bg-white rounded border border-gray-200 p-4 space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-medium">₹{(order.subtotal || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Shipping</span>
                          <span className="font-medium">₹{(order.shippingCost || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Taxes</span>
                          <span className="font-medium">₹{(order.tax || 0).toLocaleString('en-IN')}</span>
                        </div>
                        <div className="border-t pt-2 flex justify-between font-bold text-lg">
                          <span>Total</span>
                          <span className="text-blue-600">₹{order.totalAmount?.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-3">🏠 Delivery Address</h4>
                      <div className="bg-white rounded border border-gray-200 p-4">
                        <p className="font-medium text-gray-900 mb-1">{order.shippingAddress?.name || user?.name}</p>
                        <p className="text-gray-600 text-sm mb-1">
                          {order.shippingAddress?.street || user?.address}
                        </p>
                        <p className="text-gray-600 text-sm mb-1">
                          {order.shippingAddress?.city || user?.city}, {order.shippingAddress?.state || user?.state} {order.shippingAddress?.pincode || user?.pincode}
                        </p>
                        <p className="text-gray-600 text-sm mt-2">
                          📞 {order.shippingAddress?.phone || user?.phoneNumber}
                        </p>
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
