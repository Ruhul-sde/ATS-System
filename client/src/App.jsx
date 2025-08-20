import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import ATSPage from './pages/ATSPage';
import AnalyticsPage from './pages/AnalyticsPage';
import JobsPage from './pages/JobsPage';
import CandidatesPage from './pages/CandidatesPage';
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
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
          <div className="glass-card p-8 max-w-md mx-auto text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">Oops! Something went wrong</h2>
            <p className="text-gray-300 mb-6">
              The application encountered an unexpected error. Don't worry, we can fix this!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="btn-primary w-full"
            >
              🔄 Refresh Application
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
        <div className="app-container">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/ats" element={<ATSPage />} />
            <Route path="/analytics" element={<AnalyticsPage />} />
            <Route path="/jobs" element={<JobsPage />} />
            <Route path="/candidates" element={<CandidatesPage />} />
          </Routes>
        </div>
      </Router>
    </ErrorBoundary>
  );
}