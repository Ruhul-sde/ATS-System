
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

export default function JobSeekerJobsPage() {
  const { user, apiCall } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    department: '',
    experienceLevel: '',
    location: '',
    type: ''
  });
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [savedJobs, setSavedJobs] = useState(new Set());
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [message, setMessage] = useState({ type: '', text: '' });

  useEffect(() => {
    fetchJobs();
    fetchUserApplications();
    fetchUserSavedJobs();
  }, []);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const response = await apiCall('/api/jobs?status=active');
      const data = await response.json();
      if (data.success) {
        setJobs(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserApplications = async () => {
    try {
      const response = await apiCall('/api/job-seeker/applications');
      if (response.ok) {
        const data = await response.json();
        const appliedJobIds = new Set(data.data.map(app => app.jobId));
        setAppliedJobs(appliedJobIds);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    }
  };

  const fetchUserSavedJobs = async () => {
    try {
      const response = await apiCall('/api/job-seeker/saved-jobs');
      if (response.ok) {
        const data = await response.json();
        const savedJobIds = new Set(data.data.map(saved => saved.jobId));
        setSavedJobs(savedJobIds);
      }
    } catch (error) {
      console.error('Error fetching saved jobs:', error);
    }
  };

  const handleApplyToJob = async (job) => {
    setSelectedJob(job);
    setShowApplicationModal(true);
    setCoverLetter('');
  };

  const submitApplication = async () => {
    if (!selectedJob) return;

    try {
      setLoading(true);
      const response = await apiCall(`/api/job-seeker/apply/${selectedJob._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ coverLetter })
      });

      const data = await response.json();
      if (data.success) {
        setAppliedJobs(prev => new Set([...prev, selectedJob._id]));
        setShowApplicationModal(false);
        setMessage({ type: 'success', text: 'Application submitted successfully!' });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
      } else {
        setMessage({ type: 'error', text: data.error || 'Failed to submit application' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error submitting application' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveJob = async (jobId) => {
    try {
      const response = await apiCall(`/api/job-seeker/save-job/${jobId}`, {
        method: 'POST'
      });

      const data = await response.json();
      if (data.success) {
        if (data.data.action === 'saved') {
          setSavedJobs(prev => new Set([...prev, jobId]));
          setMessage({ type: 'success', text: 'Job saved successfully!' });
        } else {
          setSavedJobs(prev => {
            const newSet = new Set(prev);
            newSet.delete(jobId);
            return newSet;
          });
          setMessage({ type: 'success', text: 'Job removed from saved list!' });
        }
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Error saving job' });
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

  const formatSalary = (salaryRange) => {
    if (salaryRange?.min && salaryRange?.max) {
      return `$${salaryRange.min}k - $${salaryRange.max}k`;
    } else if (salaryRange?.min) {
      return `$${salaryRange.min}k+`;
    } else if (salaryRange?.max) {
      return `Up to $${salaryRange.max}k`;
    }
    return 'Competitive';
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !filters.department || job.department === filters.department;
    const matchesLevel = !filters.experienceLevel || job.experienceLevel === filters.experienceLevel;
    const matchesLocation = !filters.location || (job.location && job.location.toLowerCase().includes(filters.location.toLowerCase()));
    const matchesType = !filters.type || job.type === filters.type;

    return matchesSearch && matchesDepartment && matchesLevel && matchesLocation && matchesType;
  });

  const ApplicationModal = () => {
    if (!showApplicationModal || !selectedJob) return null;

    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <h2 className="text-3xl font-bold text-white mb-6">Apply to {selectedJob.title}</h2>
          
          <div className="mb-6 p-4 bg-white/5 rounded-xl border border-white/10">
            <h3 className="text-white font-semibold mb-2">{selectedJob.title}</h3>
            <p className="text-gray-400 mb-2">{selectedJob.department} • {selectedJob.location || 'Remote'}</p>
            <p className="text-purple-300">{formatSalary(selectedJob.salaryRange)}</p>
          </div>

          <div className="mb-6">
            <label className="block text-gray-300 font-medium mb-2">Cover Letter (Optional)</label>
            <textarea
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              rows={6}
              placeholder="Tell us why you're interested in this position and what makes you a great fit..."
              className="w-full p-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 resize-y"
            />
            <p className="text-gray-500 text-sm mt-2">Your resume from your profile will be automatically included</p>
          </div>

          <div className="flex space-x-4">
            <button
              onClick={submitApplication}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {loading && <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>}
              <span>{loading ? 'Submitting...' : 'Submit Application'}</span>
            </button>
            <button
              onClick={() => setShowApplicationModal(false)}
              className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const JobCard = ({ job }) => (
    <div className="group bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-500 hover:scale-105">
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
                <span>{job.location || 'Remote'}</span>
              </span>
              <span className="flex items-center space-x-1">
                <span>⏰</span>
                <span>{job.type}</span>
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => handleSaveJob(job._id)}
            className={`p-2 rounded-full transition-colors ${
              savedJobs.has(job._id) 
                ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' 
                : 'bg-white/10 text-gray-400 hover:bg-white/20 hover:text-white'
            }`}
            title={savedJobs.has(job._id) ? 'Remove from saved' : 'Save job'}
          >
            <span className="text-xl">{savedJobs.has(job._id) ? '❤️' : '🤍'}</span>
          </button>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-gray-300 text-lg leading-relaxed">{job.description}</p>
      </div>

      {job.skills && job.skills.length > 0 && (
        <div className="mb-6">
          <h4 className="text-white font-semibold mb-3">Key Requirements:</h4>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill, index) => (
              <span key={index} className="px-3 py-1 bg-purple-500/20 text-purple-300 text-sm rounded-lg border border-purple-500/30">
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-purple-400">{formatSalary(job.salaryRange)}</div>
          <div className="text-sm text-gray-400">Salary</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-400">{job.experienceLevel}</div>
          <div className="text-sm text-gray-400">Level</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-yellow-400">{new Date(job.createdAt).toLocaleDateString()}</div>
          <div className="text-sm text-gray-400">Posted</div>
        </div>
      </div>

      <div className="flex space-x-4">
        {appliedJobs.has(job._id) ? (
          <button 
            disabled
            className="flex-1 bg-gradient-to-r from-gray-500 to-gray-600 text-white py-3 px-6 rounded-xl font-medium cursor-not-allowed opacity-50 flex items-center justify-center space-x-2"
          >
            <span>✓</span>
            <span>Applied</span>
          </button>
        ) : (
          <button 
            onClick={() => handleApplyToJob(job)}
            className="flex-1 bg-gradient-to-r from-green-500 to-cyan-600 hover:from-green-600 hover:to-cyan-700 text-white py-3 px-6 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center justify-center space-x-2"
          >
            <span>📝</span>
            <span>Apply Now</span>
          </button>
        )}
        <button 
          onClick={() => handleSaveJob(job._id)}
          className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 hover:scale-105 flex items-center space-x-2 ${
            savedJobs.has(job._id)
              ? 'bg-gradient-to-r from-red-500 to-pink-600 hover:from-red-600 hover:to-pink-700 text-white'
              : 'bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700 text-white'
          }`}
        >
          <span>{savedJobs.has(job._id) ? '💔' : '❤️'}</span>
          <span>{savedJobs.has(job._id) ? 'Unsave' : 'Save'}</span>
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
            🔍 Find Your Dream Job
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light">
            Discover amazing opportunities and take the next step in your career
          </p>
        </div>

        {/* Message Display */}
        {message.text && (
          <div className={`mb-6 p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-500/20 border border-green-500/50 text-green-300' 
              : 'bg-red-500/20 border border-red-500/50 text-red-300'
          }`}>
            {message.text}
          </div>
        )}

        {/* Search and Filters */}
        <div className="mb-12">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search jobs by title, company, or keywords..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-6 py-4 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
                  />
                  <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">🔍</span>
                </div>
              </div>
              
              <select
                value={filters.department}
                onChange={(e) => setFilters(prev => ({ ...prev, department: e.target.value }))}
                className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
              >
                <option value="">All Departments</option>
                <option value="Engineering">Engineering</option>
                <option value="Product">Product</option>
                <option value="Design">Design</option>
                <option value="Marketing">Marketing</option>
                <option value="Sales">Sales</option>
              </select>

              <select
                value={filters.experienceLevel}
                onChange={(e) => setFilters(prev => ({ ...prev, experienceLevel: e.target.value }))}
                className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
              >
                <option value="">All Levels</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="lead">Lead Level</option>
              </select>

              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
              >
                <option value="">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
              </select>
            </div>
          </div>
        </div>

        {/* Job Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
            <div className="text-4xl mb-4">💼</div>
            <div className="text-3xl font-bold text-blue-400 mb-2">{filteredJobs.length}</div>
            <div className="text-gray-300">Available Jobs</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
            <div className="text-4xl mb-4">📝</div>
            <div className="text-3xl font-bold text-green-400 mb-2">{appliedJobs.size}</div>
            <div className="text-gray-300">Applications Sent</div>
          </div>
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 text-center">
            <div className="text-4xl mb-4">❤️</div>
            <div className="text-3xl font-bold text-purple-400 mb-2">{savedJobs.size}</div>
            <div className="text-gray-300">Saved Jobs</div>
          </div>
        </div>

        {/* Jobs List */}
        <div className="space-y-8">
          {loading ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">⏳</div>
              <h3 className="text-3xl font-bold text-gray-400 mb-4">Loading jobs...</h3>
            </div>
          ) : filteredJobs.length > 0 ? (
            filteredJobs.map((job) => (
              <JobCard key={job._id} job={job} />
            ))
          ) : (
            <div className="text-center py-16">
              <div className="text-8xl mb-6">🔍</div>
              <h3 className="text-3xl font-bold text-gray-400 mb-4">No jobs found</h3>
              <p className="text-gray-500 text-lg">Try adjusting your search criteria or check back later for new opportunities</p>
            </div>
          )}
        </div>
      </div>

      <ApplicationModal />
      <Footer />
    </div>
  );
}
