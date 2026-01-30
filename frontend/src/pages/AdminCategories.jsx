import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertCircle, Plus, Trash2, Edit2, X, Save } from 'lucide-react';

// ✅ Dynamic URL logic
const API_BASE_URL = import.meta.env.VITE_API_URL 
  ? `${import.meta.env.VITE_API_URL}/api` 
  : 'http://localhost:5000/api';

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

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // ✅ Updated to use dynamic URL
  const fetchCategories = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories`);
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
      const res = await fetch(`${API_BASE_URL}/categories/${categoryId}`);
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
      const res = await fetch(`${API_BASE_URL}/products`);
      if (!res.ok) throw new Error('Failed to fetch products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching products:', err);
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${categoryId}`, {
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
      if (editingCategory) {
        setCategories(categories.map(c => c._id === saved._id ? saved : c));
      } else {
        setCategories([...categories, saved]);
      }
      setSuccess(`Category ${editingCategory ? 'updated' : 'created'} successfully`);
      setShowForm(false);
      setEditingCategory(null);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(''), 3000);
    }
  };

  const removeProductFromCategory = async (categoryId, productId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${categoryId}/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!res.ok) throw new Error('Failed to remove product');
      setSuccess('Product removed from category');
      setTimeout(() => setSuccess(''), 3000);
      fetchProducts(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  const addProductToCategory = async (categoryId, productId) => {
    try {
      const res = await fetch(`${API_BASE_URL}/categories/${categoryId}/products/${productId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!res.ok) throw new Error('Failed to add product');
      setSuccess('Product added to category');
      setTimeout(() => setSuccess(''), 3000);
      fetchProducts(); // Refresh list
    } catch (err) {
      setError(err.message);
    }
  };

  const toggleShowcaseProduct = async (categoryId, productId) => {
    const category = categories.find(c => c._id === categoryId);
    const isInShowcase = category.showcaseProducts?.includes(productId);
    try {
      const method = isInShowcase ? 'DELETE' : 'POST';
      const res = await fetch(`${API_BASE_URL}/categories/${categoryId}/showcase/${productId}`, {
        method,
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      if (!res.ok) throw new Error('Failed to update showcase');
      await refreshCategory(categoryId);
      setSuccess(`Product ${isInShowcase ? 'removed from' : 'added to'} showcase`);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message);
    }
  };

  // ... rest of your UI logic (addSubCategory, etc.) remains same ...
  // (Paste your existing return() block here)
};

export default AdminCategories;
