import React, { createContext, useContext, useState, useEffect } from 'react';
import { userAuth } from '../services/api';

// Create Auth Context
const AuthContext = createContext();

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);
  const [adminToken, setAdminToken] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('userToken');
    const storedUser = localStorage.getItem('user');
    const storedAdminToken = localStorage.getItem('adminToken');
    const storedAdmin = localStorage.getItem('admin');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }

    if (storedAdminToken && storedAdmin) {
      setAdminToken(storedAdminToken);
      setAdmin(JSON.parse(storedAdmin));
    }

    setLoading(false);
  }, []);

  // Login with phone, password and name (Direct - No OTP)
  const verifyCredentials = async (phoneNumber, password, name) => {
    try {
      setLoading(true);
      const response = await userAuth.verifyCredentials(phoneNumber, password, name);

      const { token: newToken, user: userData } = response;

      // Store in localStorage
      localStorage.setItem('userToken', newToken);
      localStorage.setItem('user', JSON.stringify(userData));

      // Update state
      setToken(newToken);
      setUser(userData);
      setIsAuthenticated(true);

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Legacy endpoints (kept for compatibility, not used anymore)
  const verifyOTP = async (phoneNumber, otp) => {
    return { success: true, message: 'OTP system removed' };
  };

  const completeRegistration = async (phoneNumber, name) => {
    return { success: true, message: 'OTP system removed' };
  };

  // Login function (legacy - kept for compatibility)
  const login = async (phoneNumber, otp) => {
    return verifyOTP(phoneNumber, otp);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('userToken');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  };

  // Request OTP
  const requestOTP = async (phoneNumber) => {
    try {
      const response = await userAuth.requestOTP(phoneNumber);
      return { success: true, message: response.message };
    } catch (error) {
      console.error('OTP request error:', error);
      return { success: false, error: error.message };
    }
  };

  // Update profile
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await userAuth.updateProfile(profileData, token);

      const updatedUser = { ...user, ...profileData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Profile update error:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Admin Login
  const loginAdmin = async (email, password) => {
    try {
      setLoading(true);
      console.log('🔑 Starting admin login for:', email);
      const response = await userAuth.adminLogin(email, password);
      console.log('✅ Admin login response:', response);

      const { token: newAdminToken, admin: adminData } = response;

      if (!newAdminToken || !adminData) {
        console.error('❌ Missing token or admin data in response:', { newAdminToken, adminData });
        return { success: false, error: 'Invalid response from server' };
      }

      // Store in localStorage
      localStorage.setItem('adminToken', newAdminToken);
      localStorage.setItem('admin', JSON.stringify(adminData));

      // Update state
      setAdminToken(newAdminToken);
      setAdmin(adminData);

      return { success: true, admin: adminData };
    } catch (error) {
      console.error('❌ Admin login error:', error);
      console.log('Error details:', {
        status: error.status,
        message: error.message,
        data: error.data
      });
      return { success: false, error: error.message || 'Invalid credentials' };
    } finally {
      setLoading(false);
    }
  };

  // Admin Logout
  const logoutAdmin = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('admin');
    setAdminToken(null);
    setAdmin(null);
  };

  const value = {
    user,
    admin,
    token,
    adminToken,
    loading,
    isAuthenticated,
    login,
    logout,
    loginAdmin,
    logoutAdmin,
    requestOTP,
    updateProfile,
    verifyCredentials,
    verifyOTP,
    completeRegistration,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
