
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function JobsPage() {
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [filterDepartment, setFilterDepartment] = useState('all');

  useEffect(() => {
    fetchJobs();
  }, [activeTab]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs?status=${activeTab}`);
      const data = await response.json();
      if (data.success) {
        setJobs(data.data);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJob = async (jobData) => {
    try {
      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      const data = await response.json();
      if (data.success) {
        fetchJobs();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('Error creating job:', error);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });

      const data = await response.json();
      if (data.success) {
        fetchJobs();
      }
    } catch (error) {
      console.error('Error updating job status:', error);
    }
  };

  const handleViewJob = async (jobId) => {
    try {
      await fetch(`/api/jobs/${jobId}/views`, {
        method: 'PUT'
      });
    } catch (error) {
      console.error('Error updating views:', error);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-gradient-to-r from-green-500 to-emerald-600';
      case 'paused': return 'bg-gradient-to-r from-yellow-500 to-orange-600';
      case 'closed': return 'bg-gradient-to-r from-gray-500 to-gray-600';
      case 'draft': return 'bg-gradient-to-r from-blue-500 to-indigo-600';
      default: return 'bg-gradient-to-r from-[#455185] to-[#ED1B2F]';
    }
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'border-l-[#ED1B2F] bg-red-500/20';
      case 'high': return 'border-l-red-500 bg-red-500/15';
      case 'medium': return 'border-l-yellow-500 bg-yellow-500/15';
      case 'low': return 'border-l-green-500 bg-green-500/15';
      default: return 'border-l-[#455185] bg-blue-500/15';
    }
  };

  const getDepartmentIcon = (department) => {
    switch (department?.toLowerCase()) {
      case 'engineering': return '💻';
      case 'product': return '🎯';
      case 'design': return '🎨';
      case 'marketing': return '📢';
      case 'sales': return '💼';
      case 'finance': return '💰';
      case 'hr': return '👥';
      case 'operations': return '⚙️';
      default: return '🏢';
    }
  };

  const formatSalary = (salaryRange) => {
    if (salaryRange?.min && salaryRange?.max) {
      return `${salaryRange.currency || '$'}${salaryRange.min}k - ${salaryRange.currency || '$'}${salaryRange.max}k`;
    } else if (salaryRange?.min) {
      return `${salaryRange.currency || '$'}${salaryRange.min}k+`;
    } else if (salaryRange?.max) {
      return `Up to ${salaryRange.currency || '$'}${salaryRange.max}k`;
    }
    return 'Competitive';
  };

  const getNoticePeriodDisplay = (noticePeriod) => {
    switch (noticePeriod) {
      case 'immediate': return '🚀 Immediate';
      case '2-weeks': return '📅 2 Weeks';
      case '1-month': return '📅 1 Month';
      case '2-months': return '📅 2 Months';
      case '3-months': return '📅 3 Months';
      case 'negotiable': return '🤝 Negotiable';
      default: return '🤝 Negotiable';
    }
  };

  const getWorkModeIcon = (workMode) => {
    switch (workMode) {
      case 'remote': return '🏠';
      case 'hybrid': return '🔄';
      case 'onsite': return '🏢';
      default: return '🔄';
    }
  };

  const filteredJobs = jobs
    .filter(job => 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (filterDepartment === 'all' || job.department === filterDepartment)
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest': return new Date(b.createdAt) - new Date(a.createdAt);
        case 'oldest': return new Date(a.createdAt) - new Date(b.createdAt);
        case 'applications': return (b.applications || 0) - (a.applications || 0);
        case 'views': return (b.views || 0) - (a.views || 0);
        case 'urgency': 
          const urgencyOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return (urgencyOrder[b.urgency] || 0) - (urgencyOrder[a.urgency] || 0);
        default: return 0;
      }
    });

  const departments = [...new Set(jobs.map(job => job.department).filter(Boolean))];

  const CreateJobModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      department: '',
      experienceLevel: 'mid',
      skills: '',
      location: '',
      workMode: 'hybrid',
      type: 'Full-time',
      urgency: 'medium',
      noticePeriod: 'negotiable',
      positionCount: 1,
      deadline: '',
      contractDuration: '',
      benefits: '',
      requirements: {
        education: '',
        certifications: '',
        languages: ''
      },
      reportingManager: {
        title: '',
        department: ''
      },
      teamSize: '',
      travelRequired: 'none',
      securityClearance: 'none',
      salaryRange: { min: '', max: '', currency: 'USD' }
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      const jobData = {
        ...formData,
        skills: formData.skills.split(',').map(skill => skill.trim()).filter(skill => skill),
        benefits: formData.benefits.split(',').map(benefit => benefit.trim()).filter(benefit => benefit),
        requirements: {
          ...formData.requirements,
          certifications: formData.requirements.certifications.split(',').map(cert => cert.trim()).filter(cert => cert),
          languages: formData.requirements.languages.split(',').map(lang => ({
            language: lang.trim(),
            proficiency: 'intermediate'
          })).filter(lang => lang.language)
        },
        teamSize: formData.teamSize ? parseInt(formData.teamSize) : undefined,
        positionCount: parseInt(formData.positionCount) || 1,
        deadline: formData.deadline || undefined,
        salaryRange: {
          min: formData.salaryRange.min ? parseInt(formData.salaryRange.min) : undefined,
          max: formData.salaryRange.max ? parseInt(formData.salaryRange.max) : undefined,
          currency: formData.salaryRange.currency
        }
      };
      handleCreateJob(jobData);
    };

    const handleInputChange = (e) => {
      const { name, value } = e.target;
      if (name.includes('salaryRange')) {
        const field = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          salaryRange: { ...prev.salaryRange, [field]: value }
        }));
      } else if (name.includes('requirements')) {
        const field = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          requirements: { ...prev.requirements, [field]: value }
        }));
      } else if (name.includes('reportingManager')) {
        const field = name.split('.')[1];
        setFormData(prev => ({
          ...prev,
          reportingManager: { ...prev.reportingManager, [field]: value }
        }));
      } else {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    };

    if (!showCreateModal) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-[#455185] to-[#ED1B2F] bg-clip-text text-transparent">
              Create New Position
            </h2>
            <button
              onClick={() => setShowCreateModal(false)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#455185] mb-4">📋 Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Job Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                />
                <input
                  type="text"
                  name="department"
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                />
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  required
                  className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                >
                  <option value="entry">Entry Level</option>
                  <option value="mid">Mid Level</option>
                  <option value="senior">Senior Level</option>
                  <option value="lead">Lead Level</option>
                  <option value="director">Director Level</option>
                  <option value="vp">VP Level</option>
                </select>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                >
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                  <option value="Contract">Contract</option>
                  <option value="Internship">Internship</option>
                  <option value="Freelance">Freelance</option>
                </select>
              </div>
            </div>

            {/* Position Details */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#455185] mb-4">🎯 Position Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="number"
                  name="positionCount"
                  placeholder="Number of Positions"
                  value={formData.positionCount}
                  onChange={handleInputChange}
                  min="1"
                  className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                />
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical Priority</option>
                </select>
                <input
                  type="date"
                  name="deadline"
                  placeholder="Application Deadline"
                  value={formData.deadline}
                  onChange={handleInputChange}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={handleInputChange}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                >
                  <option value="immediate">Immediate Start</option>
                  <option value="2-weeks">2 Weeks Notice</option>
                  <option value="1-month">1 Month Notice</option>
                  <option value="2-months">2 Months Notice</option>
                  <option value="3-months">3 Months Notice</option>
                  <option value="negotiable">Negotiable</option>
                </select>
                <input
                  type="number"
                  name="teamSize"
                  placeholder="Team Size (optional)"
                  value={formData.teamSize}
                  onChange={handleInputChange}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                />
              </div>
            </div>

            {/* Location & Work Mode */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#455185] mb-4">📍 Location & Work Mode</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                />
                <select
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleInputChange}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
                <select
                  name="travelRequired"
                  value={formData.travelRequired}
                  onChange={handleInputChange}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                >
                  <option value="none">No Travel</option>
                  <option value="minimal">Minimal Travel</option>
                  <option value="occasional">Occasional Travel</option>
                  <option value="frequent">Frequent Travel</option>
                </select>
              </div>
            </div>

            {/* Compensation */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#455185] mb-4">💰 Compensation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  name="salaryRange.min"
                  placeholder="Min Salary (k)"
                  value={formData.salaryRange.min}
                  onChange={handleInputChange}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                />
                <input
                  type="number"
                  name="salaryRange.max"
                  placeholder="Max Salary (k)"
                  value={formData.salaryRange.max}
                  onChange={handleInputChange}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                />
                <select
                  name="salaryRange.currency"
                  value={formData.salaryRange.currency}
                  onChange={handleInputChange}
                  className="p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                </select>
              </div>
            </div>

            {/* Skills & Requirements */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#455185] mb-4">🛠️ Skills & Requirements</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  name="skills"
                  placeholder="Required Skills (comma separated)"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                />
                <input
                  type="text"
                  name="requirements.education"
                  placeholder="Education Requirements"
                  value={formData.requirements.education}
                  onChange={handleInputChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                />
                <input
                  type="text"
                  name="requirements.certifications"
                  placeholder="Required Certifications (comma separated)"
                  value={formData.requirements.certifications}
                  onChange={handleInputChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-gray-50 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-[#455185] mb-4">ℹ️ Additional Information</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  name="benefits"
                  placeholder="Benefits (comma separated)"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                />
                <textarea
                  name="description"
                  placeholder="Job Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#455185] to-[#ED1B2F] hover:from-[#364068] hover:to-[#d4162a] text-white py-4 px-8 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                Create Position
              </button>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-4 px-8 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const JobCard = ({ job }) => (
    <div className={`group bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-102 border-l-4 ${getUrgencyColor(job.urgency)} border border-gray-100`}>
      <div className="flex justify-between items-start mb-6">
        <div className="flex items-center space-x-4">
          <div className="text-4xl">{getDepartmentIcon(job.department)}</div>
          <div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">{job.title}</h3>
            <div className="flex items-center space-x-4 text-gray-600">
              <span className="flex items-center space-x-1">
                <span>🏢</span>
                <span>{job.department}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>{getWorkModeIcon(job.workMode)}</span>
                <span>{job.workMode || 'Hybrid'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>📍</span>
                <span>{job.location || 'Remote'}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getStatusColor(job.status)}`}>
            {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
          </div>
          {job.urgency === 'critical' && (
            <div className="px-3 py-1 bg-[#ED1B2F] text-white text-xs font-bold rounded-full animate-pulse">
              URGENT
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-[#455185]">{job.positionCount || 1}</div>
          <div className="text-sm text-gray-600">Open Positions</div>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{job.applications || 0}</div>
          <div className="text-sm text-gray-600">Applications</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{job.views || 0}</div>
          <div className="text-sm text-gray-600">Views</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{job.shortlisted || 0}</div>
          <div className="text-sm text-gray-600">Shortlisted</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center space-x-2 text-gray-700">
          <span className="text-lg">💰</span>
          <div>
            <div className="font-semibold">{formatSalary(job.salaryRange)}</div>
            <div className="text-sm text-gray-500">Salary Range</div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-700">
          <span className="text-lg">⏰</span>
          <div>
            <div className="font-semibold">{getNoticePeriodDisplay(job.noticePeriod)}</div>
            <div className="text-sm text-gray-500">Notice Period</div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-700">
          <span className="text-lg">📅</span>
          <div>
            <div className="font-semibold">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open'}</div>
            <div className="text-sm text-gray-500">Application Deadline</div>
          </div>
        </div>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="mb-6">
          <h4 className="text-gray-800 font-semibold mb-3">Required Skills:</h4>
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 6).map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-gradient-to-r from-[#455185]/10 to-[#ED1B2F]/10 text-[#455185] text-sm rounded-lg border border-[#455185]/20">
                {skill}
              </span>
            ))}
            {job.skills.length > 6 && (
              <span className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-lg">
                +{job.skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex space-x-4">
        <button 
          onClick={() => handleViewJob(job._id)}
          className="flex-1 bg-gradient-to-r from-[#455185] to-[#364068] hover:from-[#364068] hover:to-[#455185] text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105"
        >
          View Applications
        </button>
        <button 
          onClick={() => setSelectedJob(job)}
          className="flex-1 bg-gradient-to-r from-[#ED1B2F] to-[#d4162a] hover:from-[#d4162a] hover:to-[#ED1B2F] text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105"
        >
          Manage Position
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-[#455185] to-[#ED1B2F] bg-clip-text text-transparent">
            🚀 Jobs Management Hub
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-4xl mx-auto font-light">
            Create, manage, and track your job postings with advanced analytics and modern features
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12 space-y-6 lg:space-y-0">
          {/* Tab Navigation */}
          <div className="flex space-x-2 bg-white rounded-2xl p-2 shadow-lg border border-gray-200">
            {['active', 'paused', 'closed', 'draft'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[#455185] to-[#ED1B2F] text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)} Jobs
              </button>
            ))}
          </div>

          {/* Search, Filter and Create */}
          <div className="flex flex-wrap gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64 px-6 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:outline-none focus:border-[#455185] transition-colors"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="applications">Most Applications</option>
              <option value="views">Most Views</option>
              <option value="urgency">By Urgency</option>
            </select>
            
            <button 
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-[#455185] to-[#ED1B2F] hover:from-[#364068] hover:to-[#d4162a] text-white px-8 py-3 rounded-xl font-semibold transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-lg"
            >
              <span>➕</span>
              <span>Create Position</span>
            </button>
          </div>
        </div>

        {/* Job Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-12">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl p-6 text-white text-center shadow-lg">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-3xl font-bold mb-1">{jobs.filter(j => j.status === 'active').length}</div>
            <div className="text-blue-100">Active Positions</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-3xl p-6 text-white text-center shadow-lg">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-3xl font-bold mb-1">{jobs.reduce((sum, job) => sum + (job.applications || 0), 0)}</div>
            <div className="text-green-100">Applications</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-3xl p-6 text-white text-center shadow-lg">
            <div className="text-3xl mb-2">👀</div>
            <div className="text-3xl font-bold mb-1">{jobs.reduce((sum, job) => sum + (job.views || 0), 0)}</div>
            <div className="text-purple-100">Total Views</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-3xl p-6 text-white text-center shadow-lg">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-3xl font-bold mb-1">{jobs.reduce((sum, job) => sum + (job.shortlisted || 0), 0)}</div>
            <div className="text-yellow-100">Shortlisted</div>
          </div>
          <div className="bg-gradient-to-br from-[#ED1B2F] to-[#d4162a] rounded-3xl p-6 text-white text-center shadow-lg">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-3xl font-bold mb-1">{jobs.filter(j => j.urgency === 'critical' || j.urgency === 'high').length}</div>
            <div className="text-red-100">Urgent Roles</div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">⏳</div>
              <h3 className="text-3xl font-bold text-gray-400 mb-4">Loading positions...</h3>
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">📭</div>
              <h3 className="text-3xl font-bold text-gray-400 mb-4">No positions found</h3>
              <p className="text-gray-500 text-lg">Try adjusting your search or create a new job posting</p>
            </div>
          )}
        </div>
      </div>

      <CreateJobModal />
      <Footer />
    </div>
  );
}
