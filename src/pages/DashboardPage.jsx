
import { useState } from 'react';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import Footer from '../components/Footer';

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[conic-gradient(from_0deg_at_50%_50%,rgba(120,119,198,0.1)_0deg,transparent_60deg,transparent_300deg,rgba(120,119,198,0.1)_360deg)] animate-spin" style={{ animationDuration: '20s' }}></div>
      </div>

      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <Dashboard />
      </div>

      <Footer />
    </div>
  );
}
