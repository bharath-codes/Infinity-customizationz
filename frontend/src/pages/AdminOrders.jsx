import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, ChevronDown, Save, Eye, Phone, MapPin, Mail, Package } from 'lucide-react';
import { orders as ordersApi } from '../services/api';

const AdminOrders = () => {
  const { admin, adminToken } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [editStatus, setEditStatus] = useState({});

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    processing: 'bg-purple-100 text-purple-800',
    shipped: 'bg-indigo-100 text-indigo-800',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  };

  const statusSteps = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

  useEffect(() => {
    if (!admin || admin.role !== 'super_admin') return;
    fetchOrders();
  }, [admin, adminToken]);

  useEffect(() => {
    filterOrders();
  }, [orders, filterStatus]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const result = await ordersApi.getAll({}, adminToken);
      // API might return an array or an object with a property like `orders`
      if (Array.isArray(result)) {
        setOrders(result);
      } else if (result && result.orders) {
        setOrders(result.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch orders');
    } finally {
      setLoading(false);
    }
  };

  const filterOrders = () => {
    if (filterStatus === 'all') {
      setFilteredOrders(orders);
    } else {
      setFilteredOrders(orders.filter(o => o.status === filterStatus));
    }
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const result = await ordersApi.updateStatus(orderId, { status: newStatus }, adminToken);

      // result may contain the updated order under `order` or be the order itself
      const updatedOrder = result?.order || result;

      setOrders(orders.map(o => o._id === orderId ? updatedOrder : o));
      setSuccess(`Order marked as ${newStatus}`);
      setEditingOrderId(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update order');
      setTimeout(() => setError(''), 3000);
    }
  };

  if (!admin || admin.role !== 'super_admin') {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center text-red-600">
          <AlertCircle className="mx-auto mb-4" size={48} />
          <p>Unauthorized access</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading orders...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">📦 Order Management</h1>
          <p className="text-gray-600">Manage customer orders and delivery status</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {/* Filter */}
        <div className="mb-6 flex gap-2 flex-wrap">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              filterStatus === 'all'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
            }`}
          >
            All Orders ({orders.length})
          </button>
          {statusSteps.map(status => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:border-blue-500'
              }`}
            >
              {status} ({orders.filter(o => o.status === status).length})
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <div className="bg-white rounded-lg shadow p-12 text-center">
              <Package size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 text-lg">No orders found</p>
            </div>
          ) : (
            filteredOrders.map(order => (
              <div key={order._id} className="bg-white rounded-lg shadow hover:shadow-lg transition">
                {/* Order Header */}
                <div className="p-6 border-b">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex-1">
                      <p className="text-sm text-gray-600">Order ID: {order._id}</p>
                      <h3 className="text-xl font-bold text-gray-900 mt-1">
                        {order.customerName || 'Unknown Customer'}
                      </h3>
                    </div>
                    <div className="text-right">
                      <p className={`inline-block px-3 py-1 rounded-full text-sm font-bold ${statusColors[order.status]}`}>
                        {order.status?.toUpperCase()}
                      </p>
                      <p className="text-2xl font-bold text-gray-900 mt-2">₹{order.totalAmount}</p>
                    </div>
                  </div>

                  {/* Quick Info */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2">
                      <Phone size={18} className="text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">Phone</p>
                        <p className="font-semibold">{order.phoneNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={18} className="text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">Email</p>
                        <p className="font-semibold text-sm">{order.email || 'N/A'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-blue-600" />
                      <div>
                        <p className="text-xs text-gray-600">City</p>
                        <p className="font-semibold">{order.city}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-xs text-gray-600">Order Date</p>
                      <p className="font-semibold">{new Date(order.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Expandable Details */}
                <div
                  onClick={() => setExpandedOrderId(expandedOrderId === order._id ? null : order._id)}
                  className="p-6 bg-gray-50 cursor-pointer hover:bg-gray-100 transition flex justify-between items-center"
                >
                  <span className="font-semibold text-gray-900">
                    {order.items?.length || 0} Items • View Details
                  </span>
                  <ChevronDown
                    size={20}
                    className={`transition ${expandedOrderId === order._id ? 'rotate-180' : ''}`}
                  />
                </div>

                {/* Expanded Content */}
                {expandedOrderId === order._id && (
                  <div className="p-6 border-t space-y-6">
                    {/* Customer Details */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">👤 Customer Information</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-4 rounded">
                        <div>
                          <p className="text-sm text-gray-600">Name</p>
                          <p className="font-semibold text-gray-900">{order.customerName}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Phone</p>
                          <p className="font-semibold text-gray-900">{order.phoneNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Email</p>
                          <p className="font-semibold text-gray-900">{order.email || 'Not provided'}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment Method</p>
                          <p className="font-semibold text-gray-900 capitalize">{order.paymentMethod}</p>
                        </div>
                      </div>
                    </div>

                    {/* Shipping Address */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">🏠 Shipping Address</h4>
                      <div className="bg-gray-50 p-4 rounded">
                        <p className="font-semibold text-gray-900 mb-2">{order.address}</p>
                        <div className="grid grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600">City</p>
                            <p className="font-semibold">{order.city}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">State</p>
                            <p className="font-semibold">{order.state}</p>
                          </div>
                          <div>
                            <p className="text-gray-600">Pincode</p>
                            <p className="font-semibold">{order.pincode}</p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">📦 Ordered Items</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center p-3 bg-gray-50 rounded">
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{item.productName}</p>
                              <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                              <p className="text-sm text-gray-600">₹{item.price} each</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">💰 Pricing</h4>
                      <div className="bg-gray-50 p-4 rounded space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-semibold">₹{order.subtotal}</span>
                        </div>
                        {order.shippingCost > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-semibold">₹{order.shippingCost}</span>
                          </div>
                        )}
                        {order.tax > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span className="font-semibold">₹{order.tax}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-bold">Total</span>
                          <span className="font-bold text-lg text-blue-600">₹{order.totalAmount}</span>
                        </div>
                      </div>
                    </div>

                    {/* Status Update */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">📊 Update Status</h4>
                      {editingOrderId === order._id ? (
                        <div className="flex gap-2">
                          <select
                            value={editStatus[order._id] || order.status}
                            onChange={(e) => setEditStatus({ ...editStatus, [order._id]: e.target.value })}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            {statusSteps.map(s => (
                              <option key={s} value={s}>
                                {s.charAt(0).toUpperCase() + s.slice(1)}
                              </option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleStatusChange(order._id, editStatus[order._id] || order.status)}
                            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                          >
                            <Save size={18} /> Save
                          </button>
                          <button
                            onClick={() => setEditingOrderId(null)}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setEditingOrderId(order._id);
                            setEditStatus({ [order._id]: order.status });
                          }}
                          className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold"
                        >
                          Update Status
                        </button>
                      )}
                    </div>

                    {/* Admin Notes */}
                    <div>
                      <h4 className="font-bold text-gray-900 mb-3">📝 Admin Notes</h4>
                      <textarea
                        defaultValue={order.adminNotes || ''}
                        placeholder="Add internal notes..."
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="3"
                      />
                    </div>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
