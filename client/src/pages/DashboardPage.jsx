import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import SystemStatus from '../components/SystemStatus';
import Footer from '../components/Footer';

export default function DashboardPage() {
  const [stats, setStats] = useState({
    totalResumes: 245,
    processed: 189,
    matched: 56,
    pending: 12
  });

  const [recentActivity, setRecentActivity] = useState([
    { id: 1, action: "High match candidate found", candidate: "Sarah Chen", time: "2 mins ago", type: "success", score: 95 },
    { id: 2, action: "Batch processing completed", count: "24 resumes", time: "15 mins ago", type: "info", score: null },
    { id: 3, action: "New job posting created", job: "Senior Developer", time: "1 hour ago", type: "info", score: null },
    { id: 4, action: "Interview scheduled", candidate: "Michael Rodriguez", time: "2 hours ago", type: "warning", score: 87 }
  ]);

  const [topCandidates, setTopCandidates] = useState([
    { name: "Emma Thompson", match: 96, skills: ["React", "TypeScript", "AWS", "Docker"], status: "New", avatar: "👩‍💻" },
    { name: "David Kim", match: 92, skills: ["Python", "Django", "PostgreSQL", "Redis"], status: "Interviewed", avatar: "👨‍💼" },
    { name: "Lisa Wang", match: 89, skills: ["Vue.js", "Node.js", "MongoDB"], status: "Reviewing", avatar: "👩‍🔬" },
    { name: "Alex Johnson", match: 85, skills: ["Java", "Spring Boot", "Kubernetes"], status: "New", avatar: "👨‍💻" }
  ]);

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'New': return 'bg-gradient-to-r from-emerald-400 to-cyan-400';
      case 'Interviewed': return 'bg-gradient-to-r from-purple-400 to-pink-400';
      case 'Reviewing': return 'bg-gradient-to-r from-yellow-400 to-orange-400';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'success': return '🎯';
      case 'warning': return '⚡';
      case 'info': return '📊';
      default: return '📝';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-400/10 to-purple-600/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-20 w-96 h-96 bg-gradient-to-br from-pink-400/10 to-red-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-gradient-to-br from-green-400/10 to-blue-600/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent animate-pulse"></div>
      </div>

      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-2 pb-6 space-y-12">

        {/* Hero Section with Real-time Clock */}
        <div className="text-center py-12">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              🎯 Dashboard
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
              Welcome to your intelligent ATS command center
            </p>
            <div className="inline-flex items-center space-x-3 px-6 py-3 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mt-6">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-gray-300 font-medium">
                {currentTime.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">📄</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-3">
              {stats.totalResumes}
            </div>
            <div className="text-gray-300 font-medium text-lg">Total Resumes</div>
            <div className="mt-6 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-400 to-purple-400 rounded-full w-3/4 animate-pulse"></div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">⚡</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-green-400 to-cyan-400 bg-clip-text text-transparent mb-3">
              {stats.processed}
            </div>
            <div className="text-gray-300 font-medium text-lg">Processed</div>
            <div className="mt-6 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-400 to-cyan-400 rounded-full animate-pulse" style={{ width: `${(stats.processed / stats.totalResumes) * 100}%` }}></div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🎯</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent mb-3">
              {stats.matched}
            </div>
            <div className="text-gray-300 font-medium text-lg">High Matches</div>
            <div className="mt-6 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-pulse" style={{ width: `${(stats.matched / stats.processed) * 100}%` }}></div>
            </div>
          </div>

          <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl">
            <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">⏳</div>
            <div className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-red-400 bg-clip-text text-transparent mb-3">
              {stats.pending}
            </div>
            <div className="text-gray-300 font-medium text-lg">Pending Review</div>
            <div className="mt-6 h-2 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-pink-400 to-red-400 rounded-full animate-pulse" style={{ width: `${(stats.pending / stats.totalResumes) * 100}%` }}></div>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-3xl font-bold text-white">Recent Activity</h3>
                <div className="flex items-center space-x-2 px-4 py-2 bg-green-500/20 rounded-full">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400 font-medium">Live Updates</span>
                </div>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity, index) => (
                  <div key={activity.id} className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="text-3xl group-hover:scale-110 transition-transform duration-300">
                        {getActivityIcon(activity.type)}
                      </div>
                      <div className="flex-1">
                        <div className="text-white font-semibold text-lg">{activity.action}</div>
                        <div className="text-gray-400">
                          {activity.candidate || activity.job || activity.count} • {activity.time}
                        </div>
                      </div>
                      {activity.score && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-green-400">{activity.score}%</div>
                          <div className="text-xs text-gray-400">Match</div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Candidates */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <h3 className="text-3xl font-bold text-white mb-8">🏆 Top Candidates</h3>
              <div className="space-y-4">
                {topCandidates.map((candidate, index) => (
                  <div key={index} className="group bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl group-hover:scale-110 transition-transform duration-300">{candidate.avatar}</div>
                        <div>
                          <div className="text-white font-semibold text-lg">{candidate.name}</div>
                          <div className={`inline-block px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(candidate.status)}`}>
                            {candidate.status}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-green-400">{candidate.match}%</div>
                        <div className="text-xs text-gray-400">Match</div>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {candidate.skills.slice(0, 3).map((skill, skillIndex) => (
                        <span key={skillIndex} className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-lg border border-blue-500/30">
                          {skill}
                        </span>
                      ))}
                      {candidate.skills.length > 3 && (
                        <span className="px-3 py-1 bg-gray-500/20 text-gray-300 text-sm rounded-lg border border-gray-500/30">
                          +{candidate.skills.length - 3}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
          <SystemStatus />
        </div>

        {/* Enhanced Quick Actions */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <h3 className="text-3xl font-bold text-white mb-8 text-center">🚀 Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <button className="group bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📤</div>
              <div className="font-bold text-lg">Upload Resumes</div>
              <div className="text-sm opacity-80 mt-2">Add new candidates</div>
            </button>
            <button className="group bg-gradient-to-br from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📝</div>
              <div className="font-bold text-lg">Create Job</div>
              <div className="text-sm opacity-80 mt-2">New position</div>
            </button>
            <button className="group bg-gradient-to-br from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">📊</div>
              <div className="font-bold text-lg">View Reports</div>
              <div className="text-sm opacity-80 mt-2">Analytics & insights</div>
            </button>
            <button className="group bg-gradient-to-br from-pink-500 to-red-600 hover:from-pink-600 hover:to-red-700 text-white p-8 rounded-2xl transition-all duration-300 hover:scale-105 hover:shadow-2xl border border-white/20">
              <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">⚙️</div>
              <div className="font-bold text-lg">Settings</div>
              <div className="text-sm opacity-80 mt-2">Configure system</div>
            </button>
          </div>
        </div>
      </div>

      <Footer />

      <style jsx>{`
        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.6s ease-out;
        }
      `}</style>
    </div>
  );
}