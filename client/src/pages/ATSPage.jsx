
import { useState, useEffect } from 'react';
import { useLocation, useSearchParams } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../contexts/AuthContext';

export default function ATSPage() {
  const { apiCall } = useAuth();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  
  // State management
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedJob, setSelectedJob] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [selectedCandidates, setSelectedCandidates] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('matchScore');
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadJobs();
    
    // Check if a specific job is requested
    const jobId = searchParams.get('jobId');
    const candidateId = searchParams.get('candidateId');
    
    if (jobId) {
      loadJobDetails(jobId);
      if (candidateId) {
        setActiveTab('candidates');
      }
    }
  }, [searchParams]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs?status=active');
      const data = await response.json();
      
      if (data.success) {
        setJobs(data.data);
        if (data.data.length > 0 && !selectedJob) {
          setSelectedJob(data.data[0]);
          loadJobApplications(data.data[0]._id);
        }
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
      setMessage({ type: 'error', text: 'Failed to load jobs' });
    } finally {
      setLoading(false);
    }
  };

  const loadJobDetails = async (jobId) => {
    try {
      const response = await apiCall(`/api/jobs/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setSelectedJob(data.data);
          loadJobApplications(jobId);
        }
      }
    } catch (error) {
      console.error('Error loading job details:', error);
    }
  };

  const loadJobApplications = async (jobId) => {
    try {
      const response = await apiCall(`/api/admin/job-applications/${jobId}`);
      if (response.ok) {
        const data = await response.json();
        setJobApplications(data.data || []);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
      setJobApplications([]);
    }
  };

  const calculateATSScore = async (candidateId) => {
    if (!selectedJob) return;

    try {
      setAnalysisLoading(true);
      setMessage({ type: 'info', text: 'Calculating ATS score...' });

      const candidate = jobApplications.find(app => app._id === candidateId);
      if (!candidate || !candidate.applicant?.profile) {
        throw new Error('Candidate data not found');
      }

      // Create resume text from candidate profile
      const resumeText = `
        Name: ${candidate.applicant.firstName} ${candidate.applicant.lastName}
        Email: ${candidate.applicant.email}
        Phone: ${candidate.applicant.profile.phone || ''}
        Location: ${candidate.applicant.profile.address?.city || ''}
        
        Professional Summary: ${candidate.applicant.profile.bio || ''}
        
        Experience: ${candidate.applicant.profile.totalExperience || ''}
        Current Company: ${candidate.applicant.profile.currentCompany || ''}
        Current Position: ${candidate.applicant.profile.currentDesignation || ''}
        
        Education: ${candidate.applicant.profile.degree || ''}
        University: ${candidate.applicant.profile.university || ''}
        Graduation Year: ${candidate.applicant.profile.graduationYear || ''}
        
        Skills: ${(candidate.applicant.profile.skills || []).join(', ')}
        
        Expected Salary: ${candidate.applicant.profile.expectedSalary || ''}
        Notice Period: ${candidate.applicant.profile.noticePeriod || ''}
        
        ${candidate.coverLetter || ''}
      `;

      const jobDescription = `
        Position: ${selectedJob.title}
        Department: ${selectedJob.department}
        Experience Level: ${selectedJob.experienceLevel}
        Location: ${selectedJob.location}
        Work Mode: ${selectedJob.workMode}
        
        Required Skills: ${(selectedJob.skills || []).join(', ')}
        
        Job Description: ${selectedJob.description}
        
        Requirements:
        Education: ${selectedJob.requirements?.education || ''}
        Certifications: ${(selectedJob.requirements?.certifications || []).join(', ')}
        
        Salary Range: ${selectedJob.salaryRange?.min ? `$${selectedJob.salaryRange.min}k` : ''} ${selectedJob.salaryRange?.max ? `- $${selectedJob.salaryRange.max}k` : ''}
      `;

      const response = await fetch('/api/analyze/single', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText,
          jobDescription
        })
      });

      const result = await response.json();
      
      if (result.success) {
        // Update the candidate's AI analysis
        const updatedApplications = jobApplications.map(app => {
          if (app._id === candidateId) {
            return {
              ...app,
              aiAnalysis: {
                ...result.data,
                analysisDate: new Date()
              }
            };
          }
          return app;
        });
        
        setJobApplications(updatedApplications);
        
        // Show appropriate message based on analysis type
        if (result.data.fallbackAnalysis) {
          setMessage({ 
            type: 'info', 
            text: 'ATS score calculated using backup analysis due to high API demand. For detailed analysis, please try again later.' 
          });
        } else {
          setMessage({ type: 'success', text: 'ATS score calculated successfully!' });
        }
      } else {
        throw new Error(result.error || 'Analysis failed');
      }
    } catch (error) {
      console.error('Error calculating ATS score:', error);
      
      let errorMessage = `Failed to calculate ATS score: ${error.message}`;
      if (error.message.includes('overloaded')) {
        errorMessage += ' The AI service is currently experiencing high demand. Please try again in a few moments.';
      }
      
      setMessage({ type: 'error', text: errorMessage });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const updateCandidateStatus = async (candidateId, newStatus) => {
    try {
      const response = await apiCall(`/api/applications/${candidateId}/${getActionFromStatus(newStatus)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: '' })
      });

      if (response.ok) {
        loadJobApplications(selectedJob._id);
        setMessage({ type: 'success', text: 'Candidate status updated successfully!' });
      }
    } catch (error) {
      console.error('Error updating candidate status:', error);
      setMessage({ type: 'error', text: 'Failed to update candidate status' });
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

  const getScoreColor = (score) => {
    if (score >= 90) return 'text-green-400 bg-green-500/20';
    if (score >= 80) return 'text-blue-400 bg-blue-500/20';
    if (score >= 70) return 'text-yellow-400 bg-yellow-500/20';
    if (score >= 60) return 'text-orange-400 bg-orange-500/20';
    return 'text-red-400 bg-red-500/20';
  };

  const getStatusColor = (status) => {
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

  // Filter and sort candidates
  const filteredCandidates = jobApplications
    .filter(app => {
      const matchesSearch = app.applicant && (
        `${app.applicant.firstName} ${app.applicant.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.applicant.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'matchScore':
          return (b.aiAnalysis?.matchPercentage || 0) - (a.aiAnalysis?.matchPercentage || 0);
        case 'name':
          const nameA = `${a.applicant?.firstName || ''} ${a.applicant?.lastName || ''}`;
          const nameB = `${b.applicant?.firstName || ''} ${b.applicant?.lastName || ''}`;
          return nameA.localeCompare(nameB);
        case 'date':
          return new Date(b.createdAt) - new Date(a.createdAt);
        case 'status':
          return a.status.localeCompare(b.status);
        default:
          return 0;
      }
    });

  const JobOverview = () => (
    <div className="space-y-8">
      {selectedJob && (
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="flex items-center space-x-4 mb-4">
                <h2 className="text-3xl font-bold text-white">{selectedJob.title}</h2>
                <span className="px-3 py-1 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 text-cyan-300 text-sm rounded-lg border border-cyan-500/30 font-mono">
                  {selectedJob.jobId}
                </span>
              </div>
              <div className="flex items-center space-x-6 text-gray-300 mb-4">
                <span className="flex items-center space-x-1">
                  <span>🏢</span>
                  <span>{selectedJob.department}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>📍</span>
                  <span>{selectedJob.location || 'Remote'}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>💼</span>
                  <span>{selectedJob.experienceLevel}</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>🔄</span>
                  <span>{selectedJob.workMode || 'Hybrid'}</span>
                </span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-400 mb-1">
                {selectedJob.salaryRange?.min && selectedJob.salaryRange?.max
                  ? `$${selectedJob.salaryRange.min}k - $${selectedJob.salaryRange.max}k`
                  : 'Competitive Salary'}
              </div>
              <div className="text-sm text-gray-400">Annual Salary</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/20 rounded-2xl p-4 text-center border border-blue-500/30">
              <div className="text-2xl font-bold text-blue-400">{jobApplications.length}</div>
              <div className="text-sm text-gray-300">Total Applications</div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-2xl p-4 text-center border border-green-500/30">
              <div className="text-2xl font-bold text-green-400">
                {jobApplications.filter(app => app.status === 'shortlisted').length}
              </div>
              <div className="text-sm text-gray-300">Shortlisted</div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/20 rounded-2xl p-4 text-center border border-purple-500/30">
              <div className="text-2xl font-bold text-purple-400">
                {jobApplications.filter(app => app.status === 'interview-scheduled').length}
              </div>
              <div className="text-sm text-gray-300">Interviews</div>
            </div>
            <div className="bg-gradient-to-br from-yellow-500/20 to-yellow-600/20 rounded-2xl p-4 text-center border border-yellow-500/30">
              <div className="text-2xl font-bold text-yellow-400">
                {jobApplications.filter(app => app.aiAnalysis?.matchPercentage >= 80).length}
              </div>
              <div className="text-sm text-gray-300">High Match (80%+)</div>
            </div>
          </div>

          <div className="mb-6">
            <h3 className="text-xl font-bold text-white mb-4">Required Skills</h3>
            <div className="flex flex-wrap gap-2">
              {(selectedJob.skills || []).map((skill, index) => (
                <span key={index} className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 text-sm rounded-lg border border-purple-500/30">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xl font-bold text-white mb-4">Job Description</h3>
            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
              <p className="text-gray-300 leading-relaxed">{selectedJob.description}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const ResumeUploadView = () => {
    const [uploadedResumes, setUploadedResumes] = useState([]);
    const [processingResults, setProcessingResults] = useState([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [dragActive, setDragActive] = useState(false);

    const handleDrag = (e) => {
      e.preventDefault();
      e.stopPropagation();
      if (e.type === "dragenter" || e.type === "dragover") {
        setDragActive(true);
      } else if (e.type === "dragleave") {
        setDragActive(false);
      }
    };

    const handleDrop = (e) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      
      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const droppedFiles = Array.from(e.dataTransfer.files);
        const validFiles = droppedFiles.filter(file => 
          file.type === 'application/pdf' || 
          file.name.endsWith('.docx') || 
          file.name.endsWith('.doc')
        );
        
        if (validFiles.length > 0) {
          setUploadedResumes(prev => [...prev, ...validFiles]);
        }
      }
    };

    const handleFileInput = (e) => {
      const selectedFiles = Array.from(e.target.files);
      setUploadedResumes(prev => [...prev, ...selectedFiles]);
    };

    const removeFile = (index) => {
      setUploadedResumes(prev => prev.filter((_, i) => i !== index));
    };

    const processResumes = async () => {
      if (!selectedJob || uploadedResumes.length === 0) {
        setMessage({ type: 'error', text: 'Please select a job and upload resumes first' });
        return;
      }

      setIsProcessing(true);
      setMessage({ type: 'info', text: 'Processing resumes...' });

      try {
        const jobDescription = `
          Position: ${selectedJob.title}
          Department: ${selectedJob.department}
          Experience Level: ${selectedJob.experienceLevel}
          Location: ${selectedJob.location}
          Work Mode: ${selectedJob.workMode}
          
          Required Skills: ${(selectedJob.skills || []).join(', ')}
          
          Job Description: ${selectedJob.description}
          
          Requirements:
          Education: ${selectedJob.requirements?.education || ''}
          Certifications: ${(selectedJob.requirements?.certifications || []).join(', ')}
          
          Salary Range: ${selectedJob.salaryRange?.min ? `$${selectedJob.salaryRange.min}k` : ''} ${selectedJob.salaryRange?.max ? `- $${selectedJob.salaryRange.max}k` : ''}
        `;

        const formData = new FormData();
        uploadedResumes.forEach(file => {
          formData.append('resumes', file);
        });
        formData.append('jobDescription', jobDescription);

        const response = await fetch('/api/analyze', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();
        
        if (result.success) {
          console.log('Processing results:', result);
          
          // Transform results to match expected format
          const transformedResults = result.results.map(res => ({
            ...res,
            extractedInfo: res.extractedInfo || {},
            aiAnalysis: res.aiAnalysis || res,
            matchPercentage: res.matchPercentage || 0,
            overallAssessment: res.overallAssessment || 'Analysis completed',
            strengths: res.strengths || [],
            weaknesses: res.weaknesses || [],
            status: res.status || 'success'
          }));
          
          setProcessingResults(transformedResults);
          setMessage({ 
            type: 'success', 
            text: `Successfully processed ${transformedResults.length} resumes. Review candidates below to confirm and add to database.` 
          });
        } else {
          throw new Error(result.message || 'Processing failed');
        }
      } catch (error) {
        console.error('Resume processing error:', error);
        setMessage({ type: 'error', text: `Processing failed: ${error.message}` });
      } finally {
        setIsProcessing(false);
      }
    };

    const confirmCandidate = async (candidateData) => {
      try {
        console.log('Confirming candidate:', candidateData);
        
        setMessage({ type: 'info', text: 'Adding candidate to database...' });
        
        const response = await apiCall('/api/admin/confirm-candidate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...candidateData,
            jobId: selectedJob._id
          })
        });

        const result = await response.json();
        console.log('Confirm candidate response:', result);

        if (response.ok && result.success) {
          setMessage({ 
            type: 'success', 
            text: `✅ ${candidateData.extractedInfo?.name || candidateData.fileName} successfully added to candidate database!` 
          });
          
          // Remove from processing results
          setProcessingResults(prev => 
            prev.filter(result => result.fileName !== candidateData.fileName)
          );
          
          // Refresh candidates if we're on that tab
          if (activeTab === 'candidates') {
            loadJobApplications(selectedJob._id);
          }
        } else {
          throw new Error(result.error || 'Failed to confirm candidate');
        }
      } catch (error) {
        console.error('Error confirming candidate:', error);
        setMessage({ type: 'error', text: `Failed to add candidate: ${error.message}` });
      }
    };

    return (
      <div className="space-y-8">
        {/* Upload Section */}
        <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
            <span className="mr-3">📤</span>
            Resume Upload & Processing
          </h3>
          
          <div
            className={`relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 ${
              dragActive
                ? 'border-blue-400 bg-blue-400/10 scale-105'
                : 'border-gray-600 hover:border-gray-500 hover:bg-white/5'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              id="resume-upload"
              type="file"
              multiple
              accept=".pdf,.docx,.doc"
              onChange={handleFileInput}
              className="hidden"
            />
            
            <div className="space-y-4">
              <div className="text-6xl opacity-50">📁</div>
              
              <div>
                <label 
                  htmlFor="resume-upload" 
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl cursor-pointer font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <span>📎</span>
                  <span>Choose Resume Files</span>
                </label>
              </div>
              
              <p className="text-gray-400 text-sm">
                or drag and drop resume files here
              </p>
              
              <p className="text-gray-500 text-xs">
                Supports PDF, DOC, DOCX files • Max 10MB per file
              </p>
            </div>
          </div>

          {/* Uploaded Files */}
          {uploadedResumes.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="text-lg font-semibold text-white">Uploaded Files ({uploadedResumes.length})</h4>
              {uploadedResumes.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">
                      {file.type === 'application/pdf' ? '📄' : '📝'}
                    </div>
                    <div>
                      <p className="text-white font-medium">{file.name}</p>
                      <p className="text-gray-400 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              
              <button
                onClick={processResumes}
                disabled={isProcessing || !selectedJob}
                className="w-full mt-4 px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? 'Processing Resumes...' : 'Process & Analyze Resumes'}
              </button>
            </div>
          )}
        </div>

        {/* Processing Results */}
        {processingResults.length > 0 && (
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-md rounded-2xl p-4 border border-green-500/20">
              <h3 className="text-2xl font-bold text-white flex items-center">
                <span className="mr-3">🎯</span>
                Analysis Results - Pending Confirmation ({processingResults.length})
              </h3>
              <p className="text-green-300 mt-2">Review the extracted information below and confirm candidates to add them to your database.</p>
            </div>
            
            {processingResults.map((result, index) => (
              <div key={index} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-6 border border-white/20">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="text-xl font-bold text-white">{result.fileName}</h4>
                      {result.status === 'success' ? (
                        <span className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded-full">✓ Processed</span>
                      ) : (
                        <span className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded-full">✗ Error</span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-gray-400">Match Score:</span>
                        <div className={`text-lg font-bold ${result.matchPercentage >= 80 ? 'text-green-400' : result.matchPercentage >= 60 ? 'text-yellow-400' : 'text-orange-400'}`}>
                          {result.matchPercentage || 0}%
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Name:</span>
                        <span className="text-white font-medium">{result.extractedInfo?.name || 'Not found'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Email:</span>
                        <span className="text-white">{result.extractedInfo?.email || 'Not found'}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 block">Phone:</span>
                        <span className="text-white">{result.extractedInfo?.phone || 'Not found'}</span>
                      </div>
                    </div>
                    
                    {result.error && (
                      <div className="mt-3 p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
                        <p className="text-red-300 text-sm">Error: {result.error}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    {result.status === 'success' ? (
                      <>
                        <button
                          onClick={() => confirmCandidate(result)}
                          className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                        >
                          ✓ Confirm & Add
                        </button>
                        <button
                          onClick={() => setProcessingResults(prev => prev.filter((_, i) => i !== index))}
                          className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                        >
                          ✗ Reject
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => setProcessingResults(prev => prev.filter((_, i) => i !== index))}
                        className="px-4 py-2 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-lg font-medium transition-all duration-300"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>

                {/* Show extracted information only for successful analyses */}
                {result.status === 'success' && (
                  <>
                    {/* Extracted Information */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-4">
                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h5 className="text-white font-semibold mb-2">👤 Personal Info</h5>
                        <div className="space-y-1 text-sm">
                          <div><span className="text-gray-400">Name:</span> <span className="text-white">{result.extractedInfo?.name || result.extractedInfo?.firstName + ' ' + result.extractedInfo?.lastName || 'Not found'}</span></div>
                          <div><span className="text-gray-400">Email:</span> <span className="text-white">{result.extractedInfo?.email || 'Not found'}</span></div>
                          <div><span className="text-gray-400">Phone:</span> <span className="text-white">{result.extractedInfo?.phone || 'Not found'}</span></div>
                          <div><span className="text-gray-400">Location:</span> <span className="text-white">{result.extractedInfo?.location || 'Not specified'}</span></div>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h5 className="text-white font-semibold mb-2">🎓 Education & Experience</h5>
                        <div className="space-y-1 text-sm">
                          <div><span className="text-gray-400">Education:</span> <span className="text-white">{result.extractedInfo?.education || result.extractedInfo?.degree || 'Not specified'}</span></div>
                          <div><span className="text-gray-400">Experience:</span> <span className="text-white">{result.extractedInfo?.totalYearsExperience || result.extractedInfo?.experience || 'Not specified'}</span></div>
                          <div><span className="text-gray-400">Current Role:</span> <span className="text-white">{result.extractedInfo?.currentRole || 'Not specified'}</span></div>
                          <div><span className="text-gray-400">University:</span> <span className="text-white">{result.extractedInfo?.university || 'Not specified'}</span></div>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h5 className="text-white font-semibold mb-2">🛠️ Skills & Languages</h5>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-400 block">Skills:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {(result.extractedInfo?.skills || result.skillsAnalysis?.matchingSkills || []).slice(0, 6).map((skill, i) => (
                                <span key={i} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">{skill}</span>
                              ))}
                              {!(result.extractedInfo?.skills || result.skillsAnalysis?.matchingSkills)?.length && (
                                <span className="text-gray-400 text-xs">No skills extracted</span>
                              )}
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Languages:</span>
                            <span className="text-white">{(result.extractedInfo?.languages || []).join(', ') || 'Not specified'}</span>
                          </div>
                          <div>
                            <span className="text-gray-400 block">Certifications:</span>
                            <span className="text-white">{(result.extractedInfo?.certifications || []).join(', ') || 'None mentioned'}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* AI Analysis Summary */}
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <h5 className="text-white font-semibold mb-2 flex items-center">
                        <span className="mr-2">🤖</span>
                        AI Analysis Summary
                        {result.fallbackAnalysis && (
                          <span className="ml-2 text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded" title="Basic analysis due to API limits">
                            Basic Mode
                          </span>
                        )}
                      </h5>
                      <div className="text-sm text-gray-300 space-y-2">
                        <p><strong>Overall Assessment:</strong> {result.overallAssessment || 'Analysis completed'}</p>
                        {result.strengths && result.strengths.length > 0 && (
                          <p><strong>Key Strengths:</strong> {result.strengths.slice(0, 3).join(', ')}</p>
                        )}
                        {result.hiringRecommendation && (
                          <p><strong>Recommendation:</strong> 
                            <span className={`ml-1 px-2 py-1 rounded text-xs ${
                              result.hiringRecommendation === 'strong-hire' ? 'bg-green-500/20 text-green-300' :
                              result.hiringRecommendation === 'hire' ? 'bg-blue-500/20 text-blue-300' :
                              result.hiringRecommendation === 'maybe' ? 'bg-yellow-500/20 text-yellow-300' :
                              'bg-red-500/20 text-red-300'
                            }`}>
                              {result.hiringRecommendation.replace('-', ' ').toUpperCase()}
                            </span>
                          </p>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const CandidatesView = () => (
    <div className="space-y-8">
      {/* Controls */}
      <div className="flex flex-col lg:flex-row justify-between items-center space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Search candidates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-white/40"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="reviewing">Reviewing</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview-scheduled">Interview Scheduled</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
          >
            <option value="matchScore">Sort by Match Score</option>
            <option value="name">Sort by Name</option>
            <option value="date">Sort by Application Date</option>
            <option value="status">Sort by Status</option>
          </select>
        </div>
        
        <div className="flex items-center space-x-2">
          <span className="text-gray-300">{filteredCandidates.length} candidates</span>
        </div>
      </div>

      {/* Candidates List */}
      <div className="space-y-6">
        {filteredCandidates.length > 0 ? (
          filteredCandidates.map((application) => (
            <div key={application._id} className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center space-x-6">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl">
                      {application.applicant ? 
                        `${application.applicant.firstName?.charAt(0) || ''}${application.applicant.lastName?.charAt(0) || ''}` : 
                        '👤'}
                    </div>
                    {application.aiAnalysis?.matchPercentage && (
                      <div className="absolute -bottom-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                        {application.aiAnalysis.matchPercentage}%
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {application.applicant ? 
                        `${application.applicant.firstName} ${application.applicant.lastName}` : 
                        'Unknown Candidate'}
                    </h3>
                    <p className="text-gray-400 mb-2">{application.applicant?.email}</p>
                    <div className="flex items-center space-x-4 text-sm text-gray-400">
                      <span>📱 {application.applicant?.profile?.phone || 'No phone'}</span>
                      <span>📍 {application.applicant?.profile?.address?.city || 'Location not specified'}</span>
                      <span>💼 {application.applicant?.profile?.totalExperience || 'Experience not specified'}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  {application.aiAnalysis?.matchPercentage ? (
                    <div className={`px-4 py-2 rounded-lg font-bold text-lg ${getScoreColor(application.aiAnalysis.matchPercentage)}`}>
                      {application.aiAnalysis.matchPercentage}% Match
                    </div>
                  ) : (
                    <button
                      onClick={() => calculateATSScore(application._id)}
                      disabled={analysisLoading}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
                    >
                      {analysisLoading ? 'Calculating...' : '🎯 Calculate Score'}
                    </button>
                  )}
                  
                  <div className={`px-4 py-2 rounded-full text-sm font-medium text-white ${getStatusColor(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1).replace('-', ' ')}
                  </div>
                </div>
              </div>

              {/* Detailed Analysis */}
              {application.aiAnalysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="text-white font-semibold">📊 ATS Scores</h4>
                      {application.aiAnalysis.fallbackAnalysis && (
                        <span className="text-xs text-yellow-400 bg-yellow-500/20 px-2 py-1 rounded" title="Basic analysis due to API limits">
                          Basic
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Overall:</span>
                        <span className={`font-bold ${getScoreColor(application.aiAnalysis.atsScore?.overall || 0).split(' ')[0]}`}>
                          {application.aiAnalysis.atsScore?.overall || 0}%
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Keywords:</span>
                        <span className="text-white">{application.aiAnalysis.atsScore?.keywordMatch || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Skills:</span>
                        <span className="text-white">{application.aiAnalysis.atsScore?.skillsAlignment || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Experience:</span>
                        <span className="text-white">{application.aiAnalysis.atsScore?.experienceRelevance || 0}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Education:</span>
                        <span className="text-white">{application.aiAnalysis.atsScore?.educationFit || 0}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2">🎯 Skills Match</h4>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-gray-400">Matching Skills:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(application.aiAnalysis.skillsAnalysis?.matchingSkills || []).slice(0, 3).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-400">Missing Skills:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(application.aiAnalysis.skillsAnalysis?.missingCriticalSkills || []).slice(0, 2).map((skill, index) => (
                            <span key={index} className="px-2 py-1 bg-red-500/20 text-red-300 text-xs rounded">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2">💼 Experience</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Total Years:</span>
                        <span className="text-white">{application.aiAnalysis.experienceAnalysis?.totalYears || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Relevant:</span>
                        <span className="text-white">{application.aiAnalysis.experienceAnalysis?.relevantYears || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Level:</span>
                        <span className="text-white capitalize">{application.aiAnalysis.experienceAnalysis?.experienceMatch || 'N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h4 className="text-white font-semibold mb-2">🎓 Education</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-400">Degree Match:</span>
                        <span className="text-white capitalize">{application.aiAnalysis.educationAnalysis?.degreeMatch || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-400">Relevance:</span>
                        <span className="text-white capitalize">{application.aiAnalysis.educationAnalysis?.educationRelevance || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Strengths and Weaknesses */}
              {application.aiAnalysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h5 className="text-green-400 font-semibold mb-2">✅ Strengths</h5>
                    <ul className="space-y-1">
                      {(application.aiAnalysis.strengths || []).map((strength, index) => (
                        <li key={index} className="text-gray-300 text-sm">• {strength}</li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h5 className="text-yellow-400 font-semibold mb-2">⚠️ Areas for Improvement</h5>
                    <ul className="space-y-1">
                      {(application.aiAnalysis.weaknesses || []).map((weakness, index) => (
                        <li key={index} className="text-gray-300 text-sm">• {weakness}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 pt-4 border-t border-white/10">
                {application.applicant?.profile?.resume?.fileUrl && (
                  <a
                    href={application.applicant.profile.resume.fileUrl.startsWith('http') ? application.applicant.profile.resume.fileUrl : `http://localhost:8000${application.applicant.profile.resume.fileUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                    onClick={(e) => {
                      const url = application.applicant.profile.resume.fileUrl.startsWith('http') ? application.applicant.profile.resume.fileUrl : `http://localhost:8000${application.applicant.profile.resume.fileUrl}`;
                      window.open(url, '_blank');
                      e.preventDefault();
                    }}
                  >
                    📄 View Resume
                  </a>
                )}

                {application.status === 'pending' && (
                  <button 
                    onClick={() => updateCandidateStatus(application._id, 'reviewing')}
                    className="px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                  >
                    📋 Review
                  </button>
                )}

                {(application.status === 'reviewing' || application.status === 'pending') && (
                  <button 
                    onClick={() => updateCandidateStatus(application._id, 'shortlisted')}
                    className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-cyan-600 hover:from-emerald-600 hover:to-cyan-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                  >
                    ⭐ Shortlist
                  </button>
                )}

                {application.status === 'shortlisted' && (
                  <button 
                    onClick={() => updateCandidateStatus(application._id, 'interview-scheduled')}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                  >
                    🎤 Schedule Interview
                  </button>
                )}

                <button 
                  onClick={() => updateCandidateStatus(application._id, 'rejected')}
                  className="px-4 py-2 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-lg font-medium transition-all duration-300 hover:scale-105"
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">👥</div>
            <h3 className="text-3xl font-bold text-gray-400 mb-4">No Candidates Found</h3>
            <p className="text-gray-500 text-lg">No candidates match your current filters</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-cyan-500 mx-auto mb-4"></div>
          <p className="text-white text-xl">Loading ATS Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-cyan-400/8 to-blue-600/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-br from-pink-400/8 to-red-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-green-400/8 to-cyan-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            🎯 ATS Dashboard
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
            Analyze candidates with AI-powered scoring and comprehensive job matching
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-8">
            <div className={`p-4 rounded-lg border ${
              message.type === 'success' 
                ? 'bg-green-500/20 border-green-500/30 text-green-300' 
                : message.type === 'error'
                ? 'bg-red-500/20 border-red-500/30 text-red-300'
                : 'bg-blue-500/20 border-blue-500/30 text-blue-300'
            }`}>
              <p className="text-center font-medium">{message.text}</p>
            </div>
          </div>
        )}

        {/* Job Selection */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-6 border border-white/20">
            <h3 className="text-xl font-bold text-white mb-4">Select Job Position</h3>
            <select
              value={selectedJob?._id || ''}
              onChange={(e) => {
                const job = jobs.find(j => j._id === e.target.value);
                setSelectedJob(job);
                if (job) {
                  loadJobApplications(job._id);
                }
              }}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-white/40"
            >
              <option value="">Select a job position...</option>
              {jobs.map((job) => (
                <option key={job._id} value={job._id}>
                  {job.title} - {job.department} ({job.jobId})
                </option>
              ))}
            </select>
          </div>
        </div>

        {selectedJob && (
          <>
            {/* Tab Navigation */}
            <div className="flex space-x-2 bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md rounded-2xl p-2 mb-8 shadow-lg border border-white/20">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'overview'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                📋 Job Overview
              </button>
              <button
                onClick={() => setActiveTab('upload')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'upload'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                📤 Upload Resumes
              </button>
              <button
                onClick={() => setActiveTab('candidates')}
                className={`px-6 py-3 rounded-xl font-medium transition-all duration-300 ${
                  activeTab === 'candidates'
                    ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                👥 Candidates ({jobApplications.length})
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === 'overview' && <JobOverview />}
            {activeTab === 'upload' && <ResumeUploadView />}
            {activeTab === 'candidates' && <CandidatesView />}
          </>
        )}

        {!selectedJob && jobs.length === 0 && (
          <div className="text-center py-16">
            <div className="text-8xl mb-6">📝</div>
            <h3 className="text-3xl font-bold text-gray-400 mb-4">No Active Jobs Found</h3>
            <p className="text-gray-500 text-lg">Create job positions first to start analyzing candidates</p>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
