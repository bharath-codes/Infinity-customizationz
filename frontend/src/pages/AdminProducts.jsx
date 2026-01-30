import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Search, X, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const AdminProducts = () => {
  const navigate = useNavigate();
  const { admin, adminToken } = useAuth();
  const [products, setProducts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const initialFormState = {
    name: '',
    price: '',
    description: '',
    categoryId: '',
    weight: '',
    dimensions: '',
    image: '', // Stores the image URL/path
    images: ['', '', ''], // 3 product images
    inStock: true
  };

  const [formData, setFormData] = useState(initialFormState);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    fetchProducts();
  }, [admin, navigate]);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/products`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      setFormData(prev => ({ ...prev, image: data.filePath }));
      setPreviewImage(data.filePath);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!adminToken) {
      alert('Not authenticated');
      return;
    }

    try {
      const url = editingId ? `${API_BASE_URL}/products/${editingId}` : `${API_BASE_URL}/products`;
      const method = editingId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(formData)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.message || 'Operation failed');
      }

      await fetchProducts();
      resetForm();
    } catch (error) {
      console.error('Error saving product:', error);
      alert(error.message);
    }
  };

  const handleEdit = (product) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      price: product.price,
      description: product.description,
      categoryId: product.categoryId,
      weight: product.weight || '',
      dimensions: product.dimensions || '',
      image: product.image || '',
      images: product.images || ['', '', ''],
      inStock: product.inStock
    });
    setPreviewImage(product.image || '');
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;

    try {
      const res = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!res.ok) throw new Error('Delete failed');

      await fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Failed to delete product');
    }
  };

  const resetForm = () => {
    setFormData(initialFormState);
    setEditingId(null);
    setShowAddForm(false);
    setPreviewImage('');
  };

  const filteredProducts = products.filter(product =>
    product.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-brand-light">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button
            onClick={() => navigate('/admin/dashboard')}
            className="flex items-center gap-2 text-brand-blue hover:text-brand-dark mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-brand-dark">Products Management</h1>
              <p className="text-sm text-gray-500 mt-1">Add, edit, or delete products</p>
            </div>
            {!showAddForm && (
              <button
                onClick={() => setShowAddForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-brand-blue/90 text-white rounded-lg transition-colors"
              >
                <Plus className="w-5 h-5" />
                Add Product
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Add/Edit Product Form */}
        {showAddForm && (
          <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-brand-dark">
                {editingId ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={resetForm} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2 space-y-4">
                <label className="block text-sm font-medium text-gray-700">Product Image</label>
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center overflow-hidden bg-gray-50 relative">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-blue"></div>
                    ) : previewImage ? (
                      <img src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <Upload className="w-8 h-8 text-gray-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-brand-blue/10 file:text-brand-blue
                        hover:file:bg-brand-blue/20"
                    />
                    <p className="mt-1 text-xs text-gray-500">Supported: JPG, PNG, WEBP</p>
                  </div>
                </div>
              </div>

              <input
                type="text"
                placeholder="Product Name"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
              />
              <input
                type="number"
                placeholder="Price"
                required
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
              />
              <select
                required
                value={formData.categoryId}
                onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
              >
                <option value="">Select Category</option>
                <option value="frames">📸 Photo Frames</option>
                <option value="magazines">📖 Magazines</option>
                <option value="memories">🎞️ Polaroids & Photo Books</option>
                <option value="flowers">🌹 Flowers & Bouquets</option>
                <option value="hampers">🎁 Hampers & Gift Combos</option>
                <option value="apparel">👕 T-Shirts & Accessories</option>
                <option value="essentials">📱 Phone Cases & Cups</option>
                <option value="vintage">✨ Vintage Collection</option>
                <option value="addons">📅 Calendars & Magnets</option>
                <option value="smart-digital">🤖 Smart & Digital Services</option>
              </select>
              <input
                type="text"
                placeholder="Weight (optional)"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
              />
              <input
                type="text"
                placeholder="Dimensions (optional)"
                value={formData.dimensions}
                onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
              />              
              {/* Product Images */}
              <div className="md:col-span-2 border-2 border-gray-200 rounded-lg p-4">
                <label className="text-gray-700 font-bold mb-3 block">📸 Product Images (Up to 3)</label>
                <div className="space-y-3">
                  <input
                    type="text"
                    placeholder="Image 1 URL (e.g., /images/product.jpg)"
                    value={formData.images?.[0] || ''}
                    onChange={(e) => {
                      const imgs = [...(formData.images || ['', '', ''])];
                      imgs[0] = e.target.value;
                      setFormData({ ...formData, images: imgs });
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-brand-blue text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Image 2 URL (optional)"
                    value={formData.images?.[1] || ''}
                    onChange={(e) => {
                      const imgs = [...(formData.images || ['', '', ''])];
                      imgs[1] = e.target.value;
                      setFormData({ ...formData, images: imgs });
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-brand-blue text-sm"
                  />
                  <input
                    type="text"
                    placeholder="Image 3 URL (optional)"
                    value={formData.images?.[2] || ''}
                    onChange={(e) => {
                      const imgs = [...(formData.images || ['', '', ''])];
                      imgs[2] = e.target.value;
                      setFormData({ ...formData, images: imgs });
                    }}
                    className="w-full px-4 py-2 border border-gray-200 rounded focus:outline-none focus:border-brand-blue text-sm"
                  />
                </div>
              </div>
              <div className="flex items-center gap-2 px-4">
                <input
                  type="checkbox"
                  id="inStock"
                  checked={formData.inStock}
                  onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                  className="w-5 h-5 text-brand-blue"
                />
                <label htmlFor="inStock" className="text-gray-700 font-medium">In Stock</label>
              </div>
              <textarea
                placeholder="Description"
                required
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="md:col-span-2 px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue"
                rows="3"
              />
              <div className="md:col-span-2 flex gap-4">
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-6 py-3 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors font-semibold disabled:opacity-50"
                >
                  {editingId ? 'Update Product' : 'Save Product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search products..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue transition-colors"
            />
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-blue mx-auto mb-4"></div>
              <p className="text-gray-500">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">No products found</p>
              {!showAddForm && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-brand-blue text-white rounded-lg hover:bg-brand-blue/90 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                  Add First Product
                </button>
              )}
            </div>
          ) : (
            filteredProducts.map((product) => (
              <div key={product._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow relative group">
                {product.image ? (
                  <img src={product.image} alt={product.name} className="w-full h-56 object-cover" />
                ) : (
                  <div className="w-full h-56 bg-gray-100 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <div className="p-6">
                  <h3 className="font-bold text-brand-dark text-lg mb-2">{product.name}</h3>
                  <p className="text-gray-600 text-xs uppercase font-bold tracking-wider mb-2">{product.categoryId}</p>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-2xl font-bold text-brand-blue">₹{product.price}</span>
                    <span className={`text-xs font-bold px-2 py-1 rounded-full ${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {product.inStock ? 'In Stock' : 'Out of Stock'}
                    </span>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-brand-blue/10 hover:bg-brand-blue text-brand-blue hover:text-white rounded-lg transition-colors font-medium"
                    >
                      <Edit2 className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex items-center justify-center px-4 py-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminProducts;
