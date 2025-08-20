
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/', icon: '🏠' },
    { name: 'ATS', href: '/ats', icon: '🎯' },
    { name: 'Analytics', href: '/analytics', icon: '📊' },
    { name: 'Jobs', href: '/jobs', icon: '💼' },
    { name: 'Candidates', href: '/candidates', icon: '👥' },
  ];

  const isActive = (href) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  return (
    <nav className="relative z-50 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="text-3xl group-hover:scale-110 transition-transform duration-300">🎯</div>
            <div>
              <div className="text-2xl font-black bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Akshay ATS Pro
              </div>
              <div className="text-xs text-gray-400 font-medium">Smart Hiring Platform</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  isActive(item.href)
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-300 hover:text-white hover:bg-white/10 hover:scale-105'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                <span>{item.name}</span>
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3 px-4 py-2 bg-white/10 rounded-full border border-white/20">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-300">Online</span>
            </div>
            
            <button className="flex items-center space-x-3 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 rounded-full text-white font-medium hover:from-purple-600 hover:to-pink-700 transition-all duration-300 hover:scale-105">
              <span className="text-lg">👤</span>
              <span className="hidden lg:block">Admin</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden flex items-center justify-center p-3 rounded-xl bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <span className="text-xl">{isOpen ? '✕' : '☰'}</span>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden py-6 border-t border-white/20">
            <div className="space-y-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-3 px-6 py-4 rounded-xl font-medium transition-all duration-300 ${
                    isActive(item.href)
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>
            
            <div className="mt-6 pt-6 border-t border-white/20">
              <button className="w-full flex items-center justify-center space-x-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-600 rounded-xl text-white font-medium">
                <span className="text-lg">👤</span>
                <span>Admin Panel</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
