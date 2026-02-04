import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Phone, Mail, MapPin, LogOut, Edit2, Save, X, Loader, AlertCircle, CheckCircle } from 'lucide-react';
import BackButton from '../components/BackButton';
import { useAuth } from '../contexts/AuthContext';

const UserProfile = () => {
  const navigate = useNavigate();
  const { user, token, logout, updateProfile, isAuthenticated, loading: authLoading } = useAuth();

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
    address: user?.address || '',
    city: user?.city || '',
    state: user?.state || '',
    pincode: user?.pincode || '',
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate('/login');
    }
  }, [authLoading, isAuthenticated, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      setLoading(true);
      const response = await updateProfile(formData);

      if (response.success) {
        setSuccess('Profile updated successfully!');
        setIsEditing(false);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError(response.error || 'Failed to update profile');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-blue/5 to-brand-gold/5">
        <Loader className="w-8 h-8 animate-spin text-brand-blue" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue/5 to-brand-gold/5 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="mb-2"><BackButton to="/" /></div>
          <h1 className="text-4xl font-serif font-bold text-brand-blue">
            My Profile
          </h1>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border border-brand-gold/20">
          {/* Profile Header */}
          <div className="bg-gradient-to-r from-brand-blue to-brand-blue/80 text-white p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center border-2 border-white">
                <User className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">{formData.name || 'User'}</h2>
                <p className="text-brand-gold/80 text-sm">+91 {formData.phoneNumber}</p>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2 items-center w-full md:w-auto">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="w-full md:w-auto bg-white text-brand-blue hover:bg-brand-gold/20 font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full md:w-auto bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="bg-red-50 border-b border-red-200 p-4 flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border-b border-green-200 p-4 flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{success}</p>
            </div>
          )}

          {/* Profile Form */}
          <form onSubmit={handleSave} className="p-8">
            {/* Name */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-brand-blue mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="John Doe"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-semibold text-brand-blue mb-2 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="john@example.com"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            {/* Phone Number (Read-only) */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-brand-blue mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <input
                type="text"
                value={`+91 ${formData.phoneNumber}`}
                disabled
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-2">Phone number cannot be changed</p>
            </div>

            {/* Address */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-brand-blue mb-2 flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Street Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={!isEditing}
                placeholder="123 Main Street"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue disabled:bg-gray-50 disabled:text-gray-500"
              />
            </div>

            {/* City, State, Pincode */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label className="block text-sm font-semibold text-brand-blue mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Mumbai"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-blue mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="Maharashtra"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-brand-blue mb-2">Pincode</label>
                <input
                  type="text"
                  name="pincode"
                  value={formData.pincode}
                  onChange={handleChange}
                  disabled={!isEditing}
                  placeholder="400001"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-brand-blue disabled:bg-gray-50 disabled:text-gray-500"
                />
              </div>
            </div>

            {/* Buttons */}
            {isEditing && (
              <div className="flex flex-col md:flex-row gap-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full md:flex-1 bg-brand-blue hover:bg-brand-blue/90 disabled:bg-gray-300 text-white font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false);
                    setFormData({
                      name: user?.name || '',
                      email: user?.email || '',
                      phoneNumber: user?.phoneNumber || '',
                      address: user?.address || '',
                      city: user?.city || '',
                      state: user?.state || '',
                      pincode: user?.pincode || '',
                    });
                    setError('');
                    setSuccess('');
                  }}
                  className="w-full md:flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </form>

          {/* Account Info */}
          <div className="bg-gray-50 border-t border-gray-200 p-8">
            <h3 className="font-semibold text-brand-blue mb-4">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-sm">
              <div>
                <p className="text-gray-600 mb-1">Account Type</p>
                <p className="font-semibold text-brand-blue capitalize">{user?.role || 'user'}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Status</p>
                <p className="font-semibold text-green-600">{user?.isVerified ? '✓ Verified' : 'Pending'}</p>
              </div>
              <div>
                <p className="text-gray-600 mb-1">Member Since</p>
                <p className="font-semibold text-brand-blue">
                  {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            to="/orders"
            className="bg-white border-2 border-brand-blue/20 hover:border-brand-blue rounded-lg p-4 text-center hover:shadow-lg transition-all"
          >
            <p className="text-2xl mb-2">📦</p>
            <p className="text-sm font-semibold text-brand-blue">My Orders</p>
          </Link>
          <Link
            to="/cart"
            className="bg-white border-2 border-brand-blue/20 hover:border-brand-blue rounded-lg p-4 text-center hover:shadow-lg transition-all"
          >
            <p className="text-2xl mb-2">🛒</p>
            <p className="text-sm font-semibold text-brand-blue">Shopping Cart</p>
          </Link>
          <Link
            to="/shop"
            className="bg-white border-2 border-brand-blue/20 hover:border-brand-blue rounded-lg p-4 text-center hover:shadow-lg transition-all"
          >
            <p className="text-2xl mb-2">🛍️</p>
            <p className="text-sm font-semibold text-brand-blue">Continue Shopping</p>
          </Link>
          <button
            onClick={handleLogout}
            className="bg-red-50 border-2 border-red-200 hover:border-red-400 rounded-lg p-4 text-center hover:shadow-lg transition-all"
          >
            <p className="text-2xl mb-2">🚪</p>
            <p className="text-sm font-semibold text-red-600">Logout</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
