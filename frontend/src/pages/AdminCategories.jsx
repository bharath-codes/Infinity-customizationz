import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Plus, Trash2, Edit2, X, Save } from 'lucide-react';

const AdminCategories = () => {
  const { admin, adminToken } = useAuth();
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

  const [newSubCategory, setNewSubCategory] = useState({ name: '', description: '' });

  // Fetch categories and products
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/categories');
      if (!res.ok) throw new Error('Failed to fetch categories');
      const data = await res.json();
      setCategories(data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const refreshCategory = async (categoryId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/categories/${categoryId}`);
      if (res.ok) {
        const freshCategory = await res.json();
        setCategories(categories.map(c => c._id === categoryId ? freshCategory : c));
        if (selectedCategory?._id === categoryId) {
          setSelectedCategory(freshCategory);
        }
      }
    } catch (err) {
      console.error('Error refreshing category:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/products');
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

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;

    try {
      const res = await fetch(`http://localhost:5000/api/categories/${categoryId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });

      if (!res.ok) throw new Error('Failed to delete category');

      setSuccess('Category deleted successfully');
      setCategories(categories.filter(c => c._id !== categoryId));
      setSelectedCategory(null);
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
      const method = editingCategory ? 'PUT' : 'POST';
      const url = editingCategory
        ? `http://localhost:5000/api/categories/${editingCategory._id}`
        : 'http://localhost:5000/api/categories';

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
      if (editingCategory) {
        setCategories(categories.map(c => c._id === saved._id ? saved : c));
      } else {
        setCategories([...categories, saved]);
      }

      setSuccess(`Category ${editingCategory ? 'updated' : 'created'} successfully`);
      setShowForm(false);
      setEditingCategory(null);
      setFormData({
        _id: '',
        title: '',
        desc: '',
        emoji: '',
        subCategories: [],
        showcaseProducts: []
      });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const removeProductFromCategory = async (categoryId, productId) => {
    try {
      const res = await fetch(
        `http://localhost:5000/api/categories/${categoryId}/products/${productId}`,
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
        `http://localhost:5000/api/categories/${categoryId}/products/${productId}`,
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${adminToken}` }
        }
      );

      if (!res.ok) throw new Error('Failed to add product');

      const updatedProduct = await fetch(`http://localhost:5000/api/products/${productId}`).then(r => r.json());
      setProducts([...products, updatedProduct]);
      setSuccess('Product added to category');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const toggleShowcaseProduct = (categoryId, productId) => {
    const category = categories.find(c => c._id === categoryId);
    if (!category) return;
    
    const isInShowcase = category.showcaseProducts?.includes(productId);

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
          `http://localhost:5000/api/categories/${categoryId}/showcase/${productId}`,
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
      }
    };

    syncWithBackend();
  };

  const addSubCategory = () => {
    if (!newSubCategory.name) return;
    setFormData({
      ...formData,
      subCategories: [...formData.subCategories, newSubCategory]
    });
    setNewSubCategory({ name: '', description: '' });
  };

  const removeSubCategory = (index) => {
    setFormData({
      ...formData,
      subCategories: formData.subCategories.filter((_, i) => i !== index)
    });
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
    return <div className="p-8 text-center">Loading categories...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">📦 Category Management</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setEditingCategory(null);
              setFormData({
                _id: '',
                title: '',
                desc: '',
                emoji: '',
                subCategories: [],
                showcaseProducts: []
              });
            }}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Plus size={20} /> Add Category
          </button>
        </div>

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Categories List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow">
              <div className="p-4 border-b">
                <h2 className="font-bold text-lg">Categories</h2>
              </div>
              <div className="divide-y max-h-96 overflow-y-auto">
                {categories.map(category => (
                  <div
                    key={category._id}
                    onClick={() => handleSelectCategory(category)}
                    className={`p-4 cursor-pointer transition ${
                      selectedCategory?._id === category._id
                        ? 'bg-blue-50 border-l-4 border-blue-600'
                        : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-semibold">
                          {category.emoji} {category.title}
                        </p>
                        <p className="text-sm text-gray-600">{category._id}</p>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditCategory(category);
                          }}
                          className="p-1 hover:bg-blue-100 rounded"
                        >
                          <Edit2 size={16} className="text-blue-600" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteCategory(category._id);
                          }}
                          className="p-1 hover:bg-red-100 rounded"
                        >
                          <Trash2 size={16} className="text-red-600" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {showForm ? (
              // Edit/Create Form
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold">
                    {editingCategory ? 'Edit Category' : 'Create New Category'}
                  </h2>
                  <button
                    onClick={() => {
                      setShowForm(false);
                      setEditingCategory(null);
                    }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="space-y-4">
                  {!editingCategory && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Category ID
                      </label>
                      <input
                        type="text"
                        value={formData._id}
                        onChange={(e) => setFormData({ ...formData, _id: e.target.value })}
                        placeholder="e.g., frames, magazines"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Photo Frames"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emoji
                    </label>
                    <input
                      type="text"
                      value={formData.emoji}
                      onChange={(e) => setFormData({ ...formData, emoji: e.target.value })}
                      placeholder="e.g., 📸"
                      maxLength="2"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.desc}
                      onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
                      placeholder="Category description"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  {/* Sub-categories */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sub-Categories
                    </label>
                    <div className="space-y-2 mb-3">
                      {formData.subCategories.map((sub, idx) => (
                        <div key={idx} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                          <div>
                            <p className="font-medium">{sub.name}</p>
                            <p className="text-sm text-gray-600">{sub.description}</p>
                          </div>
                          <button
                            onClick={() => removeSubCategory(idx)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={newSubCategory.name}
                        onChange={(e) => setNewSubCategory({ ...newSubCategory, name: e.target.value })}
                        placeholder="Sub-category name"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <textarea
                        value={newSubCategory.description}
                        onChange={(e) => setNewSubCategory({ ...newSubCategory, description: e.target.value })}
                        placeholder="Sub-category description"
                        rows="2"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                      />
                      <button
                        onClick={addSubCategory}
                        className="w-full px-3 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                      >
                        Add Sub-Category
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      onClick={handleSaveCategory}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                    >
                      <Save size={20} /> Save Category
                    </button>
                    <button
                      onClick={() => {
                        setShowForm(false);
                        setEditingCategory(null);
                      }}
                      className="flex-1 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : selectedCategory ? (
              // Display selected category with products
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-bold">
                      {selectedCategory.emoji} {selectedCategory.title}
                    </h2>
                    <p className="text-gray-600">{selectedCategory.desc}</p>
                  </div>
                  <button
                    onClick={() => handleEditCategory(selectedCategory)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                  >
                    <Edit2 size={20} /> Edit
                  </button>
                </div>

                {/* Showcase Products */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold mb-3">⭐ Showcase Products</h3>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                    <p className="text-sm text-yellow-800 mb-3">
                      Select products to showcase on the home page
                    </p>
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                      {products
                        .filter(p => p.categoryId === selectedCategory._id)
                        .map(product => (
                          <label 
                            key={product._id} 
                            className="flex items-center gap-3 p-3 hover:bg-yellow-100 rounded cursor-pointer border border-yellow-100 transition-all duration-200"
                          >
                            <input
                              type="checkbox"
                              checked={selectedCategory.showcaseProducts?.includes(product._id) || false}
                              onChange={() => toggleShowcaseProduct(selectedCategory._id, product._id)}
                              className="w-5 h-5 cursor-pointer accent-yellow-500"
                            />
                            <span className="flex-1 font-medium">
                              {product.name}
                              <span className="text-sm text-gray-600 ml-2">₹{product.price}</span>
                            </span>
                            {selectedCategory.showcaseProducts?.includes(product._id) && (
                              <span className="text-yellow-600 font-bold">✓ Showcase</span>
                            )}
                          </label>
                        ))}
                    </div>
                    {selectedCategory.showcaseProducts?.length === 0 && (
                      <p className="text-sm text-gray-600 italic">No showcase products selected</p>
                    )}
                  </div>
                </div>

                {/* Products in Category */}
                <div>
                  <h3 className="text-lg font-bold mb-3">📦 Products in Category</h3>
                  <div className="space-y-2 mb-4">
                    {products
                      .filter(p => p.categoryId === selectedCategory._id)
                      .map(product => (
                        <div
                          key={product._id}
                          className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <div className="flex-1">
                            <p className="font-medium">{product.name}</p>
                            <p className="text-sm text-gray-600">
                              Price: ₹{product.price} | {product.inStock ? '✅ In Stock' : '❌ Out of Stock'}
                            </p>
                          </div>
                          <button
                            onClick={() => removeProductFromCategory(selectedCategory._id, product._id)}
                            className="ml-2 p-2 hover:bg-red-100 rounded"
                            title="Remove from this category"
                          >
                            <Trash2 size={16} className="text-red-600" />
                          </button>
                        </div>
                      ))}
                    {products.filter(p => p.categoryId === selectedCategory._id).length === 0 && (
                      <p className="text-gray-600 italic">No products in this category yet</p>
                    )}
                  </div>

                  {/* Add Product to Category */}
                  <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <label className="block text-sm font-bold text-gray-700 mb-2">➕ Add Product to This Category</label>
                    <select
                      onChange={(e) => {
                        if (e.target.value) {
                          addProductToCategory(selectedCategory._id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="w-full px-3 py-2 border border-blue-300 rounded-lg focus:outline-none focus:border-brand-blue text-sm"
                    >
                      <option value="">Select a product...</option>
                      {products
                        .filter(p => p.categoryId !== selectedCategory._id)
                        .map(product => (
                          <option key={product._id} value={product._id}>
                            {product.name} - ₹{product.price}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow p-12 text-center">
                <p className="text-gray-600 text-lg">Select a category to view and manage products</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminCategories;