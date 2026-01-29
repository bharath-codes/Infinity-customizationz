import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Phone, Lock, User, AlertCircle, CheckCircle, Loader, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Login = () => {
  const navigate = useNavigate();
  const { verifyCredentials } = useAuth();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Login with Phone, Password & Name
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
      setError('Please enter a valid 10-digit Indian phone number');
      return;
    }

    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    if (!name || name.trim().length < 2) {
      setError('Please enter a valid name');
      return;
    }

    try {
      setLoading(true);
      const response = await verifyCredentials(phoneNumber, password, name);

      if (response.success) {
        setSuccess('Login successful! Redirecting...');
        setTimeout(() => {
          navigate('/');
        }, 1500);
      } else {
        setError(response.error || 'Failed to login');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-blue via-white to-brand-gold/10 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-blue/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-0">
          <div className="flex justify-center transform transition-transform duration-500 hover:scale-110">
            <div>
              <h1 className="text-5xl font-bold text-brand-blue italic mb-0">Infinity</h1>
              <p className="text-xs font-semibold text-brand-blue tracking-widest">CUSTOMIZATIONS</p>
            </div>
          </div>
          <p className="text-gray-500 font-light text-sm tracking-wide mt-4">Welcome back to our collection</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100/80 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 mt-10">
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-brand-blue mb-3 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                disabled={loading}
                className="w-full px-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 text-sm font-medium placeholder:text-gray-400"
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-semibold text-brand-blue mb-3 flex items-center gap-2">
                <Phone className="w-4 h-4" />
                Phone Number
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-3.5 text-gray-400 font-semibold group-focus-within:text-brand-blue transition-colors">+91</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  maxLength="10"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3.5 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 text-sm font-medium placeholder:text-gray-400"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-brand-blue mb-3 flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="w-full px-4 py-3.5 pr-12 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-brand-blue focus:ring-2 focus:ring-brand-blue/20 disabled:bg-gray-50 disabled:text-gray-500 transition-all duration-200 text-sm font-medium placeholder:text-gray-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3.5 text-gray-400 hover:text-brand-blue transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-gray-400 mt-2">Use the same password each time to login</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-gradient-to-r from-red-50 to-red-50/50 border border-red-200 rounded-xl p-4 flex items-start gap-3 animate-slideIn shadow-sm">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-gradient-to-r from-green-50 to-green-50/50 border border-green-200 rounded-xl p-4 flex items-start gap-3 animate-slideIn shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 font-medium">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || phoneNumber.length !== 10 || !password || !name}
              className="w-full bg-gradient-to-r from-brand-blue to-brand-blue/80 hover:from-brand-blue hover:to-brand-blue disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 active:scale-95"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Login
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-gray-400 mt-8 px-4 leading-relaxed">
          By logging in, you agree to our{' '}
          <Link to="#" className="text-brand-blue hover:text-brand-gold font-semibold transition-colors">
            Terms & Conditions
          </Link>
          {' '}and{' '}
          <Link to="#" className="text-brand-blue hover:text-brand-gold font-semibold transition-colors">
            Privacy Policy
          </Link>
        </p>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-gray-400">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          <span>Secured & Encrypted</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
