
import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const AuthPage = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToLogin = () => setIsLogin(true);
  const switchToRegister = () => setIsLogin(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-80 h-80 bg-gradient-to-br from-pink-400/10 to-red-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-72 h-72 bg-gradient-to-br from-green-400/10 to-cyan-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      {/* Header/Navbar */}
      <nav className="relative z-10 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="text-3xl">🎯</div>
              <div>
                <div className="text-2xl font-black bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
                  ATS Pro
                </div>
                <div className="text-xs text-gray-400 font-medium">Smart Hiring Platform</div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-6">
              <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
              <a href="#about" className="text-gray-300 hover:text-white transition-colors">About</a>
              <a href="#contact" className="text-gray-300 hover:text-white transition-colors">Contact</a>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 pt-0">
        <div className="w-full max-w-md">
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full shadow-lg mb-4">
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6m0 0v6m0-6H8m0 0V6v6" />
                </svg>
              </div>
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
              Welcome to ATS Pro
            </h1>
            <p className="text-gray-300 mt-2">Advanced Talent Management System</p>
            
            {/* Test Credentials Display */}
            <div className="mt-6 p-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
              <h3 className="text-white font-semibold mb-3">Test Login Credentials:</h3>
              <div className="space-y-2 text-sm">
                <div className="bg-blue-500/20 p-2 rounded-lg border border-blue-500/30">
                  <p className="text-blue-300 font-medium">👑 Admin/Recruiter:</p>
                  <p className="text-gray-300">📧 admin@test.com</p>
                  <p className="text-gray-300">🔑 admin123</p>
                </div>
                <div className="bg-green-500/20 p-2 rounded-lg border border-green-500/30">
                  <p className="text-green-300 font-medium">👤 Job Seeker:</p>
                  <p className="text-gray-300">📧 user@test.com</p>
                  <p className="text-gray-300">🔑 user123</p>
                </div>
              </div>
            </div>
          </div>

          {/* Auth Forms */}
          {isLogin ? (
            <LoginForm 
              onSuccess={onSuccess} 
              switchToRegister={switchToRegister}
            />
          ) : (
            <RegisterForm 
              onSuccess={onSuccess} 
              switchToLogin={switchToLogin}
            />
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="relative z-10 bg-white/10 backdrop-blur-md border-t border-white/20 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-300">© 2024 ATS Pro. All rights reserved.</p>
              <p className="text-gray-400 text-sm">Streamlining recruitment with AI-powered insights.</p>
            </div>
            <div className="flex space-x-6 text-sm text-gray-400">
              <a href="#privacy" className="hover:text-white transition-colors">Privacy</a>
              <a href="#terms" className="hover:text-white transition-colors">Terms</a>
              <a href="#support" className="hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AuthPage;
