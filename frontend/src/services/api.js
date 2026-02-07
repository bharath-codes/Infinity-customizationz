// API Service - Central hub for all API calls
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://infinity-customizations.onrender.com/api'; // environment-aware API base URL

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
    let response;
    try {
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    } catch (networkErr) {
      await new Promise(r => setTimeout(r, 1200));
      response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    }
    const responseText = await response.text();
    
    let result;
    try {
      result = JSON.parse(responseText);
    } catch (e) {
      console.error('JSON Parse Error - Response is not valid JSON:', {
        endpoint,
        status: response.status,
        responseText: responseText.substring(0, 200),
        error: e.message
      });
      throw {
        status: response.status,
        message: `Server error: ${response.statusText || 'Unknown error'}`,
        data: { error: 'Invalid JSON response' }
      };
    }

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
    if (error && error.message === 'Failed to fetch') {
      throw { message: 'Network error. Check your connection and that the API server is running.', status: 0, data: error };
    }
    throw error;
  }
};

// --- USER AUTHENTICATION API ---
export const userAuth = {
  verifyCredentials: async (phoneNumber, password, name) => {
    return apiCall('/auth/user/verify-credentials', 'POST', { phoneNumber, password, name });
  },
  verifyOTP: async (phoneNumber, otp) => {
    return { success: true, message: 'OTP system removed' };
  },
  completeRegistration: async (phoneNumber, name) => {
    return { success: true, message: 'OTP system removed' };
  },
  requestOTP: async (phoneNumber) => {
    return apiCall('/auth/user/verify-credentials', 'POST', { phoneNumber, password: '' });
  },
  getProfile: async (token) => {
    return apiCall('/auth/user/profile', 'GET', null, token);
  },
  updateProfile: async (profileData, token) => {
    return apiCall('/auth/user/profile', 'PUT', profileData, token);
  },
  adminLogin: async (email, password) => {
    return apiCall('/auth/admin/login', 'POST', { email, password });
  },
};

// --- ADMIN AUTHENTICATION API ---
export const adminAuth = {
  login: async (email, password) => {
    return apiCall('/auth/admin/login', 'POST', { email, password });
  },
  createAdmin: async (adminData, token) => {
    return apiCall('/auth/admin/create', 'POST', adminData, token);
  },
  getProfile: async (token) => {
    return apiCall('/auth/admin/profile', 'GET', null, token);
  },
  updateProfile: async (profileData, token) => {
    return apiCall('/auth/admin/profile', 'PUT', profileData, token);
  },
  changePassword: async (passwords, token) => {
    return apiCall('/auth/admin/change-password', 'POST', passwords, token);
  },
};

// --- PRODUCTS API ---
export const products = {
  getAll: async () => {
    return apiCall('/products', 'GET');
  },
  getByCategory: async (categoryId) => {
    return apiCall(`/products/category/${categoryId}`, 'GET');
  },
  getById: async (id) => {
    return apiCall(`/products/${id}`, 'GET');
  },
  create: async (productData, token) => {
    return apiCall('/products', 'POST', productData, token);
  },
  update: async (id, productData, token) => {
    return apiCall(`/products/${id}`, 'PUT', productData, token);
  },
  delete: async (id, token) => {
    return apiCall(`/products/${id}`, 'DELETE', null, token);
  },
  // Reviews
  getReviews: async (productId) => {
    return apiCall(`/products/${productId}/reviews`, 'GET');
  },
  addReview: async (productId, review) => {
    return apiCall(`/products/${productId}/reviews`, 'POST', review);
  },
};

// --- CATEGORIES API ---
export const categories = {
  getAll: async () => {
    return apiCall('/categories', 'GET');
  },
  getById: async (categoryId) => {
    return apiCall(`/categories/${categoryId}`, 'GET');
  },
  create: async (categoryData, token) => {
    return apiCall('/categories', 'POST', categoryData, token);
  },
  update: async (categoryId, categoryData, token) => {
    return apiCall(`/categories/${categoryId}`, 'PUT', categoryData, token);
  },
  delete: async (categoryId, token) => {
    return apiCall(`/categories/${categoryId}`, 'DELETE', null, token);
  },
  addToShowcase: async (categoryId, productId, token) => {
    return apiCall(`/categories/${categoryId}/showcase/${productId}`, 'POST', {}, token);
  },
  removeFromShowcase: async (categoryId, productId, token) => {
    return apiCall(`/categories/${categoryId}/showcase/${productId}`, 'DELETE', null, token);
  },
  addProduct: async (categoryId, productId, token) => {
    return apiCall(`/categories/${categoryId}/products/${productId}`, 'POST', {}, token);
  },
  removeProduct: async (categoryId, productId, token) => {
    return apiCall(`/categories/${categoryId}/products/${productId}`, 'DELETE', null, token);
  },
  updateShowcaseImages: async (categoryId, images, token) => {
    return apiCall(`/categories/${categoryId}/showcase-images`, 'PUT', { images }, token);
  },
};

// --- ORDERS API ---
export const orders = {
  create: async (orderData, token) => {
    return apiCall('/orders/create', 'POST', orderData, token);
  },
  getMyOrders: async (token) => {
    return apiCall('/orders/my-orders', 'GET', null, token);
  },
  getById: async (id, token) => {
    return apiCall(`/orders/${id}`, 'GET', null, token);
  },
  uploadImages: async (orderId, images, token) => {
    return apiCall(`/orders/${orderId}/upload-images`, 'POST', { images }, token);
  },
  getAll: async (filters, token) => {
    const params = new URLSearchParams(filters).toString();
    return apiCall(`/orders/admin/orders?${params}`, 'GET', null, token);
  },
  getAdminById: async (id, token) => {
    return apiCall(`/orders/admin/orders/${id}`, 'GET', null, token);
  },
  updateStatus: async (id, statusData, token) => {
    return apiCall(`/orders/admin/orders/${id}/status`, 'PUT', statusData, token);
  },
  getImages: async (id, token) => {
    return apiCall(`/orders/admin/orders/${id}/images`, 'GET', null, token);
  },
  addNotes: async (id, notes, token) => {
    return apiCall(`/orders/admin/orders/${id}/notes`, 'PUT', { notes }, token);
  },
  triggerShipment: async (id, token) => {
    return apiCall(`/orders/admin/orders/${id}/ship`, 'POST', {}, token);
  },
};

export default { userAuth, adminAuth, products, categories, orders };
