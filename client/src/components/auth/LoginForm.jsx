
import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const LoginForm = ({ onSuccess, switchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      await login(formData.email, formData.password);
      onSuccess && onSuccess();
    } catch (error) {
      setErrors({ 
        submit: error.message || 'Login failed. Please try again.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (email, password) => {
    setFormData({ email, password });
    // Auto-submit after setting values
    setTimeout(() => {
      const submitEvent = { preventDefault: () => {} };
      handleSubmit(submitEvent);
    }, 100);
  };

  return (
    <div className="w-full max-w-md mx-auto p-8">
      {/* Enhanced Header with 3D Icon */}
      <div className="text-center mb-10">
        <div className="relative inline-block mb-6 group">
          {/* 3D shadow layers */}
          <div className="absolute inset-0 transform translate-x-2 translate-y-2 opacity-20">
            <div 
              className="w-20 h-20 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #ED1B2F, #455185)' }}
            ></div>
          </div>
          <div className="absolute inset-0 transform translate-x-1 translate-y-1 opacity-40">
            <div 
              className="w-20 h-20 rounded-2xl"
              style={{ background: 'linear-gradient(135deg, #ED1B2F, #455185)' }}
            ></div>
          </div>
          
          <div 
            className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500"
            style={{ background: 'linear-gradient(135deg, #ED1B2F, #455185)' }}
          >
            <svg className="w-10 h-10 text-white transform group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
        </div>
        
        <h2 
          className="text-4xl font-black mb-3 tracking-tight"
          style={{ 
            backgroundImage: 'linear-gradient(135deg, #ED1B2F, #455185)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}
        >
          Welcome Back
        </h2>
        <p className="text-gray-300 text-lg font-light">Sign in to your account</p>
      </div>

      {/* Enhanced Quick Login Buttons */}
      <div className="mb-8 space-y-3">
        <p className="text-sm text-gray-300 text-center mb-4 font-medium">Quick Login:</p>
        <div className="space-y-3">
          <button
            onClick={() => handleQuickLogin('admin@test.com', 'admin123')}
            className="w-full relative overflow-hidden group"
            disabled={loading}
          >
            <div 
              className="absolute inset-0 opacity-20 rounded-xl transition-opacity duration-300 group-hover:opacity-30"
              style={{ background: 'linear-gradient(135deg, #ED1B2F, #455185)' }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div 
              className="relative border py-4 px-6 rounded-xl text-left transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl backdrop-blur-sm"
              style={{ borderColor: 'rgba(237, 27, 47, 0.3)' }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👑</span>
                <div>
                  <p className="font-semibold text-red-300">Login as Admin/Recruiter</p>
                  <p className="text-xs text-gray-400">Full system access</p>
                </div>
              </div>
            </div>
          </button>
          
          <button
            onClick={() => handleQuickLogin('user@test.com', 'user123')}
            className="w-full relative overflow-hidden group"
            disabled={loading}
          >
            <div 
              className="absolute inset-0 opacity-20 rounded-xl transition-opacity duration-300 group-hover:opacity-30"
              style={{ background: 'linear-gradient(135deg, #455185, #ED1B2F)' }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <div 
              className="relative border py-4 px-6 rounded-xl text-left transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl backdrop-blur-sm"
              style={{ borderColor: 'rgba(69, 81, 133, 0.3)' }}
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">👤</span>
                <div>
                  <p className="font-semibold text-blue-300">Login as Job Seeker</p>
                  <p className="text-xs text-gray-400">Apply for positions</p>
                </div>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Enhanced Divider */}
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-white/20"></div>
        </div>
        <div className="relative flex justify-center text-sm">
          <span className="px-4 bg-gray-900/50 text-gray-400 font-medium backdrop-blur-sm rounded-full">
            Or continue with email
          </span>
        </div>
      </div>

      {/* Enhanced Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Enhanced Email Field */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full px-4 py-4 rounded-xl border-2 bg-white/5 backdrop-blur-sm text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-0 group-hover:bg-white/10 ${
                errors.email 
                  ? 'border-red-400 focus:border-red-500 shadow-lg shadow-red-500/20' 
                  : 'border-white/20 focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/20'
              }`}
              placeholder="Enter your email"
              disabled={loading}
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>
          {errors.email && (
            <p className="mt-2 text-sm text-red-400 font-medium animate-pulse">{errors.email}</p>
          )}
        </div>

        {/* Enhanced Password Field */}
        <div className="group">
          <label className="block text-sm font-semibold text-gray-300 mb-3">
            Password
          </label>
          <div className="relative">
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full px-4 py-4 rounded-xl border-2 bg-white/5 backdrop-blur-sm text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:ring-0 group-hover:bg-white/10 ${
                errors.password 
                  ? 'border-red-400 focus:border-red-500 shadow-lg shadow-red-500/20' 
                  : 'border-white/20 focus:border-blue-400 focus:shadow-lg focus:shadow-blue-500/20'
              }`}
              placeholder="Enter your password"
              disabled={loading}
            />
            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-300 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          {errors.password && (
            <p className="mt-2 text-sm text-red-400 font-medium animate-pulse">{errors.password}</p>
          )}
        </div>

        {/* Enhanced Submit Error */}
        {errors.submit && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 backdrop-blur-sm">
            <p className="text-sm text-red-300 font-medium">{errors.submit}</p>
          </div>
        )}

        {/* Enhanced Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-4 px-6 rounded-xl font-bold text-white transition-all duration-500 transform relative overflow-hidden group ${
            loading
              ? 'cursor-not-allowed opacity-50'
              : 'hover:scale-105 hover:shadow-2xl active:scale-95'
          }`}
          style={{ 
            background: loading ? '#6b7280' : 'linear-gradient(135deg, #ED1B2F, #455185)',
            boxShadow: loading ? 'none' : '0 10px 30px rgba(237, 27, 47, 0.3)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          <div className="relative flex items-center justify-center">
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing In...
              </>
            ) : (
              <>
                <span className="mr-2">🚀</span>
                Sign In
              </>
            )}
          </div>
        </button>

        {/* Enhanced Switch to Register */}
        <div className="text-center pt-6 border-t border-white/10">
          <p className="text-gray-300 font-medium">
            Don't have an account?{' '}
            <button
              type="button"
              onClick={switchToRegister}
              className="relative font-bold transition-all duration-300 group inline-block"
              style={{ color: '#ED1B2F' }}
            >
              Create Account
              <div 
                className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                style={{ background: 'linear-gradient(90deg, #ED1B2F, #455185)' }}
              ></div>
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
