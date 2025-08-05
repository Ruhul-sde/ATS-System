import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ATSPage from './pages/ATSPage';
import DashboardPage from './pages/DashboardPage';
import './App.css';

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-red-500 via-red-600 to-red-700 flex items-center justify-center">
          <div className="bg-white rounded-xl p-8 shadow-lg max-w-md mx-4">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Something went wrong</h2>
            <p className="text-gray-600 mb-4">
              The application encountered an error. Please refresh the page to try again.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Main App Component
export default function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/ats" element={<ATSPage />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}