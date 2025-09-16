
import React, { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';

const AuthPage = ({ onSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);

  const switchToLogin = () => setIsLogin(true);
  const switchToRegister = () => setIsLogin(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-900 relative overflow-hidden">
      {/* Enhanced 3D Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Main gradient orbs with brand colors */}
        <div 
          className="absolute top-10 left-10 w-96 h-96 rounded-full blur-3xl animate-pulse opacity-20"
          style={{
            background: 'radial-gradient(circle, #ED1B2F 0%, transparent 70%)',
            animationDuration: '4s'
          }}
        ></div>
        <div 
          className="absolute top-1/3 right-10 w-80 h-80 rounded-full blur-3xl animate-pulse opacity-25"
          style={{
            background: 'radial-gradient(circle, #455185 0%, transparent 70%)',
            animationDelay: '2s',
            animationDuration: '5s'
          }}
        ></div>
        <div 
          className="absolute bottom-20 left-1/3 w-72 h-72 rounded-full blur-3xl animate-pulse opacity-20"
          style={{
            background: 'radial-gradient(circle, #ED1B2F 20%, #455185 80%)',
            animationDelay: '1s',
            animationDuration: '6s'
          }}
        ></div>
        
        {/* Floating particles */}
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-float"
              style={{
                background: i % 2 === 0 ? '#ED1B2F' : '#455185',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            ></div>
          ))}
        </div>

        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      {/* Modern Glassmorphism Navbar */}
      <nav className="relative z-20 bg-white/5 backdrop-blur-xl border-b border-white/10 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center space-x-4 group">
              <div className="relative">
                <div 
                  className="absolute inset-0 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300"
                  style={{ background: 'linear-gradient(135deg, #ED1B2F, #455185)' }}
                ></div>
                <div className="relative text-4xl p-2 bg-white/10 rounded-2xl backdrop-blur-sm transform group-hover:scale-110 transition-transform duration-300">
                  🎯
                </div>
              </div>
              <div>
                <div 
                  className="text-3xl font-black bg-gradient-to-r from-red-400 to-blue-400 bg-clip-text text-transparent"
                  style={{ 
                    backgroundImage: 'linear-gradient(135deg, #ED1B2F, #455185)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}
                >
                  ATS Pro
                </div>
                <div className="text-xs text-gray-400 font-semibold tracking-wider">
                  SMART HIRING PLATFORM
                </div>
              </div>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {['Features', 'About', 'Contact'].map((item, index) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  className="relative text-gray-300 hover:text-white transition-all duration-300 group font-medium"
                >
                  {item}
                  <div 
                    className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                    style={{ background: 'linear-gradient(90deg, #ED1B2F, #455185)' }}
                  ></div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with 3D Card */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4 pt-0">
        <div className="w-full max-w-md">
          {/* 3D Brand Logo Section */}
          <div className="text-center mb-12 transform-gpu">
            <div className="relative inline-block group">
              {/* 3D Shadow layers */}
              <div className="absolute inset-0 transform translate-x-2 translate-y-2 opacity-20">
                <div 
                  className="w-24 h-24 rounded-3xl shadow-2xl"
                  style={{ background: 'linear-gradient(135deg, #ED1B2F, #455185)' }}
                ></div>
              </div>
              <div className="absolute inset-0 transform translate-x-1 translate-y-1 opacity-40">
                <div 
                  className="w-24 h-24 rounded-3xl shadow-xl"
                  style={{ background: 'linear-gradient(135deg, #ED1B2F, #455185)' }}
                ></div>
              </div>
              
              {/* Main logo */}
              <div 
                className="relative w-24 h-24 rounded-3xl shadow-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500 mx-auto mb-6"
                style={{ background: 'linear-gradient(135deg, #ED1B2F, #455185)' }}
              >
                <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6m0 0v6m0-6H8m0 0V6v6" />
                  </svg>
                </div>
              </div>
            </div>
            
            <h1 
              className="text-5xl md:text-6xl font-black mb-4 tracking-tight"
              style={{ 
                backgroundImage: 'linear-gradient(135deg, #ED1B2F 0%, #455185 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 30px rgba(237, 27, 47, 0.3)'
              }}
            >
              Welcome to ATS Pro
            </h1>
            <p className="text-xl text-gray-300 font-light tracking-wide">
              Advanced Talent Management System
            </p>
            
            {/* Enhanced Test Credentials with 3D Cards */}
            <div className="mt-8 p-6 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
              <h3 className="text-white font-bold mb-4 text-lg">🚀 Test Login Credentials</h3>
              <div className="space-y-3 text-sm">
                <div 
                  className="relative overflow-hidden p-4 rounded-2xl border backdrop-blur-sm transform hover:scale-105 transition-all duration-300 cursor-pointer group"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(237, 27, 47, 0.1), rgba(237, 27, 47, 0.05))',
                    borderColor: 'rgba(237, 27, 47, 0.3)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative">
                    <p className="text-red-300 font-semibold flex items-center">
                      <span className="text-xl mr-2">👑</span>
                      Admin/Recruiter
                    </p>
                    <p className="text-gray-300 flex items-center mt-1">
                      <span className="mr-2">📧</span>
                      admin@test.com
                    </p>
                    <p className="text-gray-300 flex items-center mt-1">
                      <span className="mr-2">🔑</span>
                      admin123
                    </p>
                  </div>
                </div>
                
                <div 
                  className="relative overflow-hidden p-4 rounded-2xl border backdrop-blur-sm transform hover:scale-105 transition-all duration-300 cursor-pointer group"
                  style={{ 
                    background: 'linear-gradient(135deg, rgba(69, 81, 133, 0.1), rgba(69, 81, 133, 0.05))',
                    borderColor: 'rgba(69, 81, 133, 0.3)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  <div className="relative">
                    <p className="text-blue-300 font-semibold flex items-center">
                      <span className="text-xl mr-2">👤</span>
                      Job Seeker
                    </p>
                    <p className="text-gray-300 flex items-center mt-1">
                      <span className="mr-2">📧</span>
                      user@test.com
                    </p>
                    <p className="text-gray-300 flex items-center mt-1">
                      <span className="mr-2">🔑</span>
                      user123
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Auth Forms with 3D Effect */}
          <div className="relative group">
            {/* 3D shadow layers for form */}
            <div className="absolute inset-0 transform translate-x-3 translate-y-3 bg-black/20 rounded-3xl blur-xl"></div>
            <div className="absolute inset-0 transform translate-x-1.5 translate-y-1.5 bg-black/10 rounded-3xl blur-lg"></div>
            
            <div className="relative bg-white/10 backdrop-blur-2xl rounded-3xl border border-white/20 shadow-2xl transform group-hover:scale-[1.02] transition-all duration-500">
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
        </div>
      </div>

      {/* Enhanced Footer with Glassmorphism */}
      <footer className="relative z-10 bg-white/5 backdrop-blur-xl border-t border-white/10 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <p className="text-gray-300 font-medium text-lg">© 2024 ATS Pro. All rights reserved.</p>
              <p className="text-gray-400 text-sm mt-1">Streamlining recruitment with AI-powered insights.</p>
            </div>
            <div className="flex space-x-8 text-sm">
              {['Privacy', 'Terms', 'Support'].map((item) => (
                <a 
                  key={item}
                  href={`#${item.toLowerCase()}`} 
                  className="text-gray-400 hover:text-white transition-colors duration-300 relative group font-medium"
                >
                  {item}
                  <div 
                    className="absolute bottom-0 left-0 w-0 h-0.5 group-hover:w-full transition-all duration-300"
                    style={{ background: 'linear-gradient(90deg, #ED1B2F, #455185)' }}
                  ></div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
          background-size: 50px 50px;
        }

        /* 3D Transform utilities */
        .transform-gpu {
          transform: translateZ(0);
        }

        /* Enhanced hover effects */
        .hover\\:scale-\\[1\\.02\\]:hover {
          transform: scale(1.02);
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;
