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
    <div className="min-h-screen bg-gradient-to-br from-brand-primary via-white to-brand-secondary/5 flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-brand-accent/5 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-brand-secondary/5 rounded-full blur-3xl -z-10"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-0">
          <div className="flex justify-center transform transition-transform duration-500 hover:scale-105">
            <div>
              <h1 className="text-5xl font-serif font-bold text-brand-primary mb-1">Infinity</h1>
              <p className="text-xs font-semibold text-brand-secondary tracking-widest">CUSTOMIZATIONS</p>
            </div>
          </div>
          <p className="text-brand-primary/70 font-light text-sm tracking-wide mt-6">Access your account to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-border-light backdrop-blur-sm hover:shadow-xl transition-all duration-300 mt-10">
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Name Field */}
            <div>
              <label className="block text-sm font-semibold text-brand-primary mb-2 flex items-center gap-2">
                <User className="w-4 h-4 text-brand-secondary" />
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                disabled={loading}
                className="w-full px-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 disabled:bg-surface-elevated disabled:text-brand-primary/50 transition-all duration-200 text-sm font-medium placeholder:text-brand-primary/40"
              />
            </div>

            {/* Phone Number Field */}
            <div>
              <label className="block text-sm font-semibold text-brand-primary mb-2 flex items-center gap-2">
                <Phone className="w-4 h-4 text-brand-secondary" />
                Phone Number
              </label>
              <div className="relative group">
                <span className="absolute left-4 top-3 text-brand-primary/40 font-semibold group-focus-within:text-brand-secondary transition-colors">+91</span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  placeholder="9876543210"
                  maxLength="10"
                  disabled={loading}
                  className="w-full pl-12 pr-4 py-3 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 disabled:bg-surface-elevated disabled:text-brand-primary/50 transition-all duration-200 text-sm font-medium placeholder:text-brand-primary/40"
                />
              </div>
              <p className="text-xs text-brand-primary/50 mt-1.5">Indian mobile number</p>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-semibold text-brand-primary mb-2 flex items-center gap-2">
                <Lock className="w-4 h-4 text-brand-secondary" />
                Password
              </label>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  disabled={loading}
                  className="w-full px-4 py-3 pr-12 border-2 border-border-light rounded-lg focus:outline-none focus:border-brand-secondary focus:ring-2 focus:ring-brand-secondary/20 disabled:bg-surface-elevated disabled:text-brand-primary/50 transition-all duration-200 text-sm font-medium placeholder:text-brand-primary/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-brand-primary/40 hover:text-brand-secondary transition-colors duration-200"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <p className="text-xs text-brand-primary/50 mt-1.5">Minimum 4 characters</p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3 animate-slideIn">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700 font-medium">{error}</p>
              </div>
            )}

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start gap-3 animate-slideIn">
                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-green-700 font-medium">{success}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || phoneNumber.length !== 10 || !password || !name}
              className="w-full bg-brand-secondary hover:bg-brand-secondary/90 disabled:bg-border-light disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 shadow-md hover:shadow-lg disabled:shadow-none"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Authenticating...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Login</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-brand-primary/60 mt-8 px-4 leading-relaxed font-light">
          By signing in, you agree to our{' '}
          <Link to="#" className="text-brand-secondary hover:text-brand-secondary/80 font-semibold transition-colors duration-200">
            Terms of Service
          </Link>
          {' '}and{' '}
          <Link to="#" className="text-brand-secondary hover:text-brand-secondary/80 font-semibold transition-colors duration-200">
            Privacy Policy
          </Link>
        </p>

        {/* Security Badge */}
        <div className="flex items-center justify-center gap-2 mt-6 text-xs text-brand-primary/50">
          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
          <span>Secured with encryption</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
