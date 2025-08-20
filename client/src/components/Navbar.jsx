import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="bg-white bg-opacity-95 backdrop-blur-sm shadow-lg border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3">
            <div className="text-2xl">🎯</div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">ATS Pro</h1>
              <p className="text-xs text-gray-600">Applicant Tracking System</p>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : ''
              }`}
            >
              Dashboard
            </Link>
            <Link
              to="/ats"
              className={`text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                location.pathname === '/ats' ? 'text-blue-600 border-b-2 border-blue-600 pb-1' : ''
              }`}
            >
              ATS Processing
            </Link>
            <a href="#analytics" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Analytics
            </a>
            <a href="#jobs" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Jobs
            </a>
            <a href="#candidates" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">
              Candidates
            </a>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-4">
            <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full transition-colors">
              🔔
            </button>
            <button className="text-gray-500 hover:text-gray-700 p-2 rounded-full transition-colors">
              ⚙️
            </button>
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              U
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-gray-500 hover:text-gray-700 p-2">
              ☰
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}