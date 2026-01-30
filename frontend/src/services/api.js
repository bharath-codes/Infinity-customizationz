// API Service - Central hub for all API calls
const API_BASE_URL = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : 'http://localhost:5000/api';



// Helper function for API calls
const apiCall = async (endpoint, method = 'GET', data = null, token = null) => {
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (data) {
    config.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const result = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: result.message || 'Something went wrong',
        data: result
      };
    }

    return result;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};

// --- USER AUTHENTICATION API ---

export const userAuth = {
  // Login with phone, password and name (Direct - No OTP)
  verifyCredentials: async (phoneNumber, password, name) => {
    return apiCall('/auth/user/verify-credentials', 'POST', { phoneNumber, password, name });
  },

  // Legacy endpoints (kept for compatibility)
  verifyOTP: async (phoneNumber, otp) => {
    return { success: true, message: 'OTP system removed' };
  },

  // Legacy endpoints (kept for compatibility)
  completeRegistration: async (phoneNumber, name) => {
    return { success: true, message: 'OTP system removed' };
  },

  // Request OTP (legacy)
  requestOTP: async (phoneNumber) => {
    return apiCall('/auth/user/verify-credentials', 'POST', { phoneNumber, password: '' });
  },

  // Get User Profile
  getProfile: async (token) => {
    return apiCall('/auth/user/profile', 'GET', null, token);
  },

  // Update User Profile
  updateProfile: async (profileData, token) => {
    return apiCall('/auth/user/profile', 'PUT', profileData, token);
  },

  // Admin Login (accessible from userAuth)
  adminLogin: async (email, password) => {
    return apiCall('/auth/admin/login', 'POST', { email, password });
  },
};

// --- ADMIN AUTHENTICATION API ---

export const adminAuth = {
  // Admin Login
  login: async (email, password) => {
    return apiCall('/auth/admin/login', 'POST', { email, password });
  },

  // Create Admin (Super Admin Only)
  createAdmin: async (adminData, token) => {
    return apiCall('/auth/admin/create', 'POST', adminData, token);
  },

  // Get Admin Profile
  getProfile: async (token) => {
    return apiCall('/auth/admin/profile', 'GET', null, token);
  },

  // Update Admin Profile
  updateProfile: async (profileData, token) => {
    return apiCall('/auth/admin/profile', 'PUT', profileData, token);
  },

  // Change Password
  changePassword: async (passwords, token) => {
    return apiCall('/auth/admin/change-password', 'POST', passwords, token);
  },
};

// --- PRODUCTS API ---

export const products = {
  // Get All Products
  getAll: async () => {
    return apiCall('/products', 'GET');
  },

  // Get Products by Category
  getByCategory: async (categoryId) => {
    return apiCall(`/products/category/${categoryId}`, 'GET');
  },

  // Get Single Product
  getById: async (id) => {
    return apiCall(`/products/${id}`, 'GET');
  },

  // Create Product (Admin)
  create: async (productData, token) => {
    return apiCall('/products', 'POST', productData, token);
  },

  // Update Product (Admin)
  update: async (id, productData, token) => {
    return apiCall(`/products/${id}`, 'PUT', productData, token);
  },

  // Delete Product (Admin)
  delete: async (id, token) => {
    return apiCall(`/products/${id}`, 'DELETE', null, token);
  },
};

// --- CATEGORIES API ---

export const categories = {
  // Get All Categories
  getAll: async () => {
    return apiCall('/categories', 'GET');
  },

  // Get Single Category with Products
  getById: async (categoryId) => {
    return apiCall(`/categories/${categoryId}`, 'GET');
  },

  // Create Category (Admin)
  create: async (categoryData, token) => {
    return apiCall('/categories', 'POST', categoryData, token);
  },

  // Update Category (Admin)
  update: async (categoryId, categoryData, token) => {
    return apiCall(`/categories/${categoryId}`, 'PUT', categoryData, token);
  },

  // Delete Category (Admin)
  delete: async (categoryId, token) => {
    return apiCall(`/categories/${categoryId}`, 'DELETE', null, token);
  },

  // Add Product to Showcase (Admin)
  addToShowcase: async (categoryId, productId, token) => {
    return apiCall(`/categories/${categoryId}/showcase/${productId}`, 'POST', {}, token);
  },

  // Remove Product from Showcase (Admin)
  removeFromShowcase: async (categoryId, productId, token) => {
    return apiCall(`/categories/${categoryId}/showcase/${productId}`, 'DELETE', null, token);
  },

  // Add Product to Category (Admin)
  addProduct: async (categoryId, productId, token) => {
    return apiCall(`/categories/${categoryId}/products/${productId}`, 'POST', {}, token);
  },

  // Remove Product from Category (Admin)
  removeProduct: async (categoryId, productId, token) => {
    return apiCall(`/categories/${categoryId}/products/${productId}`, 'DELETE', null, token);
  },
};

// --- ORDERS API ---

export const orders = {
  // Create Order
  create: async (orderData, token) => {
    return apiCall('/orders/create', 'POST', orderData, token);
  },

  // Get My Orders
  getMyOrders: async (token) => {
    return apiCall('/orders/my-orders', 'GET', null, token);
  },

  // Get Single Order
  getById: async (id, token) => {
    return apiCall(`/orders/${id}`, 'GET', null, token);
  },

  // Upload Images to Order
  uploadImages: async (orderId, images, token) => {
    return apiCall(`/orders/${orderId}/upload-images`, 'POST', { images }, token);
  },

  // --- ADMIN ONLY ---

  // Get All Orders (Admin)
  getAll: async (filters, token) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/orders/admin/orders?${params}`, 'GET', null, token);
  },

  // Get Order Details (Admin)
  getAdminById: async (id, token) => {
    return apiCall(`/orders/admin/orders/${id}`, 'GET', null, token);
  },

  // Update Order Status (Admin)
  updateStatus: async (id, statusData, token) => {
    return apiCall(`/orders/admin/orders/${id}/status`, 'PUT', statusData, token);
  },

  // View Order Images (Admin)
  getImages: async (id, token) => {
    return apiCall(`/orders/admin/orders/${id}/images`, 'GET', null, token);
  },

  // Add Admin Notes (Admin)
  addNotes: async (id, notes, token) => {
    return apiCall(`/orders/admin/orders/${id}/notes`, 'PUT', { notes }, token);
  },

  // Trigger Shipment (Admin)
  triggerShipment: async (id, token) => {
    return apiCall(`/orders/admin/orders/${id}/ship`, 'POST', {}, token);
  },
};

export default { userAuth, adminAuth, products, categories, orders };
