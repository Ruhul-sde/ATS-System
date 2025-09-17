
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

export default function JobsPage() {
  const { apiCall } = useAuth();
  const [activeTab, setActiveTab] = useState('active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showApplicationsModal, setShowApplicationsModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [applicationsData, setApplicationsData] = useState([]);
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

  const fetchJobApplications = async (jobId) => {
    try {
      const response = await apiCall(`/api/admin/job-applications/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setApplicationsData(data.data || []);
      } else {
        setApplicationsData([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplicationsData([]);
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

  const handleUpdateJob = async (jobData) => {
    try {
      const response = await fetch(`/api/jobs/${selectedJob._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jobData)
      });

      const data = await response.json();
      if (data.success) {
        fetchJobs();
        setShowEditModal(false);
        setSelectedJob(null);
      }
    } catch (error) {
      console.error('Error updating job:', error);
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

  const handleViewApplications = async (job) => {
    setSelectedJob(job);
    await fetchJobApplications(job._id);
    setShowApplicationsModal(true);
  };

  const handleEditJob = (job) => {
    setSelectedJob(job);
    setShowEditModal(true);
  };

  const updateApplicationStatus = async (applicationId, newStatus, notes = '') => {
    try {
      const response = await apiCall(`/api/applications/${applicationId}/${getActionFromStatus(newStatus)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });

      if (response.ok) {
        // Refresh applications
        await fetchJobApplications(selectedJob._id);
      }
    } catch (error) {
      console.error('Error updating application status:', error);
    }
  };

  const getActionFromStatus = (status) => {
    switch (status) {
      case 'reviewing': return 'review';
      case 'shortlisted': return 'shortlist';
      case 'interview-scheduled': return 'schedule-interview';
      case 'rejected': return 'reject';
      case 'hired': return 'hire';
      default: return 'review';
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

  const getApplicationStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gradient-to-r from-blue-400 to-cyan-500';
      case 'reviewing': return 'bg-gradient-to-r from-yellow-400 to-orange-500';
      case 'shortlisted': return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'interview-scheduled': return 'bg-gradient-to-r from-purple-400 to-pink-500';
      case 'rejected': return 'bg-gradient-to-r from-red-400 to-rose-500';
      case 'hired': return 'bg-gradient-to-r from-emerald-500 to-teal-500';
      default: return 'bg-gradient-to-r from-gray-400 to-gray-500';
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

  const JobFormModal = ({ isEdit = false, onSubmit, onClose }) => {
    const [formData, setFormData] = useState(isEdit && selectedJob ? {
      title: selectedJob.title || '',
      description: selectedJob.description || '',
      department: selectedJob.department || '',
      experienceLevel: selectedJob.experienceLevel || 'mid',
      skills: selectedJob.skills ? selectedJob.skills.join(', ') : '',
      location: selectedJob.location || '',
      workMode: selectedJob.workMode || 'hybrid',
      type: selectedJob.type || 'Full-time',
      urgency: selectedJob.urgency || 'medium',
      noticePeriod: selectedJob.noticePeriod || 'negotiable',
      positionCount: selectedJob.positionCount || 1,
      deadline: selectedJob.deadline ? new Date(selectedJob.deadline).toISOString().split('T')[0] : '',
      contractDuration: selectedJob.contractDuration || '',
      benefits: selectedJob.benefits ? selectedJob.benefits.join(', ') : '',
      requirements: {
        education: selectedJob.requirements?.education || '',
        certifications: selectedJob.requirements?.certifications ? selectedJob.requirements.certifications.join(', ') : '',
        languages: selectedJob.requirements?.languages ? selectedJob.requirements.languages.map(l => l.language || l).join(', ') : ''
      },
      reportingManager: {
        title: selectedJob.reportingManager?.title || '',
        department: selectedJob.reportingManager?.department || ''
      },
      teamSize: selectedJob.teamSize || '',
      travelRequired: selectedJob.travelRequired || 'none',
      securityClearance: selectedJob.securityClearance || 'none',
      salaryRange: { 
        min: selectedJob.salaryRange?.min || '', 
        max: selectedJob.salaryRange?.max || '', 
        currency: selectedJob.salaryRange?.currency || 'USD' 
      }
    } : {
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
      onSubmit(jobData);
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

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-800 to-purple-800 rounded-3xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent">
              {isEdit ? '✏️ Edit Position' : '➕ Create New Position'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">📋 Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  name="title"
                  placeholder="Job Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
                <input
                  type="text"
                  name="department"
                  placeholder="Department"
                  value={formData.department}
                  onChange={handleInputChange}
                  required
                  className="p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
                <select
                  name="experienceLevel"
                  value={formData.experienceLevel}
                  onChange={handleInputChange}
                  required
                  className="p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
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
                  className="p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
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
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">🎯 Position Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <input
                  type="number"
                  name="positionCount"
                  placeholder="Number of Positions"
                  value={formData.positionCount}
                  onChange={handleInputChange}
                  min="1"
                  className="p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
                <select
                  name="urgency"
                  value={formData.urgency}
                  onChange={handleInputChange}
                  className="p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
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
                  className="p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <select
                  name="noticePeriod"
                  value={formData.noticePeriod}
                  onChange={handleInputChange}
                  className="p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
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
                  className="p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            {/* Location & Work Mode */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">📍 Location & Work Mode</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
                <select
                  name="workMode"
                  value={formData.workMode}
                  onChange={handleInputChange}
                  className="p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                >
                  <option value="remote">Remote</option>
                  <option value="hybrid">Hybrid</option>
                  <option value="onsite">On-site</option>
                </select>
                <select
                  name="travelRequired"
                  value={formData.travelRequired}
                  onChange={handleInputChange}
                  className="p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                >
                  <option value="none">No Travel</option>
                  <option value="minimal">Minimal Travel</option>
                  <option value="occasional">Occasional Travel</option>
                  <option value="frequent">Frequent Travel</option>
                </select>
              </div>
            </div>

            {/* Compensation */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">💰 Compensation</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input
                  type="number"
                  name="salaryRange.min"
                  placeholder="Min Salary (k)"
                  value={formData.salaryRange.min}
                  onChange={handleInputChange}
                  className="p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
                <input
                  type="number"
                  name="salaryRange.max"
                  placeholder="Max Salary (k)"
                  value={formData.salaryRange.max}
                  onChange={handleInputChange}
                  className="p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
                <select
                  name="salaryRange.currency"
                  value={formData.salaryRange.currency}
                  onChange={handleInputChange}
                  className="p-4 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="CAD">CAD (C$)</option>
                  <option value="INR">INR (₹)</option>
                </select>
              </div>
            </div>

            {/* Skills & Requirements */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">🛠️ Skills & Requirements</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  name="skills"
                  placeholder="Required Skills (comma separated)"
                  value={formData.skills}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
                <input
                  type="text"
                  name="requirements.education"
                  placeholder="Education Requirements"
                  value={formData.requirements.education}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
                <input
                  type="text"
                  name="requirements.certifications"
                  placeholder="Required Certifications (comma separated)"
                  value={formData.requirements.certifications}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            {/* Additional Information */}
            <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
              <h3 className="text-xl font-semibold text-white mb-4">ℹ️ Additional Information</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  name="benefits"
                  placeholder="Benefits (comma separated)"
                  value={formData.benefits}
                  onChange={handleInputChange}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
                <textarea
                  name="description"
                  placeholder="Job Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="w-full p-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                />
              </div>
            </div>

            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-[#455185] to-[#ED1B2F] hover:from-[#364068] hover:to-[#d4162a] text-white py-4 px-8 rounded-xl font-semibold transition-all duration-300 hover:scale-105 shadow-lg"
              >
                {isEdit ? 'Update Position' : 'Create Position'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-4 px-8 rounded-xl font-semibold transition-all duration-300 hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const ApplicationsModal = () => {
    if (!showApplicationsModal || !selectedJob) return null;

    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-slate-800 to-purple-800 rounded-3xl p-8 max-w-7xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-pink-400 bg-clip-text text-transparent mb-2">
                📋 Applications for {selectedJob.title}
              </h2>
              <p className="text-gray-400">{applicationsData.length} applicant{applicationsData.length !== 1 ? 's' : ''} found</p>
            </div>
            <button
              onClick={() => setShowApplicationsModal(false)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
            >
              <span className="text-2xl">✕</span>
            </button>
          </div>

          <div className="space-y-6">
            {applicationsData.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h4 className="text-2xl font-bold text-gray-400 mb-2">No Applications Yet</h4>
                <p className="text-gray-500">This position hasn't received any applications yet.</p>
              </div>
            ) : (
              applicationsData.map((application) => (
                <div key={application._id} className="bg-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/10 hover:bg-white/10 transition-all duration-300">
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center space-x-6">
                      <div className="relative">
                        {application.applicant?.profile?.profilePicture?.fileUrl ? (
                          <img
                            src={application.applicant.profile.profilePicture.fileUrl}
                            alt={application.applicant.firstName}
                            className="w-16 h-16 rounded-full object-cover border-2 border-blue-500"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl">
                            {application.applicant ? (application.applicant.firstName?.charAt(0) || application.applicant.email?.charAt(0))?.toUpperCase() : '👤'}
                          </div>
                        )}
                        {application.aiAnalysis?.matchPercentage && (
                          <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                            {application.aiAnalysis.matchPercentage}%
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">
                          {application.applicant ? `${application.applicant.firstName} ${application.applicant.lastName}` : 'Unknown Applicant'}
                        </h3>
                        <p className="text-gray-400 mb-2">{application.applicant?.email || 'No email provided'}</p>
                        <div className="flex items-center space-x-4 text-sm text-gray-400">
                          <span className="flex items-center space-x-1">
                            <span>📱</span>
                            <span>{application.applicant?.profile?.phone || 'No phone'}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span>📍</span>
                            <span>{application.applicant?.profile?.address?.city || 'Location not specified'}</span>
                          </span>
                          <span className="flex items-center space-x-1">
                            <span>💼</span>
                            <span>{application.applicant?.profile?.totalExperience || 'Experience not specified'}</span>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end space-y-3">
                      <div className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getApplicationStatusColor(application.status)}`}>
                        {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('-', ' ')}
                      </div>
                      <div className="text-sm text-gray-400">
                        Applied: {new Date(application.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                  </div>

                  {/* Applicant Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h4 className="text-white font-semibold mb-2">💼 Professional</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Current Company:</span>
                          <span className="text-white">{application.applicant?.profile?.currentCompany || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Designation:</span>
                          <span className="text-white">{application.applicant?.profile?.currentDesignation || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Expected Salary:</span>
                          <span className="text-green-400">{application.applicant?.profile?.expectedSalary || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Notice Period:</span>
                          <span className="text-yellow-400">{application.applicant?.profile?.noticePeriod || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h4 className="text-white font-semibold mb-2">🎓 Education</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Degree:</span>
                          <span className="text-white">{application.applicant?.profile?.degree || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">University:</span>
                          <span className="text-white text-xs">{application.applicant?.profile?.university || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Year:</span>
                          <span className="text-white">{application.applicant?.profile?.graduationYear || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">GPA:</span>
                          <span className="text-white">{application.applicant?.profile?.gpa || 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h4 className="text-white font-semibold mb-2">📊 Match Analysis</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Match Score:</span>
                          <span className="text-green-400 font-bold">{application.aiAnalysis?.matchPercentage || 'N/A'}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Experience Match:</span>
                          <span className="text-white">{application.aiAnalysis?.experienceMatch || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Skills Match:</span>
                          <span className="text-white">{application.aiAnalysis?.matchingSkills?.length || 0} skills</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Interview Ready:</span>
                          <span className="text-white">{application.aiAnalysis?.interviewReadiness || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {application.applicant?.profile?.skills && application.applicant.profile.skills.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3">🛠️ Skills</h4>
                      <div className="flex flex-wrap gap-2">
                        {application.applicant.profile.skills.map((skill, index) => (
                          <span key={index} className="px-3 py-1 bg-blue-500/20 text-blue-300 text-sm rounded-lg border border-blue-500/30">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cover Letter */}
                  {application.coverLetter && (
                    <div className="mb-6">
                      <h4 className="text-white font-semibold mb-3">📝 Cover Letter</h4>
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <p className="text-gray-300 leading-relaxed">{application.coverLetter}</p>
                      </div>
                    </div>
                  )}

                  {/* AI Analysis */}
                  {application.aiAnalysis && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                      {application.aiAnalysis.strengths && application.aiAnalysis.strengths.length > 0 && (
                        <div>
                          <h5 className="text-green-400 font-medium mb-2">✅ Strengths</h5>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {application.aiAnalysis.strengths.map((strength, index) => (
                              <li key={index}>• {strength}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {application.aiAnalysis.weaknesses && application.aiAnalysis.weaknesses.length > 0 && (
                        <div>
                          <h5 className="text-yellow-400 font-medium mb-2">⚠️ Areas for Improvement</h5>
                          <ul className="text-sm text-gray-300 space-y-1">
                            {application.aiAnalysis.weaknesses.map((weakness, index) => (
                              <li key={index}>• {weakness}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                    {application.applicant?.profile?.resume?.fileUrl && (
                      <a
                        href={application.applicant.profile.resume.fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                      >
                        📄 View Resume
                      </a>
                    )}
                    
                    {application.status === 'pending' && (
                      <button 
                        onClick={() => updateApplicationStatus(application._id, 'reviewing')}
                        className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                      >
                        📋 Review
                      </button>
                    )}
                    
                    {(application.status === 'reviewing' || application.status === 'pending') && (
                      <button 
                        onClick={() => updateApplicationStatus(application._id, 'shortlisted')}
                        className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                      >
                        ⭐ Shortlist
                      </button>
                    )}
                    
                    {application.status === 'shortlisted' && (
                      <button 
                        onClick={() => updateApplicationStatus(application._id, 'interview-scheduled')}
                        className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                      >
                        🎤 Schedule Interview
                      </button>
                    )}
                    
                    <button 
                      onClick={() => updateApplicationStatus(application._id, 'rejected')}
                      className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                    >
                      ❌ Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  const JobCard = ({ job }) => (
    <div className={`group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:scale-102 border-l-4 ${getUrgencyColor(job.urgency)} border border-white/20 hover:border-white/40`}>
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
        <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 text-center border border-blue-500/30">
          <div className="text-2xl font-bold text-blue-400">{job.positionCount || 1}</div>
          <div className="text-sm text-gray-300">Open Positions</div>
        </div>
        <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 text-center border border-green-500/30">
          <div className="text-2xl font-bold text-green-400">{job.applications || 0}</div>
          <div className="text-sm text-gray-300">Applications</div>
        </div>
        <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 text-center border border-purple-500/30">
          <div className="text-2xl font-bold text-purple-400">{job.views || 0}</div>
          <div className="text-sm text-gray-300">Views</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-4 text-center border border-yellow-500/30">
          <div className="text-2xl font-bold text-yellow-400">{job.shortlisted || 0}</div>
          <div className="text-sm text-gray-300">Shortlisted</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center space-x-2 text-gray-300">
          <span className="text-lg">💰</span>
          <div>
            <div className="font-semibold">{formatSalary(job.salaryRange)}</div>
            <div className="text-sm text-gray-400">Salary Range</div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <span className="text-lg">⏰</span>
          <div>
            <div className="font-semibold">{getNoticePeriodDisplay(job.noticePeriod)}</div>
            <div className="text-sm text-gray-400">Notice Period</div>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-300">
          <span className="text-lg">📅</span>
          <div>
            <div className="font-semibold">{job.deadline ? new Date(job.deadline).toLocaleDateString() : 'Open'}</div>
            <div className="text-sm text-gray-400">Application Deadline</div>
          </div>
        </div>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-3">Required Skills:</h4>
          <div className="flex flex-wrap gap-2">
            {job.skills.slice(0, 6).map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-gradient-to-r from-[#455185]/20 to-[#ED1B2F]/20 text-[#455185] bg-white/90 text-sm rounded-lg border border-[#455185]/20">
                {skill}
              </span>
            ))}
            {job.skills.length > 6 && (
              <span className="px-3 py-1 bg-white/10 text-gray-300 text-sm rounded-lg border border-white/20">
                +{job.skills.length - 6} more
              </span>
            )}
          </div>
        </div>
      )}

      <div className="flex space-x-3">
        <button 
          onClick={() => handleViewApplications(job)}
          className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105"
        >
          📋 View Applications ({job.applications || 0})
        </button>
        <button 
          onClick={() => handleEditJob(job)}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105"
        >
          ✏️ Edit Position
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-cyan-400/8 to-blue-600/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-br from-pink-400/8 to-red-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-green-400/8 to-cyan-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            🚀 Jobs Management Hub
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light">
            Create, manage, and track your job postings with advanced analytics and modern features
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12 space-y-6 lg:space-y-0">
          {/* Tab Navigation */}
          <div className="flex space-x-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-2 shadow-lg border border-white/20">
            {['active', 'paused', 'closed', 'draft'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? 'bg-gradient-to-r from-[#455185] to-[#ED1B2F] text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
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
                className="w-64 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
              />
              <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
            </div>
            
            <select
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
              className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
            >
              <option value="all">All Departments</option>
              {departments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
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
          <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 backdrop-blur-md rounded-3xl p-6 text-center shadow-lg border border-blue-500/30">
            <div className="text-3xl mb-2">📋</div>
            <div className="text-3xl font-bold mb-1 text-blue-400">{jobs.filter(j => j.status === 'active').length}</div>
            <div className="text-blue-300">Active Positions</div>
          </div>
          <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 backdrop-blur-md rounded-3xl p-6 text-center shadow-lg border border-green-500/30">
            <div className="text-3xl mb-2">👥</div>
            <div className="text-3xl font-bold mb-1 text-green-400">{jobs.reduce((sum, job) => sum + (job.applications || 0), 0)}</div>
            <div className="text-green-300">Applications</div>
          </div>
          <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 backdrop-blur-md rounded-3xl p-6 text-center shadow-lg border border-purple-500/30">
            <div className="text-3xl mb-2">👀</div>
            <div className="text-3xl font-bold mb-1 text-purple-400">{jobs.reduce((sum, job) => sum + (job.views || 0), 0)}</div>
            <div className="text-purple-300">Total Views</div>
          </div>
          <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 backdrop-blur-md rounded-3xl p-6 text-center shadow-lg border border-yellow-500/30">
            <div className="text-3xl mb-2">🎯</div>
            <div className="text-3xl font-bold mb-1 text-yellow-400">{jobs.reduce((sum, job) => sum + (job.shortlisted || 0), 0)}</div>
            <div className="text-yellow-300">Shortlisted</div>
          </div>
          <div className="bg-gradient-to-br from-red-500/20 to-red-600/20 backdrop-blur-md rounded-3xl p-6 text-center shadow-lg border border-red-500/30">
            <div className="text-3xl mb-2">⚡</div>
            <div className="text-3xl font-bold mb-1 text-red-400">{jobs.filter(j => j.urgency === 'critical' || j.urgency === 'high').length}</div>
            <div className="text-red-300">Urgent Roles</div>
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

      {/* Modals */}
      {showCreateModal && (
        <JobFormModal
          onSubmit={handleCreateJob}
          onClose={() => setShowCreateModal(false)}
        />
      )}

      {showEditModal && (
        <JobFormModal
          isEdit={true}
          onSubmit={handleUpdateJob}
          onClose={() => {
            setShowEditModal(false);
            setSelectedJob(null);
          }}
        />
      )}

      <ApplicationsModal />

      <Footer />
    </div>
  );
}
