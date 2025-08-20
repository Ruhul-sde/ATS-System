import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [jobs, setJobs] = useState([
    {
      id: 1,
      title: 'Senior React Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      status: 'active',
      applications: 45,
      views: 234,
      posted: '2024-01-15',
      salary: '$120k - $160k',
      urgency: 'high',
      description: 'Looking for an experienced React developer to join our growing team...',
      requirements: ['5+ years React', 'TypeScript', 'Next.js', 'Team Leadership']
    },
    {
      id: 2,
      title: 'Product Manager',
      department: 'Product',
      location: 'San Francisco, CA',
      type: 'Full-time',
      status: 'active',
      applications: 89,
      views: 567,
      posted: '2024-01-10',
      salary: '$140k - $180k',
      urgency: 'medium',
      description: 'Seeking a strategic product manager to drive our product roadmap...',
      requirements: ['3+ years PM experience', 'Agile/Scrum', 'Data Analysis', 'Stakeholder Management']
    },
    {
      id: 3,
      title: 'UX Designer',
      department: 'Design',
      location: 'New York, NY',
      type: 'Full-time',
      status: 'paused',
      applications: 67,
      views: 423,
      posted: '2024-01-08',
      salary: '$90k - $120k',
      urgency: 'low',
      description: 'Creative UX designer to enhance our user experience...',
      requirements: ['Portfolio required', 'Figma', 'User Research', 'Prototyping']
    },
    {
      id: 4,
      title: 'DevOps Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Contract',
      status: 'active',
      applications: 23,
      views: 156,
      posted: '2024-01-20',
      salary: '$110k - $140k',
      urgency: 'high',
      description: 'DevOps engineer to manage our cloud infrastructure...',
      requirements: ['AWS/Azure', 'Kubernetes', 'CI/CD', 'Terraform']
    }
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'paused': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'closed': return 'bg-gradient-to-r from-gray-400 to-gray-500';
      default: return 'bg-gradient-to-r from-blue-400 to-purple-500';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'high': return 'border-l-red-500 bg-red-500/10';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-l-green-500 bg-green-500/10';
      default: return 'border-l-gray-500 bg-gray-500/10';
    }
  };

  const getDepartmentIcon = (department) => {
    switch (department) {
      case 'Engineering': return '💻';
      case 'Product': return '🎯';
      case 'Design': return '🎨';
      case 'Marketing': return '📢';
      case 'Sales': return '💼';
      default: return '🏢';
    }
  };

  const filteredJobs = jobs.filter(job => 
    job.status === activeTab &&
    job.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const JobCard = ({ job }) => (
    <div className={`group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105 border-l-4 ${getUrgencyColor(job.urgency)}`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{getDepartmentIcon(job.department)}</div>
          <div>
            <h3 className="text-2xl font-bold text-white mb-2">{job.title}</h3>
            <div className="flex items-center space-x-4 text-gray-400">
              <span className="flex items-center space-x-1">
                <span>🏢</span>
                <span>{job.department}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>📍</span>
                <span>{job.location}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>⏰</span>
                <span>{job.type}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getStatusColor(job.status)}`}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </div>
          <button 
            onClick={() => setSelectedJob(job)}
            className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            <span className="text-xl">⚙️</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-300 text-lg leading-relaxed">{job.description}</p>
      </div>

      <div className="mb-6">
        <h4 className="text-white font-semibold mb-3">Key Requirements:</h4>
        <div className="flex flex-wrap gap-2">
          {job.requirements.map((req, index) => (
            <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-lg border border-purple-500/30">
              {req}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{job.applications}</div>
          <div className="text-sm text-gray-400">Applications</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-400">{job.views}</div>
          <div className="text-sm text-gray-400">Views</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{job.salary}</div>
          <div className="text-sm text-gray-400">Salary</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{new Date(job.posted).toLocaleDateString()}</div>
          <div className="text-sm text-gray-400">Posted</div>
        </div>
      </div>

      <div className="flex space-x-4">
        <button className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105">
          View Applications
        </button>
        <button className="flex-1 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105">
          Edit Job
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-blue-400/8 to-purple-600/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-br from-pink-400/8 to-red-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-green-400/8 to-cyan-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            💼 Jobs Hub
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light">
            Create, manage, and track your job postings with intelligent matching
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 space-y-6 md:space-y-0">
          {/* Tab Navigation */}
          <div className="flex space-x-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-2 border border-white/20">
            {['active', 'paused', 'closed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Jobs
              </button>
            ))}
          </div>

          {/* Search and Create */}
          <div className="flex space-x-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search jobs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white px-8 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2"
            >
              <span>➕</span>
              <span>Create Job</span>
            </button>
          </div>
        </div>

        {/* Job Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
            <div className="text-4xl mb-4">📝</div>
            <div className="text-3xl font-bold text-blue-400 mb-2">{jobs.filter(j => j.status === 'active').length}</div>
            <div className="text-gray-300">Active Jobs</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
            <div className="text-4xl mb-4">👥</div>
            <div className="text-3xl font-bold text-green-400 mb-2">{jobs.reduce((sum, job) => sum + job.applications, 0)}</div>
            <div className="text-gray-300">Total Applications</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
            <div className="text-4xl mb-4">👀</div>
            <div className="text-3xl font-bold text-purple-400 mb-2">{jobs.reduce((sum, job) => sum + job.views, 0)}</div>
            <div className="text-gray-300">Total Views</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
            <div className="text-4xl mb-4">⚡</div>
            <div className="text-3xl font-bold text-yellow-400 mb-2">{jobs.filter(j => j.urgency === 'high').length}</div>
            <div className="text-gray-300">Urgent Roles</div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-8">
          {filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard key={job.id} job={job} />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">📭</div>
              <h3 className="text-3xl font-bold text-gray-400 mb-4">No jobs found</h3>
              <p className="text-gray-500 text-lg">Try adjusting your search or create a new job posting</p>
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}