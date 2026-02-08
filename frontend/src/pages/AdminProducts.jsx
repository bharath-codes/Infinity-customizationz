import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Plus, Edit2, Trash2, Search, X, Upload } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { API_BASE_URL } from '../services/api';

const AdminProducts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const categoryFromUrl = searchParams.get('category');
  const editIdFromUrl = searchParams.get('edit');
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
    image: '', // Stores the image URL/path (primary)
    images: [], // dynamic list of product images
    inStock: true,
    isBestSeller: false, // Add best seller flag
    pricingType: 'standard', // standard or quantity-based
    pricing: { "40": 179, "50": 169, "60-70": 159, "70+": 149 }, // for signature day tshirts
    colorPriceDiff: 50 // color price difference
  };

  const [formData, setFormData] = useState(initialFormState);
  const [uploading, setUploading] = useState(false);
  const [previewImage, setPreviewImage] = useState('');
  const [categories, setCategories] = useState([]);
  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [reviewsProductName, setReviewsProductName] = useState('');

  useEffect(() => {
    if (!admin) {
      navigate('/admin/login');
      return;
    }
    fetchProducts();

    // Load categories for the category select so admin can change product category reliably
    (async () => {
      try {
        const cats = await api.categories.getAll();
        setCategories(cats || []);
      } catch (err) {
        console.error('Failed to load categories:', err);
      }
    })();
  }, [admin, navigate]);

  // When coming from Categories page with ?category=xxx, open Add form with category pre-selected
  useEffect(() => {
    if (categoryFromUrl && categories.length > 0) {
      setFormData(prev => ({ ...prev, categoryId: categoryFromUrl }));
      setShowAddForm(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [categoryFromUrl, categories.length]);

  // When coming from Categories page with ?edit=productId, open Edit form for that product
  useEffect(() => {
    if (!editIdFromUrl || !adminToken) return;
    const openEdit = async () => {
      try {
        const product = await api.products.getById(editIdFromUrl);
        if (product) {
          setEditingId(product._id);
          setFormData({
            name: product.name,
            price: product.price,
            description: product.description || '',
            categoryId: product.categoryId,
            weight: product.weight || '',
            dimensions: product.dimensions || '',
            image: product.image || '',
            images: product.images || [],
            inStock: product.inStock,
            isBestSeller: product.isBestSeller || false,
            pricingType: product.pricingType || 'standard',
            pricing: product.pricing || { "40": 179, "50": 169, "60-70": 159, "70+": 149 },
            colorPriceDiff: product.colorPriceDiff || 50
          });
          setPreviewImage(product.image || '');
          setShowAddForm(true);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } catch (err) {
        console.error('Failed to load product for edit:', err);
      }
    };
    openEdit();
  }, [editIdFromUrl, adminToken]);

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

    // show a local preview immediately so admin gets instant feedback
    const tempUrl = URL.createObjectURL(file);
    setPreviewImage(tempUrl);

    const formData = new FormData();
    formData.append('image', file);

    try {
      setUploading(true);
      const headers = {};
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers,
        body: formData,
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      // Prefer absolute `url` returned by backend; fall back to filePath
      const backendBase = API_BASE_URL.replace(/\/api$/, '');
      const fileUrl = data.url && data.url.startsWith('http') ? data.url : (data.filePath && data.filePath.startsWith('http') ? data.filePath : (data.filePath ? `${backendBase}${data.filePath}` : null));
      if (fileUrl) {
        setFormData(prev => ({ ...prev, image: fileUrl }));
        setPreviewImage(fileUrl);
      }
      // revoke temporary object URL now that we have the final server URL
      try { URL.revokeObjectURL(tempUrl); } catch (e) {}
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

      // Ensure images array has no empty slots at the end
      const imagesToSend = (formData.images || []).filter(img => img);
      const payload = { ...formData, images: imagesToSend };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        },
        body: JSON.stringify(payload)
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
      images: product.images || [],
      inStock: product.inStock,
      isBestSeller: product.isBestSeller || false,
      pricingType: product.pricingType || 'standard',
      pricing: product.pricing || { "40": 179, "50": 169, "60-70": 159, "70+": 149 },
      colorPriceDiff: product.colorPriceDiff || 50
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

  const openReviews = async (product) => {
    try {
      setReviewsLoading(true);
      setReviewsProductName(product.name || 'Product Reviews');
      const res = await fetch(`${API_BASE_URL}/products/${product._id}/reviews`);
      if (!res.ok) throw new Error('Failed to fetch reviews');
      const data = await res.json();
      setReviewsList(Array.isArray(data) ? data : []);
      setReviewsModalOpen(true);
    } catch (err) {
      console.error('Error loading reviews:', err);
      alert('Failed to load reviews');
    } finally {
      setReviewsLoading(false);
    }
  };

  const closeReviews = () => {
    setReviewsModalOpen(false);
    setReviewsList([]);
    setReviewsProductName('');
  };

  const handleDeleteReview = async (reviewIndex) => {
    if (!window.confirm('Delete this review?')) return;
    try {
      const productId = products.find(p => p.name === reviewsProductName)?._id;
      if (!productId) throw new Error('Product not found');
      
      const res = await fetch(`${API_BASE_URL}/products/${productId}/reviews/${reviewIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (!res.ok) throw new Error('Delete failed');
      const data = await res.json();
      setReviewsList(data.reviews);
    } catch (error) {
      console.error('Error deleting review:', error);
      alert('Failed to delete review');
    }
  };


  const handleMultiImageUpload = async (index, file) => {
    if (!file) return;

    // show a local preview immediately for the specific slot
    const tempUrl = URL.createObjectURL(file);
    const currentImgs = [...(formData.images || [])];
    currentImgs[index] = tempUrl;
    setFormData(prev => ({ ...prev, images: currentImgs }));

    const fd = new FormData();
    fd.append('image', file);

    try {
      setUploading(true);
      const headers = {};
      if (adminToken) headers['Authorization'] = `Bearer ${adminToken}`;
      const res = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers,
        body: fd
      });

      if (!res.ok) throw new Error('Upload failed');

      const data = await res.json();
      const backendBase = API_BASE_URL.replace(/\/api$/, '');
      const fileUrl = data.url && data.url.startsWith('http') ? data.url : (data.filePath && data.filePath.startsWith('http') ? data.filePath : (data.filePath ? `${backendBase}${data.filePath}` : null));
      const imgs = [...(formData.images || [])];
      // replace temporary preview with final server URL
      if (fileUrl) imgs[index] = fileUrl;
      setFormData(prev => ({ ...prev, images: imgs }));
      try { URL.revokeObjectURL(tempUrl); } catch (e) {}
    } catch (err) {
      console.error('Image upload failed:', err);
      alert('Image upload failed');
    } finally {
      setUploading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !categoryFromUrl || product.categoryId === categoryFromUrl;
    return matchesSearch && matchesCategory;
  });

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
              <p className="text-sm text-gray-500 mt-1">
                {categoryFromUrl ? `Filtered: ${categories.find(c => c._id === categoryFromUrl)?.title || categoryFromUrl}` : 'Add, edit, or delete products'}
              </p>
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
          <div className="bg-white rounded-2xl shadow-lg border-2 border-brand-blue/20 p-8 mb-10">
            <div className="flex justify-between items-start mb-8 pb-6 border-b-2 border-gray-200">
              <div>
                <h2 className="text-3xl font-bold text-brand-primary mb-2">
                  {editingId ? '✏️ Edit Product' : '➕ Add New Product'}
                </h2>
                <p className="text-gray-600 text-sm">
                  {editingId ? 'Update the product details below' : 'Fill in the details to add a new product to your catalog'}
                </p>
              </div>
              <button 
                onClick={resetForm} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
                title="Close form"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Product Image Section */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
                <label className="block text-lg font-bold text-brand-primary mb-4">🖼️ Main Product Image</label>
                <div className="flex items-start gap-6">
                  <div className="w-40 h-40 border-4 border-dashed border-blue-300 rounded-xl flex items-center justify-center overflow-hidden bg-white relative flex-shrink-0">
                    {uploading ? (
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-blue"></div>
                    ) : previewImage ? (
                      <img loading="lazy" src={previewImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="text-center">
                        <Upload className="w-10 h-10 text-blue-400 mx-auto mb-2" />
                        <span className="text-xs text-gray-500">Upload</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="image-upload"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="block w-full text-sm text-gray-600
                        file:mr-4 file:py-3 file:px-6
                        file:rounded-lg file:border-0
                        file:text-sm file:font-bold
                        file:bg-blue-500 file:text-white
                        hover:file:bg-blue-600 transition-colors"
                    />
                    <p className="mt-3 text-sm text-gray-600">
                      💡 Tip: Upload a high-quality image (recommended 800x800px or larger)
                    </p>
                    <p className="mt-2 text-xs text-gray-500">Supported: JPG, PNG, WEBP (Max 10MB)</p>
                  </div>
                </div>
              </div>

              {/* Basic Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                  <input
                    type="text"
                    placeholder="e.g., 4x6 White Frame"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue focus:bg-blue-50 transition-all text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price (₹) *</label>
                  <input
                    type="number"
                    placeholder="e.g., 499"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue focus:bg-blue-50 transition-all text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category *</label>
                  <select
                    required
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue focus:bg-blue-50 transition-all text-base"
                  >
                    <option value="">-- Select a Category --</option>
                    {categories.map(c => (
                      <option key={c._id} value={c._id}>
                        {c.emoji ? c.emoji + ' ' : ''}{c.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Weight (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., 500g"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue focus:bg-blue-50 transition-all text-base"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Dimensions (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g., 20x15x5 cm"
                    value={formData.dimensions}
                    onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue focus:bg-blue-50 transition-all text-base"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Product Description *</label>
                <textarea
                  placeholder="Provide a detailed description of the product..."
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue focus:bg-blue-50 transition-all text-base"
                  rows="4"
                />
              </div>

              {/* Checkboxes */}
              <div className="bg-gray-50 rounded-lg p-4 border-2 border-gray-200 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.inStock}
                    onChange={(e) => setFormData({ ...formData, inStock: e.target.checked })}
                    className="w-5 h-5 text-brand-blue rounded focus:ring-2 focus:ring-brand-blue"
                  />
                  <span className="font-medium text-gray-700">✓ In Stock</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:bg-white p-2 rounded transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.isBestSeller}
                    onChange={(e) => setFormData({ ...formData, isBestSeller: e.target.checked })}
                    className="w-5 h-5 text-brand-blue rounded focus:ring-2 focus:ring-brand-blue"
                  />
                  <span className="font-medium text-gray-700">★ Mark as Best Seller</span>
                </label>
              </div>

              {/* Product Images - dynamic list */}
              <div className="bg-purple-50 border-2 border-purple-200 rounded-lg p-6">
                <label className="text-lg font-bold text-brand-primary mb-4 block">📸 Additional Product Images</label>
                <p className="text-sm text-gray-600 mb-4">Add multiple images to showcase your product from different angles.</p>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                  {(formData.images && formData.images.length > 0) ? (
                    formData.images.map((img, i) => (
                      <div key={i} className="flex flex-col items-center">
                        <div className="w-full aspect-square bg-white rounded-lg border-2 border-purple-200 overflow-hidden flex items-center justify-center">
                          {img ? (
                            <img loading="lazy" src={img} alt={`img-${i+1}`} className="w-full h-full object-cover" />
                          ) : (
                            <div className="text-xs text-gray-400 text-center p-2">Empty</div>
                          )}
                        </div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleMultiImageUpload(i, e.target.files[0])}
                          className="text-xs mt-2 w-full"
                        />
                        <button 
                          type="button" 
                          onClick={() => {
                            const imgs = [...(formData.images || [])];
                            imgs.splice(i, 1);
                            setFormData({ ...formData, images: imgs });
                          }} 
                          className="text-xs text-red-500 font-bold mt-1 hover:text-red-700"
                        >
                          ✕ Remove
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="col-span-full text-center text-gray-500 py-6">No images yet. Add images to showcase your product.</div>
                  )}

                  {/* Add Image Slot */}
                  <div className="flex flex-col items-center">
                    <button 
                      type="button" 
                      onClick={() => setFormData(prev => ({ ...prev, images: [...(prev.images || []), ''] }))} 
                      className="w-full aspect-square bg-purple-100 rounded-lg border-2 border-dashed border-purple-300 flex items-center justify-center hover:bg-purple-200 transition-colors"
                    >
                      <span className="text-2xl">+</span>
                    </button>
                    <p className="text-xs text-gray-600 mt-2 text-center">Add Image</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t-2 border-gray-200">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 px-8 py-4 bg-gradient-to-r from-brand-blue to-brand-blue/90 text-white rounded-lg hover:from-brand-blue/90 hover:to-brand-blue transition-all font-bold text-lg shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {editingId ? '✓ Update Product' : '✓ Save Product'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 px-8 py-4 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 transition-all font-bold text-lg shadow-md hover:shadow-lg"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Search Bar */}
        <div className="bg-white rounded-2xl shadow-md p-6 mb-8 sticky top-20 z-30">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="🔍 Search by product name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-brand-blue focus:bg-blue-50 transition-all text-base"
              />
            </div>
            <div className="text-sm font-semibold text-gray-600 whitespace-nowrap">
              {filteredProducts.length} {filteredProducts.length === 1 ? 'Product' : 'Products'} Found
            </div>
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
              <div key={product._id} className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition-shadow relative group border border-gray-200 flex flex-col">
                {/* Image Container */}
                <div className="relative h-56 bg-gray-100 overflow-hidden">
                  {(product.images?.[0] || product.image) ? (
                    <img loading="lazy" src={product.images?.[0] || product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
                      No Image
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2">
                    {product.isBestSeller && (
                      <span className="bg-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md">★ Best Seller</span>
                    )}
                    <span className={`px-3 py-1 rounded-full text-xs font-bold shadow-md ${product.inStock ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                      {product.inStock ? '✓ In Stock' : '✕ Out of Stock'}
                    </span>
                  </div>
                </div>

                {/* Additional Images Thumbnails */}
                {product.images && product.images.length > 1 && (
                  <div className="px-4 py-2 bg-gray-50 border-t border-gray-200 flex gap-2 overflow-x-auto">
                    {product.images.slice(0, 4).map((img, idx) => (
                      <img key={idx} src={img} alt={`thumb-${idx}`} className="w-10 h-10 object-cover rounded border border-gray-200 flex-shrink-0" />
                    ))}
                    {product.images.length > 4 && (
                      <div className="w-10 h-10 rounded border border-gray-200 flex items-center justify-center bg-gray-200 text-xs font-bold text-gray-700 flex-shrink-0">
                        +{product.images.length - 4}
                      </div>
                    )}
                  </div>
                )}

                {/* Content */}
                <div className="p-5 flex-grow flex flex-col">
                  {/* Title */}
                  <h3 className="font-bold text-brand-dark text-lg mb-1 line-clamp-2 break-words" title={product.name}>
                    {product.name}
                  </h3>
                  
                  {/* Category */}
                  <p className="text-xs uppercase font-bold tracking-wider text-brand-secondary mb-2 line-clamp-1">
                    📁 {product.categoryId}
                  </p>
                  
                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow break-words">
                    {product.description || 'No description'}
                  </p>

                  {/* Price and Stock */}
                  <div className="flex items-baseline justify-between mb-4 py-2 border-t border-gray-200">
                    <span className="text-3xl font-bold text-brand-blue">₹{product.price}</span>
                    {product.weight && <span className="text-xs text-gray-500">Wt: {product.weight}</span>}
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-3 gap-2 mt-auto">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex items-center justify-center gap-1 px-2 py-2 bg-blue-50 hover:bg-blue-500 text-blue-600 hover:text-white rounded-lg transition-all font-medium text-sm"
                      title="Edit product"
                    >
                      <Edit2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Edit</span>
                    </button>
                    <button
                      onClick={() => openReviews(product)}
                      className="flex items-center justify-center gap-1 px-2 py-2 bg-yellow-50 hover:bg-yellow-500 text-yellow-700 hover:text-white rounded-lg transition-all font-medium text-sm"
                      title="View reviews"
                    >
                      <span className="text-lg">⭐</span>
                      <span className="hidden sm:inline text-xs">{product.reviews?.length || 0}</span>
                    </button>
                    <button
                      onClick={() => handleDelete(product._id)}
                      className="flex items-center justify-center gap-1 px-2 py-2 bg-red-50 hover:bg-red-500 text-red-600 hover:text-white rounded-lg transition-all font-medium text-sm"
                      title="Delete product"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span className="hidden sm:inline">Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div> {/* close products grid */}

        {/* Reviews Modal */}
        {reviewsModalOpen && (
          <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl w-full max-w-xl p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-bold">Reviews — {reviewsProductName}</h3>
                <button onClick={closeReviews} className="text-gray-400 hover:text-gray-600"><X /></button>
              </div>

              {reviewsLoading ? (
                <div className="flex items-center justify-center p-8"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div></div>
              ) : (reviewsList.length === 0 ? (
                <p className="text-sm text-gray-500">No reviews yet for this product.</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {reviewsList.map((r, idx) => (
                    <div key={idx} className="p-3 rounded-lg border bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-brand-gold/20 flex items-center justify-center font-semibold text-sm">{(r.name||'U').charAt(0)}</div>
                          <div>
                            <p className="font-semibold text-sm">{r.name || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500">{new Date(r.createdAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-sm text-yellow-600 font-bold">{Array.from({length: Math.round(r.rating||0)}).map((_,i)=>(<span key={i}>★</span>))}{Array.from({length:5-Math.round(r.rating||0)}).map((_,i)=>(<span className="text-gray-300" key={i}>★</span>))}</div>
                          <button 
                            onClick={() => handleDeleteReview(idx)}
                            className="text-red-500 hover:text-red-700 ml-2"
                            title="Delete review"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700">{r.comment}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div> {/* close main container */}
    </div>
  );
};

export default AdminProducts;
