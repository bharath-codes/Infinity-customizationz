// API Service - Central hub for all API calls
// Logic: Use Render URL if available, otherwise fallback to localhost
const VITE_URL = import.meta.env.VITE_API_URL;
const API_BASE_URL = VITE_URL 
  ? `${VITE_URL.replace(/\/$/, '')}/api`  // Removes trailing slash if user added it
  : 'http://localhost:5000/api';

console.log('🔗 API connected to:', API_BASE_URL); // Debugging line

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
    // Ensure endpoint starts with /
    const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
    const response = await fetch(url, config);
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
    console.error('❌ API Error:', error);
    throw error;
  }
};

// --- AUTHENTICATION API ---
export const userAuth = {
  verifyCredentials: (phoneNumber, password, name) => 
    apiCall('/auth/user/verify-credentials', 'POST', { phoneNumber, password, name }),
  getProfile: (token) => apiCall('/auth/user/profile', 'GET', null, token),
  updateProfile: (profileData, token) => apiCall('/auth/user/profile', 'PUT', profileData, token),
  adminLogin: (email, password) => apiCall('/auth/admin/login', 'POST', { email, password }),
};

export const adminAuth = {
  login: (email, password) => apiCall('/auth/admin/login', 'POST', { email, password }),
  createAdmin: (adminData, token) => apiCall('/auth/admin/create', 'POST', adminData, token),
  getProfile: (token) => apiCall('/auth/admin/profile', 'GET', null, token),
  updateProfile: (profileData, token) => apiCall('/auth/admin/profile', 'PUT', profileData, token),
  changePassword: (passwords, token) => apiCall('/auth/admin/change-password', 'POST', passwords, token),
};

// --- PRODUCTS API ---
export const products = {
  getAll: () => apiCall('/products', 'GET'),
  getByCategory: (categoryId) => apiCall(`/products/category/${categoryId}`, 'GET'),
  getById: (id) => apiCall(`/products/${id}`, 'GET'),
  create: (productData, token) => apiCall('/products', 'POST', productData, token),
  update: (id, productData, token) => apiCall(`/products/${id}`, 'PUT', productData, token),
  delete: (id, token) => apiCall(`/products/${id}`, 'DELETE', null, token),
};

// --- CATEGORIES API ---
export const categories = {
  getAll: () => apiCall('/categories', 'GET'),
  getById: (categoryId) => apiCall(`/categories/${categoryId}`, 'GET'),
  create: (categoryData, token) => apiCall('/categories', 'POST', categoryData, token),
  update: (categoryId, categoryData, token) => apiCall(`/categories/${categoryId}`, 'PUT', categoryData, token),
  delete: (categoryId, token) => apiCall(`/categories/${categoryId}`, 'DELETE', null, token),
  addToShowcase: (categoryId, productId, token) => apiCall(`/categories/${categoryId}/showcase/${productId}`, 'POST', {}, token),
  removeFromShowcase: (categoryId, productId, token) => apiCall(`/categories/${categoryId}/showcase/${productId}`, 'DELETE', null, token),
  addProduct: (categoryId, productId, token) => apiCall(`/categories/${categoryId}/products/${productId}`, 'POST', {}, token),
  removeProduct: (categoryId, productId, token) => apiCall(`/categories/${categoryId}/products/${productId}`, 'DELETE', null, token),
};

// --- ORDERS API ---
export const orders = {
  create: (orderData, token) => apiCall('/orders/create', 'POST', orderData, token),
  getMyOrders: (token) => apiCall('/orders/my-orders', 'GET', null, token),
  getById: (id, token) => apiCall(`/orders/${id}`, 'GET', null, token),
  uploadImages: (orderId, images, token) => apiCall(`/orders/${orderId}/upload-images`, 'POST', { images }, token),
  
  // Admin Endpoints
  getAll: (filters, token) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/orders/admin/orders?${params}`, 'GET', null, token);
  },
  getAdminById: (id, token) => apiCall(`/orders/admin/orders/${id}`, 'GET', null, token),
  updateStatus: (id, statusData, token) => apiCall(`/orders/admin/orders/${id}/status`, 'PUT', statusData, token),
  getImages: (id, token) => apiCall(`/orders/admin/orders/${id}/images`, 'GET', null, token),
  addNotes: (id, notes, token) => apiCall(`/orders/admin/orders/${id}/notes`, 'PUT', { notes }, token),
  triggerShipment: (id, token) => apiCall(`/orders/admin/orders/${id}/ship`, 'POST', {}, token),
};

export default { userAuth, adminAuth, products, categories, orders };
