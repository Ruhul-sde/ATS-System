import { useState, useEffect } from 'react';

export default function JobRoleSelector({ onJobRoleSelect, onJobDescriptionChange }) {
  const [jobRoles, setJobRoles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJobRole, setSelectedJobRole] = useState(null);
  const [useCustomJD, setUseCustomJD] = useState(false);
  const [customJD, setCustomJD] = useState('');

  // Fetch job roles when component mounts
  useEffect(() => {
    fetchJobRoles();
  }, []);

  const fetchJobRoles = async () => {
    setLoading(true);
    setError('');
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please login to access job roles');
        return;
      }

      const response = await fetch('/api/ats/job-roles', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 503) {
          setError('Database not available - you can still use custom job descriptions');
          return;
        }
        throw new Error('Failed to fetch job roles');
      }

      const data = await response.json();
      if (data.success) {
        setJobRoles(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching job roles:', error);
      setError('Unable to load job roles. You can still use custom job descriptions.');
    } finally {
      setLoading(false);
    }
  };

  const handleJobRoleSelect = (jobRole) => {
    setSelectedJobRole(jobRole);
    setUseCustomJD(false);
    setCustomJD('');
    onJobRoleSelect(jobRole);
    onJobDescriptionChange(''); // Clear custom JD
  };

  const handleCustomJDToggle = () => {
    setUseCustomJD(!useCustomJD);
    if (!useCustomJD) {
      setSelectedJobRole(null);
      onJobRoleSelect(null);
    } else {
      setCustomJD('');
      onJobDescriptionChange('');
    }
  };

  const handleCustomJDChange = (value) => {
    setCustomJD(value);
    onJobDescriptionChange(value);
  };

  const filteredJobRoles = jobRoles.filter(role =>
    role.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (role.company && role.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (role.department && role.department.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="text-3xl">🎯</div>
        <div>
          <h2 className="text-2xl font-bold text-white">Job Description</h2>
          <p className="text-gray-400 text-sm">Select a job role or enter custom job description</p>
        </div>
      </div>

      {/* Toggle between job roles and custom JD */}
      <div className="flex space-x-4">
        <button
          onClick={() => handleCustomJDToggle()}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
            !useCustomJD 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          📋 Use Job Role
        </button>
        <button
          onClick={() => handleCustomJDToggle()}
          className={`px-4 py-2 rounded-xl font-medium transition-all duration-300 ${
            useCustomJD 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white' 
              : 'bg-white/10 text-gray-300 hover:bg-white/20'
          }`}
        >
          ✏️ Custom Description
        </button>
      </div>

      {!useCustomJD ? (
        // Job Role Selection
        <div className="space-y-4">
          {error && (
            <div className="p-4 bg-yellow-500/20 border border-yellow-500/30 rounded-xl text-yellow-300">
              <p className="text-sm">{error}</p>
            </div>
          )}

          {jobRoles.length > 0 && (
            <div className="space-y-4">
              {/* Search */}
              <div>
                <input
                  type="text"
                  placeholder="Search job roles..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15"
                />
              </div>

              {/* Selected Job Role */}
              {selectedJobRole && (
                <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-green-300 font-semibold">{selectedJobRole.title}</h3>
                      <p className="text-green-400 text-sm">
                        {selectedJobRole.company} • {selectedJobRole.department}
                      </p>
                    </div>
                    <button
                      onClick={() => handleJobRoleSelect(null)}
                      className="text-green-300 hover:text-white text-sm"
                    >
                      ✕ Clear
                    </button>
                  </div>
                </div>
              )}

              {/* Job Roles List */}
              <div className="max-h-64 overflow-y-auto space-y-2">
                {loading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin text-3xl mb-2">⏳</div>
                    <p className="text-gray-400">Loading job roles...</p>
                  </div>
                ) : filteredJobRoles.length > 0 ? (
                  filteredJobRoles.map((role) => (
                    <div
                      key={role._id}
                      onClick={() => handleJobRoleSelect(role)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all duration-300 hover:scale-[1.02] ${
                        selectedJobRole?._id === role._id
                          ? 'bg-blue-500/20 border-blue-500/40 text-blue-300'
                          : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold">{role.title}</h3>
                          <p className="text-sm text-gray-400">
                            {role.company} • {role.department}
                          </p>
                          {role.location && (
                            <p className="text-xs text-gray-500">📍 {role.location}</p>
                          )}
                        </div>
                        {role.salaryRange && (role.salaryRange.min || role.salaryRange.max) && (
                          <div className="text-sm text-green-400">
                            ${role.salaryRange.min || 0}k - ${role.salaryRange.max || 0}k
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-2">🔍</div>
                    <p className="text-gray-400">No job roles found</p>
                    {searchTerm && (
                      <p className="text-gray-500 text-sm">Try a different search term</p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {!loading && jobRoles.length === 0 && !error && (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📝</div>
              <p className="text-gray-400">No job roles available</p>
              <p className="text-gray-500 text-sm">Use custom job description instead</p>
            </div>
          )}
        </div>
      ) : (
        // Custom Job Description
        <div className="space-y-4">
          <textarea
            value={customJD}
            onChange={(e) => handleCustomJDChange(e.target.value)}
            placeholder="Enter the job description here...

Include:
• Job title and requirements
• Required skills and technologies
• Experience level needed
• Key responsibilities
• Education requirements
• Any specific qualifications"
            rows={12}
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40 focus:bg-white/15 resize-none"
          />
          
          {customJD && (
            <div className="flex items-center justify-between text-sm text-gray-400">
              <span>{customJD.length} characters</span>
              <span className={customJD.length < 100 ? 'text-red-400' : 'text-green-400'}>
                {customJD.length < 100 ? 'Too short - add more details' : 'Good length'}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}