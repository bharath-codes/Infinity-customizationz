import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Package, ShoppingCart, TrendingUp, ChevronRight, AlertCircle, Settings, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AdminDashboard = () => {
  const { admin, logoutAdmin } = useAuth();
  const [stats, setStats] = useState({
    totalOrders: 0,
    todayOrders: 0,
    pendingOrders: 0,
    deliveredOrders: 0,
    totalCategories: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (admin) {
      fetchStats();
    }
  }, [admin]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Fetch orders
      const ordersRes = await fetch('http://localhost:5000/api/orders/admin/orders', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const orders = ordersRes.ok ? await ordersRes.json() : [];

      // Fetch categories
      const categoriesRes = await fetch('http://localhost:5000/api/categories');
      const categories = categoriesRes.ok ? await categoriesRes.json() : [];

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const todayOrders = orders.filter(order => {
        const orderDate = new Date(order.createdAt);
        orderDate.setHours(0, 0, 0, 0);
        return orderDate.getTime() === today.getTime();
      }).length;

      const pendingOrders = orders.filter(order => 
        ['pending', 'confirmed', 'processing'].includes(order.status?.toLowerCase())
      ).length;

      const deliveredOrders = orders.filter(order => 
        order.status?.toLowerCase() === 'delivered'
      ).length;

      setStats({
        totalOrders: orders.length,
        todayOrders: todayOrders,
        pendingOrders: pendingOrders,
        deliveredOrders: deliveredOrders,
        totalCategories: categories.length
      });
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
  };

  const dashboardCards = [
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: <ShoppingCart className="w-8 h-8" />,
      bgGradient: 'from-blue-500 to-blue-600',
      textColor: 'text-blue-600',
      link: '/admin/orders',
      emoji: '📦'
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: <TrendingUp className="w-8 h-8" />,
      bgGradient: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      link: '/admin/orders',
      emoji: '📈'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <Package className="w-8 h-8" />,
      bgGradient: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
      link: '/admin/orders',
      emoji: '⏳'
    },
    {
      title: 'Delivered Orders',
      value: stats.deliveredOrders,
      icon: <ShoppingCart className="w-8 h-8" />,
      bgGradient: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      link: '/admin/orders',
      emoji: '✅'
    }
  ];

  const menuItems = [
    { label: 'Orders', icon: <ShoppingCart size={24} />, link: '/admin/orders', desc: 'Manage orders & delivery', emoji: '📦' },
    { label: 'Products', icon: <Package size={24} />, link: '/admin/products', desc: 'Add & manage products', emoji: '🛍️' },
    { label: 'Categories', icon: <BarChart3 size={24} />, link: '/admin/categories', desc: 'Manage categories & showcase', emoji: '📂' },
    { label: 'Settings', icon: <Settings size={24} />, link: '/admin/settings', desc: 'Admin settings', emoji: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-100 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🎯 Admin Dashboard
            </h1>
            <p className="text-gray-600 text-sm mt-1">Welcome, <span className="font-semibold">{admin?.email}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-5 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-xl transition-all duration-300 hover:shadow-md"
          >
            <LogOut size={20} />
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
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

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {loading ? (
            [1, 2, 3, 4].map((index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-24 mb-4"></div>
                <div className="h-10 bg-gray-200 rounded w-16"></div>
              </div>
            ))
          ) : (
            dashboardCards.map((card, index) => (
              <Link key={index} to={card.link}>
                <div className="group relative bg-white rounded-xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden">
                  {/* Gradient Background */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.bgGradient} opacity-10 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500`}></div>
                  
                  {/* Content */}
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-gray-600 font-medium text-sm">{card.title}</p>
                        <h3 className={`text-4xl font-bold mt-2 ${card.textColor}`}>{card.value}</h3>
                      </div>
                      <span className="text-3xl">{card.emoji}</span>
                    </div>
                    <div className="flex items-center text-xs text-gray-500 group-hover:text-blue-600 transition-colors">
                      View details <ChevronRight size={14} className="ml-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))
          )}
        </div>

        {/* Main Menu */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
          {/* Quick Actions */}
          <div className="bg-white rounded-xl shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">⚡ Quick Actions</h2>
            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.link}
                  className="group flex items-center gap-4 p-4 rounded-lg hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 border border-gray-100 hover:border-blue-200"
                >
                  <div className="text-2xl">{item.emoji}</div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">{item.label}</h3>
                    <p className="text-xs text-gray-500">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </div>

          {/* Dashboard Info */}
          <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl shadow-md p-8 text-white">
            <h2 className="text-2xl font-bold mb-6">📊 System Overview</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/20">
                <span className="text-white/80">Total Orders</span>
                <span className="text-2xl font-bold">{stats.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/20">
                <span className="text-white/80">Categories</span>
                <span className="text-2xl font-bold">{stats.totalCategories}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/20">
                <span className="text-white/80">Pending Orders</span>
                <span className="text-2xl font-bold text-orange-300">{stats.pendingOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/80">Delivered Orders</span>
                <span className="text-2xl font-bold text-green-300">{stats.deliveredOrders}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="bg-white rounded-xl shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">✨ Key Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <span className="text-2xl">📦</span>
              <div>
                <h3 className="font-semibold text-gray-900">Complete Order Management</h3>
                <p className="text-sm text-gray-600 mt-1">View orders with full customer details, addresses, and manage delivery status</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl">⭐</span>
              <div>
                <h3 className="font-semibold text-gray-900">Showcase Management</h3>
                <p className="text-sm text-gray-600 mt-1">Select which products appear on home page for each category</p>
              </div>
            </div>
            <div className="flex gap-4">
              <span className="text-2xl">🖼️</span>
              <div>
                <h3 className="font-semibold text-gray-900">Image Selection</h3>
                <p className="text-sm text-gray-600 mt-1">Choose which product images to showcase in slideshows</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
