import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, ChevronDown, Save, Eye, Phone, MapPin, Mail, Package, Download } from 'lucide-react';
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

  const generateInvoice = (order) => {
    // Generate item rows including hamper items if they exist
    let itemsHTML = (order.items || []).map(it => {
      let hamperItems = [];
      let hamperItemTotal = 0;
      
      try {
        if (it.customizationDetails) {
          const parsed = JSON.parse(it.customizationDetails);
          if (Array.isArray(parsed)) {
            hamperItems = parsed;
            hamperItemTotal = parsed.reduce((sum, h) => sum + (Number(h.price) || 0), 0);
          }
        }
      } catch (e) {
        // Not hamper items, just regular customization
      }
      
      let rowHTML = `<tr><td>${it.productName}</td><td>${it.quantity}</td><td>${it.price.toLocaleString('en-IN')}</td><td>${(it.price*it.quantity).toLocaleString('en-IN')}</td></tr>`;
      
      // Add hamper items as sub-rows
      if (hamperItems.length > 0) {
        hamperItems.forEach(h => {
          rowHTML += `<tr style="background:#f9fafb;"><td style="padding-left:20px;">↳ ${h.link || 'Added Product'}</td><td>1</td><td>${h.price.toLocaleString('en-IN')}</td><td>${h.price.toLocaleString('en-IN')}</td></tr>`;
        });
      }
      
      return rowHTML;
    }).join('');

    // compute totals including hamper/added products
    const computedSubtotal = (order.items || []).reduce((acc, item) => {
      let hamperItems = [];
      try {
        if (item.customizationDetails) {
          const parsed = JSON.parse(item.customizationDetails);
          if (Array.isArray(parsed)) hamperItems = parsed;
        }
      } catch (e) {}
      const hamperTotal = (hamperItems || []).reduce((s, h) => s + (Number(h.price) || 0), 0);
      return acc + ((Number(item.price) || 0) * (Number(item.quantity) || 1)) + hamperTotal;
    }, 0);
    const shippingLocal = Number(order.shippingCost) || 0;
    const taxLocal = Number(order.tax) || 0;
    const computedTotal = computedSubtotal + shippingLocal + taxLocal;

    const html = `<!doctype html><html><head><meta charset="utf-8"><title>Invoice ${order.orderId}</title><style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111}h1{color:#0b63a7}h3{margin-top:20px}table{width:100%;border-collapse:collapse;margin-top:16px}th,td{padding:8px;border:1px solid #ddd;text-align:left}tfoot td{font-weight:bold}</style></head><body><h1>Infinity Customizations — Invoice</h1><p>Order ID: <strong>${order.orderId}</strong></p><p>Date: ${new Date(order.createdAt).toLocaleString()}</p><h3>Billing / Shipping</h3><p><strong>${order.customerName}</strong><br/>${order.address}<br/>${order.city}, ${order.state} ${order.pincode}<br/>Phone: ${order.phoneNumber}<br/>Email: ${order.email}</p><h3>Items</h3><table><thead><tr><th>Product</th><th>Qty</th><th>Price (₹)</th><th>Line Total (₹)</th></tr></thead><tbody>${itemsHTML}</tbody><tfoot><tr><td colspan="3">Subtotal</td><td>₹${Number(computedSubtotal).toLocaleString('en-IN')}</td></tr><tr><td colspan="3">Shipping</td><td>₹${Number(shippingLocal).toLocaleString('en-IN')}</td></tr><tr><td colspan="3">Taxes</td><td>₹${Number(taxLocal).toLocaleString('en-IN')}</td></tr><tr><td colspan="3">Total</td><td>₹${Number(computedTotal).toLocaleString('en-IN')}</td></tr></tfoot></table><p style="margin-top:18px;font-size:12px;color:#555">Thank you for your order. For support, contact infinitycustomizations@gmail.com or WhatsApp +91 89859 93948.</p></body></html>`;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `invoice-${order.orderId}.html`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
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
            filteredOrders.map(order => {
              // compute subtotal including any added/hamper items stored in customizationDetails
              const computedSubtotal = (order.items || []).reduce((acc, item) => {
                let hamperItems = [];
                try {
                  if (item.customizationDetails) {
                    const parsed = JSON.parse(item.customizationDetails);
                    if (Array.isArray(parsed)) hamperItems = parsed;
                  }
                } catch (e) {
                  // ignore parse errors
                }
                const hamperTotal = (hamperItems || []).reduce((s, h) => s + (Number(h.price) || 0), 0);
                const lineTotal = (Number(item.price) || 0) * (Number(item.quantity) || 1) + hamperTotal;
                return acc + lineTotal;
              }, 0);
              const shipping = Number(order.shippingCost) || 0;
              const tax = Number(order.tax) || 0;
              const computedTotal = computedSubtotal + shipping + tax;

              return (
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
                      <p className="text-2xl font-bold text-gray-900 mt-2">₹{computedTotal}</p>
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
                      <h4 className="font-bold text-gray-900 mb-3">Package Contents</h4>
                      <div className="space-y-2">
                        {order.items?.map((item, idx) => {
                          let hamperItems = [];
                          let hamperItemTotal = 0;
                          
                          // Try to parse hamper items from customization details
                          try {
                            if (item.customizationDetails) {
                              const parsed = JSON.parse(item.customizationDetails);
                              if (Array.isArray(parsed)) {
                                hamperItems = parsed;
                                hamperItemTotal = parsed.reduce((sum, it) => sum + (Number(it.price) || 0), 0);
                              }
                            }
                          } catch (e) {
                            // Not hamper items, just regular customization
                          }
                          
                          return (
                            <div key={idx} className="bg-gray-50 rounded overflow-hidden">
                              <div className="p-3 flex justify-between items-center">
                                <div className="flex-1">
                                  <p className="font-semibold text-gray-900">{item.productName}</p>
                                  <p className="text-sm text-gray-600">Quantity: {item.quantity}</p>
                                  {item.customizationDetails && !hamperItems.length && (
                                    <p className="text-sm text-blue-600 mt-1">Customization: {item.customizationDetails.substring(0, 50)}...</p>
                                  )}
                                </div>
                                <div className="text-right">
                                  <p className="font-semibold text-gray-900">₹{item.price * item.quantity}</p>
                                  <p className="text-sm text-gray-600">₹{item.price} each</p>
                                </div>
                              </div>
                              
                              {/* Show hamper items if they exist */}
                              {hamperItems.length > 0 && (
                                <div className="bg-blue-50 border-t border-blue-200 p-3">
                                  <p className="text-sm font-semibold text-blue-900 mb-2">Added Products:</p>
                                  <div className="space-y-1">
                                    {hamperItems.map((h, hIdx) => (
                                      <div key={hIdx} className="flex justify-between text-sm">
                                        <span className="text-blue-800">{h.link || `Added Product ${hIdx + 1}`}</span>
                                        <span className="font-semibold text-blue-900">₹{h.price}</span>
                                      </div>
                                    ))}
                                  </div>
                                  <div className="border-t border-blue-200 mt-2 pt-2 flex justify-between font-semibold text-sm text-blue-900">
                                    <span>Total Added Products:</span>
                                    <span>₹{hamperItemTotal}</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h4 className="font-bold text-gray-900">💰 Pricing</h4>
                        <button
                          onClick={() => generateInvoice(order)}
                          className="flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-gray-900 text-sm font-semibold"
                        >
                          <Download size={16} /> Download Invoice
                        </button>
                      </div>
                      <div className="bg-gray-50 p-4 rounded space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Subtotal</span>
                          <span className="font-semibold">₹{computedSubtotal}</span>
                        </div>
                        {shipping > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Shipping</span>
                            <span className="font-semibold">₹{shipping}</span>
                          </div>
                        )}
                        {tax > 0 && (
                          <div className="flex justify-between">
                            <span className="text-gray-600">Tax</span>
                            <span className="font-semibold">₹{tax}</span>
                          </div>
                        )}
                        <div className="border-t pt-2 flex justify-between">
                          <span className="font-bold">Total</span>
                          <span className="font-bold text-lg text-blue-600">₹{computedTotal}</span>
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
            );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
