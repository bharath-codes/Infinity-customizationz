import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { LogOut, Package, ShoppingCart, TrendingUp, ChevronRight, AlertCircle, Settings, BarChart3 } from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useAuth } from '../contexts/AuthContext';
// 1. Import the dynamic API URL from your service file
import { API_BASE_URL } from '../services/api'; 

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
  const { adminToken } = useAuth();

  // Homepage controls state
  const [allProducts, setAllProducts] = useState([]);
  const [heroImages, setHeroImages] = useState([null, null, null]);
  const [heroUploading, setHeroUploading] = useState(false);
  const [hpSaving, setHpSaving] = useState(false);

  useEffect(() => {
    if (admin) {
      fetchStats();
    }
  }, [admin]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError('');
      
      // 2. Use template literals with API_BASE_URL instead of 'http://localhost:5000'
      const ordersRes = await fetch(`${API_BASE_URL}/orders/admin/orders`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('adminToken')}` }
      });
      const orders = ordersRes.ok ? await ordersRes.json() : [];

      // 3. Use API_BASE_URL here as well
      const categoriesRes = await fetch(`${API_BASE_URL}/categories`);
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

  useEffect(() => {
    // load products list for best-seller management
    const loadAll = async () => {
      try {
        const prods = await api.products.getAll();
        setAllProducts(Array.isArray(prods) ? prods : []);
      } catch (err) {
        console.error('Failed to load products for admin dashboard:', err);
      }
    };
    loadAll();
  }, []);

  const toggleBestSeller = async (product) => {
    if (!adminToken) return alert('Not authenticated');
    try {
      const updated = { ...product, isBestSeller: !product.isBestSeller };
      await api.products.update(product._id || product.id, updated, adminToken);
      setAllProducts(prev => prev.map(p => p._id === product._id ? { ...p, isBestSeller: !p.isBestSeller } : p));
      setSuccess('Updated best seller status');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      console.error('Error toggling best seller:', err);
      setError(err.message || 'Failed to update');
      setTimeout(() => setError(''), 3000);
    }
  };

  // Hero images loader/saver (uses category id 'hero')
  useEffect(() => {
    const loadHero = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/categories/hero/showcase-images`);
        if (res.ok) {
          const data = await res.json();
          if (data.images) setHeroImages(data.images.concat([]).slice(0,3));
        }
      } catch (err) {
        // ignore
      }
    };
    loadHero();
  }, []);

  const convertFileToBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });

  const handleHeroChange = async (index, file) => {
    if (!file) return;
    try {
      setHeroUploading(true);
      const base64 = await convertFileToBase64(file);
      const arr = [...heroImages]; arr[index] = base64; setHeroImages(arr);
    } catch (err) {
      console.error('Hero image read failed', err);
      setError('Failed to read image');
      setTimeout(() => setError(''), 3000);
    } finally { setHeroUploading(false); }
  };

  const saveHeroImages = async () => {
    if (!adminToken) return alert('Not authenticated');
    try {
      setHpSaving(true);
      await api.categories.updateShowcaseImages('hero', heroImages, adminToken);
      setSuccess('Hero images updated');
      setTimeout(() => setSuccess(''), 2500);
    } catch (err) {
      console.error('Error saving hero images', err);
      setError(err.message || 'Failed to save');
      setTimeout(() => setError(''), 3000);
    } finally { setHpSaving(false); }
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
      link: '/admin/orders'
    },
    {
      title: "Today's Orders",
      value: stats.todayOrders,
      icon: <TrendingUp className="w-8 h-8" />,
      bgGradient: 'from-green-500 to-green-600',
      textColor: 'text-green-600',
      link: '/admin/orders'
    },
    {
      title: 'Pending Orders',
      value: stats.pendingOrders,
      icon: <Package className="w-8 h-8" />,
      bgGradient: 'from-orange-500 to-orange-600',
      textColor: 'text-orange-600',
      link: '/admin/orders'
    },
    {
      title: 'Delivered Orders',
      value: stats.deliveredOrders,
      icon: <ShoppingCart className="w-8 h-8" />,
      bgGradient: 'from-purple-500 to-purple-600',
      textColor: 'text-purple-600',
      link: '/admin/orders'
    }
  ];

  const menuItems = [
    { label: 'Orders', icon: <ShoppingCart size={24} />, link: '/admin/orders', desc: 'Manage orders & delivery' },
    { label: 'Products', icon: <Package size={24} />, link: '/admin/products', desc: 'Add & manage products' },
    { label: 'Categories', icon: <BarChart3 size={24} />, link: '/admin/categories', desc: 'Manage categories & showcase' },
    { label: 'Phone Models', icon: <Settings size={24} />, link: '/admin/phone-models', desc: 'Manage phone companies & models' },
    { label: 'Settings', icon: <Settings size={24} />, link: '/admin/settings', desc: 'Admin settings' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-border-light shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-serif font-bold text-brand-primary">
              Administration Panel
            </h1>
            <p className="text-brand-primary/70 text-sm mt-1 font-light">Logged in as <span className="font-semibold text-brand-primary">{admin?.email}</span></p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-semibold rounded-lg transition-all duration-200 hover:shadow-md"
          >
            <LogOut size={20} />
            Sign Out
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
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-border-light animate-pulse">
                <div className="h-4 bg-border-light rounded w-24 mb-4"></div>
                <div className="h-10 bg-border-light rounded w-16"></div>
              </div>
            ))
          ) : (
            dashboardCards.map((card, index) => (
              <Link key={index} to={card.link}>
                <div className="group relative bg-white rounded-xl shadow-md hover:shadow-xl border border-border-light transition-all duration-300 overflow-hidden">
                  {/* Gradient Background */}
                  <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${card.bgGradient} opacity-5 rounded-full transform translate-x-8 -translate-y-8 group-hover:scale-150 transition-transform duration-500`}></div>
                  
                  {/* Content */}
                  <div className="relative p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-brand-primary/70 font-medium text-sm uppercase tracking-wide">{card.title}</p>
                        <h3 className={`text-4xl font-bold mt-2 ${card.textColor}`}>{card.value}</h3>
                      </div>
                    </div>
                    <div className="flex items-center text-xs text-brand-primary/70 group-hover:text-brand-secondary transition-colors duration-200">
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
          <div className="bg-white rounded-xl shadow-md p-8 border border-border-light">
            <h2 className="text-2xl font-semibold text-brand-primary mb-6">Quick Navigation</h2>
            <div className="space-y-3">
              {menuItems.map((item, index) => (
                <Link
                  key={index}
                  to={item.link}
                  className="group flex items-center gap-4 p-4 rounded-lg hover:bg-surface-elevated transition-all duration-200 border border-border-light hover:border-brand-secondary"
                >
                  <div className="p-2.5 rounded-lg bg-surface-elevated group-hover:bg-brand-secondary/10 transition-colors duration-200">
                    {item.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-brand-primary group-hover:text-brand-secondary transition-colors duration-200">{item.label}</h3>
                    <p className="text-xs text-brand-primary/60 font-light">{item.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-brand-primary/30 group-hover:text-brand-secondary group-hover:translate-x-1 transition-all duration-200" />
                </Link>
              ))}
            </div>
          </div>

          {/* Dashboard Info */}
          <div className="bg-gradient-to-br from-brand-secondary to-brand-secondary/80 rounded-xl shadow-md p-8 text-white border border-brand-secondary/30">
            <h2 className="text-2xl font-semibold mb-6">Dashboard Summary</h2>
            <div className="space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-white/20">
                <span className="text-white/90 font-light">Total Orders</span>
                <span className="text-2xl font-bold">{stats.totalOrders}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/20">
                <span className="text-white/90 font-light">Product Categories</span>
                <span className="text-2xl font-bold">{stats.totalCategories}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-white/20">
                <span className="text-white/90 font-light">Pending Orders</span>
                <span className="text-2xl font-bold text-amber-300">{stats.pendingOrders}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-white/90 font-light">Delivered Orders</span>
                <span className="text-2xl font-bold text-green-300">{stats.deliveredOrders}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Highlight */}
        <div className="bg-white rounded-xl shadow-md p-8 border border-border-light">
          <h2 className="text-2xl font-semibold text-brand-primary mb-6">Platform Capabilities</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex gap-4">
              <div className="p-2.5 rounded-lg bg-blue-50 flex-shrink-0">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-primary">Order Management</h3>
                <p className="text-sm text-brand-primary/70 mt-1 font-light">Complete order oversight with customer details, shipping addresses, and delivery tracking</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-2.5 rounded-lg bg-purple-50 flex-shrink-0">
                <Package className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-primary">Product Curation</h3>
                <p className="text-sm text-brand-primary/70 mt-1 font-light">Manage showcase products and featured items for each category on the storefront</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="p-2.5 rounded-lg bg-orange-50 flex-shrink-0">
                <BarChart3 className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <h3 className="font-semibold text-brand-primary">Analytics</h3>
                <p className="text-sm text-brand-primary/70 mt-1 font-light">Real-time insights into orders, customer activity, and business performance</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Homepage Controls: Best Sellers & Hero Images */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8 mb-12">
          <div className="bg-white rounded-xl shadow-md p-6 border border-border-light">
            <h3 className="text-lg font-semibold mb-4">Manage Best Sellers</h3>
            <p className="text-sm text-gray-500 mb-4">Toggle products to appear in the Best Sellers section.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 max-h-96 overflow-y-auto p-2">
              {allProducts.map(p => (
                <div key={p._id || p.id} className="p-3 border rounded-lg flex flex-col items-start gap-2">
                  <div className="flex items-center gap-2 w-full">
                    <img src={p.images?.[0] || p.image} alt={p.name} className="w-12 h-12 object-cover rounded" />
                    <div className="flex-1">
                      <div className="font-semibold text-sm truncate">{p.name}</div>
                      <div className="text-xs text-gray-500">₹{p.price}</div>
                    </div>
                  </div>
                  <div className="w-full flex items-center justify-between mt-2">
                    <button onClick={() => toggleBestSeller(p)} className={`px-3 py-1 rounded-full text-xs font-bold ${p.isBestSeller ? 'bg-purple-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>
                      {p.isBestSeller ? '★ Best Seller' : 'Mark Best'}
                    </button>
                    <div className="text-xs text-gray-400">{p.categoryId}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border border-border-light">
            <h3 className="text-lg font-semibold mb-4">Edit Hero / Banner Images</h3>
            <p className="text-sm text-gray-500 mb-4">Upload up to 3 hero images used on the homepage carousel.</p>
            <div className="flex gap-3 mb-4">
              {[0,1,2].map(i => (
                <label key={i} className="w-32 h-20 border rounded-lg overflow-hidden bg-gray-50 flex items-center justify-center cursor-pointer">
                  {heroImages[i] ? <img src={heroImages[i]} className="w-full h-full object-cover" alt={`hero-${i+1}`} /> : <div className="text-xs text-gray-400">Upload {i+1}</div>}
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => handleHeroChange(i, e.target.files?.[0])} />
                </label>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={saveHeroImages} disabled={hpSaving} className="px-4 py-2 bg-brand-blue text-white rounded-lg">{hpSaving ? 'Saving...' : 'Save Hero Images'}</button>
              <button onClick={() => { setHeroImages([null,null,null]); }} className="px-4 py-2 bg-gray-100 rounded-lg">Reset</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
