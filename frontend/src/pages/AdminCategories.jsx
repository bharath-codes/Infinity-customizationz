import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Plus, Trash2, Edit2, X, Save, ChevronRight, Check } from 'lucide-react';
// ✅ Import the centralized API service
import api from '../services/api'; 

const AdminCategories = () => {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
  const { adminToken } = useAuth();
=======
=======
>>>>>>> Stashed changes
    // Use environment variable for API base URL, fallback to localhost for dev
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
  const { admin, adminToken } = useAuth();
>>>>>>> Stashed changes
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [editingCategory, setEditingCategory] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    _id: '',
    title: '',
    desc: '',
    emoji: '',
    subCategories: [],
    showcaseProducts: []
  });

  useEffect(() => {
    loadInitialData();
  }, []);

  // ✅ Centralized data loader
  const loadInitialData = async () => {
    setLoading(true);
    try {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      const [catsData, prodsData] = await Promise.all([
        api.categories.getAll(),
        api.products.getAll()
      ]);
      setCategories(catsData);
      setProducts(prodsData);
=======
=======
>>>>>>> Stashed changes
      const res = await fetch(`${API_BASE_URL}/categories`);
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
      setLoading(false);
>>>>>>> Stashed changes
    } catch (err) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const refreshCategory = async (categoryId) => {
    try {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      const freshCategory = await api.categories.getById(categoryId);
      setCategories(categories.map(c => c._id === categoryId ? freshCategory : c));
      if (selectedCategory?._id === categoryId) {
        setSelectedCategory(freshCategory);
=======
=======
>>>>>>> Stashed changes
      const res = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
      if (res.ok) {
        const freshCategory = await res.json();
        setCategories(categories.map(c => c._id === categoryId ? freshCategory : c));
        if (selectedCategory?._id === categoryId) {
          setSelectedCategory(freshCategory);
        }
>>>>>>> Stashed changes
      }
    } catch (err) {
      console.error('Error refreshing category:', err);
    }
  };

<<<<<<< Updated upstream
=======
  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setEditingCategory(null);
    setShowForm(false);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setFormData({
      _id: category._id,
      title: category.title,
      desc: category.desc || '',
      emoji: category.emoji || '',
      subCategories: category.subCategories || [],
      showcaseProducts: category.showcaseProducts || []
    });
    setShowForm(true);
  };

>>>>>>> Stashed changes
  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category? This cannot be undone.')) return;
    try {
<<<<<<< Updated upstream
<<<<<<< Updated upstream
      await api.categories.delete(categoryId, adminToken);
=======
=======
>>>>>>> Stashed changes
      const res = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      if (!res.ok) throw new Error('Failed to delete category');

>>>>>>> Stashed changes
      setSuccess('Category deleted successfully');
      setCategories(categories.filter(c => c._id !== categoryId));
      if (selectedCategory?._id === categoryId) setSelectedCategory(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const handleSaveCategory = async () => {
    if (!formData.title || !formData._id) {
      setError('Category ID and Title are required');
      return;
    }
    try {
<<<<<<< Updated upstream
      let saved;
      if (editingCategory) {
        saved = await api.categories.update(editingCategory._id, formData, adminToken);
      } else {
        saved = await api.categories.create(formData, adminToken);
      }
      
=======
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory
        ? `${API_BASE_URL}/categories/${editingCategory._id}`
        : `${API_BASE_URL}/categories`;

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) throw new Error('Failed to save category');

      const saved = await res.json();
>>>>>>> Stashed changes
      if (editingCategory) {
        setCategories(categories.map(c => c._id === saved._id ? saved : c));
      } else {
        setCategories([...categories, saved]);
      }
      setSuccess(`Category ${editingCategory ? 'updated' : 'created'} successfully`);
      setShowForm(false);
      setEditingCategory(null);
      setFormData({ _id: '', title: '', desc: '', emoji: '', subCategories: [], showcaseProducts: [] });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

<<<<<<< Updated upstream
  const toggleShowcaseProduct = async (categoryId, productId) => {
=======
  const removeProductFromCategory = async (categoryId, productId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/categories/${categoryId}/products/${productId}`,
        {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${adminToken}` }
        }
      );

      if (!res.ok) throw new Error('Failed to remove product');

      setProducts(products.filter(p => p._id !== productId));
      setSuccess('Product removed from category');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const addProductToCategory = async (categoryId, productId) => {
    try {
      const res = await fetch(
        `${API_BASE_URL}/categories/${categoryId}/products/${productId}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${adminToken}` }
        }
      );

      if (!res.ok) throw new Error('Failed to add product');

      const updatedProduct = await fetch(`${API_BASE_URL}/products/${productId}`).then(r => r.json());
      setProducts([...products, updatedProduct]);
      setSuccess('Product added to category');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const toggleShowcaseProduct = (categoryId, productId) => {
>>>>>>> Stashed changes
    const category = categories.find(c => c._id === categoryId);
    const isInShowcase = category.showcaseProducts?.includes(productId);
<<<<<<< Updated upstream
    try {
      if (isInShowcase) {
        await api.categories.removeFromShowcase(categoryId, productId, adminToken);
      } else {
        await api.categories.addToShowcase(categoryId, productId, adminToken);
=======

    // Optimistically update UI instantly
    const updatedShowcase = isInShowcase
      ? category.showcaseProducts.filter(id => id !== productId)
      : [...(category.showcaseProducts || []), productId];
    
    const updatedCategory = { ...category, showcaseProducts: updatedShowcase };
    setSelectedCategory(updatedCategory);
    
    // Update in categories list too
    const updatedCategories = categories.map(c => c._id === categoryId ? updatedCategory : c);
    setCategories(updatedCategories);

    // Then sync with backend
    const syncWithBackend = async () => {
      try {
        const method = isInShowcase ? 'DELETE' : 'POST';
        const res = await fetch(
          `${API_BASE_URL}/categories/${categoryId}/showcase/${productId}`,
          {
            method,
            headers: { 'Authorization': `Bearer ${adminToken}` }
          }
        );

        if (!res.ok) throw new Error('Failed to update showcase');
        
        // Refresh category to sync state
        await refreshCategory(categoryId);
        
        setSuccess(`Product ${isInShowcase ? 'removed from' : 'added to'} showcase`);
        setTimeout(() => setSuccess(''), 3000);
      } catch (err) {
        // Revert on error
        await refreshCategory(categoryId);
        setError(err.message);
        setTimeout(() => setError(''), 3000);
>>>>>>> Stashed changes
      }
      await refreshCategory(categoryId);
      setSuccess(`Product ${isInShowcase ? 'removed from' : 'added to'} showcase`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
          📂 Category Management
        </h1>
        <button 
          onClick={() => { setShowForm(true); setEditingCategory(null); }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={20} /> Add New Category
        </button>
      </div>

      {/* Alerts */}
      {error && <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg flex gap-2"><AlertCircle /> {error}</div>}
      {success && <div className="mb-4 p-4 bg-green-50 text-green-700 rounded-lg flex gap-2"><Check /> {success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category List */}
        <div className="lg:col-span-1 space-y-4">
          <h2 className="text-xl font-semibold mb-4 text-gray-700">All Categories</h2>
          {categories.map(category => (
            <div 
              key={category._id}
              onClick={() => setSelectedCategory(category)}
              className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                selectedCategory?._id === category._id ? 'border-blue-500 bg-blue-50 shadow-md' : 'border-gray-200 bg-white hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{category.emoji || '📁'}</span>
                <div>
                  <h3 className="font-bold text-gray-900">{category.title}</h3>
                  <p className="text-xs text-gray-500">{category._id}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingCategory(category); setFormData(category); setShowForm(true); }}
                  className="p-1 hover:text-blue-600 transition-colors"
                ><Edit2 size={18} /></button>
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteCategory(category._id); }}
                  className="p-1 hover:text-red-600 transition-colors"
                ><Trash2 size={18} /></button>
              </div>
            </div>
          ))}
        </div>

        {/* Category Detail & Showcase View */}
        <div className="lg:col-span-2">
          {selectedCategory ? (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <div className="flex items-center gap-4 mb-6">
                <span className="text-5xl">{selectedCategory.emoji}</span>
                <div>
                  <h2 className="text-3xl font-bold">{selectedCategory.title}</h2>
                  <p className="text-gray-600">{selectedCategory.desc}</p>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="text-xl font-bold mb-4 flex items-center gap-2">✨ Showcase Products</h3>
                <p className="text-sm text-gray-500 mb-6">Select products to highlight in the homepage slideshow for this category.</p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {products.map(product => {
                    const isFeatured = selectedCategory.showcaseProducts?.includes(product._id);
                    return (
                      <div key={product._id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50">
                        <div className="flex items-center gap-3">
                          <img src={product.images[0]} alt="" className="w-12 h-12 rounded object-cover" />
                          <div>
                            <p className="font-semibold text-sm">{product.name}</p>
                            <p className="text-xs text-gray-500">₹{product.price}</p>
                          </div>
                        </div>
                        <button 
                          onClick={() => toggleShowcaseProduct(selectedCategory._id, product._id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-all ${
                            isFeatured ? 'bg-purple-600 text-white shadow-lg' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                          }`}
                        >
                          {isFeatured ? '⭐ Featured' : 'Feature'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-200 rounded-2xl text-gray-400">
              <ChevronRight size={48} />
              <p>Select a category to manage showcase products</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">{editingCategory ? 'Edit Category' : 'New Category'}</h2>
              <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full"><X /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Category ID (Unique Name)</label>
                <input 
                  disabled={editingCategory}
                  value={formData._id} 
                  onChange={(e) => setFormData({...formData, _id: e.target.value.toLowerCase().replace(/\s/g, '-')})}
                  className="w-full p-3 border rounded-xl bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="e.g. customized-frames"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">Display Title</label>
                <input 
                  value={formData.title} 
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="e.g. Customized Frames"
                />
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div className="col-span-1">
                  <label className="block text-sm font-semibold mb-1">Emoji</label>
                  <input 
                    value={formData.emoji} 
                    onChange={(e) => setFormData({...formData, emoji: e.target.value})}
                    className="w-full p-3 border rounded-xl text-center" 
                    placeholder="🎁"
                  />
                </div>
                <div className="col-span-3">
                  <label className="block text-sm font-semibold mb-1">Description</label>
                  <input 
                    value={formData.desc} 
                    onChange={(e) => setFormData({...formData, desc: e.target.value})}
                    className="w-full p-3 border rounded-xl" 
                    placeholder="Short summary..."
                  />
                </div>
              </div>
              <button 
                onClick={handleSaveCategory}
                className="w-full bg-blue-600 text-white p-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                <Save size={20} /> {editingCategory ? 'Update Category' : 'Create Category'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
