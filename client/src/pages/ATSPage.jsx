
import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import JobRoleSelector from '../components/JobRoleSelector';
import AIAnalysis from '../components/AIAnalysis';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Enhanced Mock ATS Analysis Results for demonstration
const mockAnalysisResults = [
  {
    fileName: "Sarah_Chen_Resume.pdf",
    matchPercentage: 92,
    matchingSkills: ["React", "TypeScript", "Node.js", "AWS", "GraphQL", "Docker", "JavaScript", "Git", "Agile"],
    missingSkills: ["Kubernetes", "Jenkins", "Terraform", "CI/CD", "Microservices"],
    experienceMatch: "senior",
    educationRelevance: "high",
    strengths: [
      "Strong technical leadership with 5+ years experience",
      "Full-stack expertise across modern tech stack",
      "Cloud architecture experience with AWS",
      "Proven track record in scalable applications",
      "Excellent communication and mentoring skills"
    ],
    weaknesses: [
      "Limited DevOps experience with container orchestration",
      "No mention of testing frameworks or TDD practices",
      "Missing CI/CD pipeline experience",
      "Could benefit from more system design examples"
    ],
    recommendations: [
      "Consider DevOps certification (AWS/K8s)",
      "Highlight any testing experience you have",
      "Emphasize leadership and mentoring projects",
      "Add examples of system architecture decisions",
      "Include metrics on performance improvements"
    ],
    keywordMatches: 18,
    totalKeywords: 25,
    overallAssessment: "Excellent candidate with strong technical skills and leadership experience. Perfect fit for senior developer role with minimal gaps.",
    interviewReadiness: "ready",
    improvementAreas: [
      "DevOps and Infrastructure",
      "Testing Methodologies",
      "System Design Documentation"
    ],
    atsScore: {
      technical: 95,
      experience: 92,
      keywords: 72,
      education: 88,
      overall: 92
    },
    status: "success"
  },
  {
    fileName: "Michael_Rodriguez_Resume.pdf",
    matchPercentage: 78,
    matchingSkills: ["JavaScript", "React", "Node.js", "MongoDB", "HTML", "CSS", "Git"],
    missingSkills: ["TypeScript", "AWS", "GraphQL", "Docker", "Testing", "Redis", "PostgreSQL"],
    experienceMatch: "mid",
    educationRelevance: "medium",
    strengths: [
      "Good JavaScript fundamentals and ES6+ knowledge",
      "MERN stack experience with 2+ projects",
      "Quick learner with demonstrated growth",
      "Strong problem-solving abilities",
      "Good team collaboration skills"
    ],
    weaknesses: [
      "Limited cloud platform experience",
      "No TypeScript background or static typing",
      "Minimal testing knowledge and coverage",
      "Missing experience with scalable architectures",
      "Could use more database variety exposure"
    ],
    recommendations: [
      "Learn TypeScript to improve code quality",
      "Gain hands-on AWS or cloud platform experience",
      "Practice testing frameworks (Jest, React Testing Library)",
      "Build projects showcasing scalable architecture",
      "Explore different database technologies"
    ],
    keywordMatches: 10,
    totalKeywords: 25,
    overallAssessment: "Solid mid-level candidate with room for growth. Good cultural fit with some skill gaps that can be addressed.",
    interviewReadiness: "needs-preparation",
    improvementAreas: [
      "Cloud Technologies",
      "Testing & Quality Assurance",
      "Advanced JavaScript/TypeScript",
      "Database Design"
    ],
    atsScore: {
      technical: 75,
      experience: 70,
      keywords: 40,
      education: 75,
      overall: 78
    },
    status: "success"
  },
  {
    fileName: "Alice_Johnson_Resume.pdf",
    matchPercentage: 85,
    matchingSkills: ["React", "TypeScript", "Python", "AWS", "Docker", "Jest", "PostgreSQL", "Redis", "Git"],
    missingSkills: ["GraphQL", "Microservices", "Kubernetes", "Jenkins"],
    experienceMatch: "senior",
    educationRelevance: "high",
    strengths: [
      "Excellent full-stack skills with modern technologies",
      "Strong testing background with comprehensive coverage",
      "Cloud-native development experience",
      "Multi-language proficiency (JS/TS/Python)",
      "Good understanding of database optimization"
    ],
    weaknesses: [
      "Limited microservices architecture experience",
      "No GraphQL API development exposure",
      "Missing container orchestration skills",
      "Could benefit from more leadership examples"
    ],
    recommendations: [
      "Explore GraphQL implementation in existing projects",
      "Study microservices architecture patterns",
      "Highlight system design and leadership experience",
      "Consider Kubernetes certification",
      "Showcase performance optimization achievements"
    ],
    keywordMatches: 15,
    totalKeywords: 25,
    overallAssessment: "Strong candidate with excellent technical foundation. Would excel in the role with minimal onboarding required.",
    interviewReadiness: "ready",
    improvementAreas: [
      "Microservices Architecture",
      "API Design (GraphQL)",
      "Container Orchestration"
    ],
    atsScore: {
      technical: 88,
      experience: 85,
      keywords: 60,
      education: 90,
      overall: 85
    },
    status: "success"
  }
];

export default function ATSPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [files, setFiles] = useState([]);
  const [selectedJobRole, setSelectedJobRole] = useState(null);
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [message, setMessage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [analysisStats, setAnalysisStats] = useState(null);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    setMessage({ type: 'success', text: `${selectedFiles.length} file(s) selected successfully!` });
    
    // Clear previous results when new files are selected
    setResults([]);
    setAnalysisStats(null);
    
    // Auto-advance to next step if files are selected
    if (selectedFiles.length > 0 && currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleJobRoleSelect = (jobRole) => {
    setSelectedJobRole(jobRole);
    if (jobRole && currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleJobDescriptionChange = (value) => {
    setJobDescription(value);
    if (value.trim().length > 100 && currentStep === 2) {
      setCurrentStep(3);
    }
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one resume file.' });
      return;
    }

    if (!selectedJobRole && !jobDescription.trim()) {
      setMessage({ type: 'error', text: 'Please select a job role or enter a job description.' });
      return;
    }

    setIsAnalyzing(true);
    setResults([]);
    setProgress(0);
    setMessage({ type: 'info', text: 'Starting AI analysis... This may take a few minutes.' });

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Please login to analyze resumes');
      }

      const analysisResults = [];
      const total = files.length;
      
      // Analyze each file individually
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        setProgress(Math.round(((i) / total) * 100));
        
        try {
          console.log(`Analyzing file ${i + 1}/${total}: ${file.name}`);
          
          // Create FormData for this file
          const formData = new FormData();
          formData.append('resume', file);
          
          if (selectedJobRole) {
            formData.append('jobRoleId', selectedJobRole._id);
          } else {
            formData.append('jobDescription', jobDescription);
          }

          // Call the new ATS analyze endpoint
          const response = await fetch('/api/ats/analyze', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`
            },
            body: formData,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error(`Error analyzing ${file.name}:`, errorData);
            
            // Add failed result
            analysisResults.push({
              fileName: file.name,
              error: errorData.error || `Analysis failed: ${response.status}`,
              status: 'error'
            });
            continue;
          }

          const data = await response.json();
          
          if (data.success) {
            // Transform the result to match expected format
            const result = {
              fileName: file.name,
              matchPercentage: data.data.matchPercentage || 0,
              matchingSkills: data.data.matchingSkills || [],
              missingSkills: data.data.missingSkills || [],
              strengths: data.data.strengths || [],
              weaknesses: data.data.weaknesses || [],
              recommendations: data.data.recommendations || [],
              overallAssessment: data.data.overallAssessment || '',
              keywordMatches: data.data.keywordMatches || [],
              atsScore: data.data.scoringBreakdown || {},
              detailedAnalysis: data.data.detailedKeywordAnalysis || {},
              skillGapAnalysis: data.data.skillGapAnalysis || {},
              status: 'success'
            };
            
            analysisResults.push(result);
          } else {
            analysisResults.push({
              fileName: file.name,
              error: data.error || 'Analysis failed',
              status: 'error'
            });
          }
        } catch (fileError) {
          console.error(`Error processing ${file.name}:`, fileError);
          analysisResults.push({
            fileName: file.name,
            error: fileError.message,
            status: 'error'
          });
        }
      }

      setProgress(100);
      
      // Set the results
      setResults(analysisResults);
      
      // Calculate summary stats
      const successful = analysisResults.filter(r => r.status === 'success').length;
      const failed = analysisResults.filter(r => r.status === 'error').length;
      
      setAnalysisStats({
        total: total,
        successful: successful,
        failed: failed,
        successRate: (successful / total) * 100
      });
      
      if (successful > 0) {
        setCurrentStep(4); // Move to results step
        setMessage({
          type: 'success',
          text: `✨ Analysis complete! Successfully processed ${successful}/${total} resumes.`
        });
      } else {
        setMessage({
          type: 'error',
          text: `Analysis failed for all ${total} files. Please check the files and try again.`
        });
      }

    } catch (error) {
      console.error('Analysis error:', error);
      setMessage({
        type: 'error',
        text: `Analysis failed: ${error.message}`
      });
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const canProceedToStep3 = (selectedJobRole || jobDescription.trim().length > 100);
  const canAnalyze = files.length > 0 && canProceedToStep3;

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center space-x-4 mb-12">
      {[1, 2, 3, 4].map((step) => (
        <div key={step} className="flex items-center">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg transition-all duration-300 ${
            step <= currentStep 
              ? 'bg-gradient-to-r from-cyan-500 to-purple-600 text-white'
              : 'bg-white/10 text-gray-400'
          }`}>
            {step}
          </div>
          {step < 4 && (
            <div className={`w-16 h-1 mx-2 transition-all duration-300 ${
              step < currentStep 
                ? 'bg-gradient-to-r from-cyan-500 to-purple-600'
                : 'bg-white/20'
            }`}></div>
          )}
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-blue-400/8 to-purple-600/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-br from-pink-400/8 to-red-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-green-400/8 to-cyan-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            🎯 ATS Resume Analyzer
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
            Intelligent resume analysis with job matching and hiring recommendations
          </p>
        </div>

        {/* Step Indicator */}
        {renderStepIndicator()}

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

        {/* Step Content */}
        <div className="max-w-4xl mx-auto">
          {/* Step 1: Upload Resumes */}
          {currentStep === 1 && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <FileUpload files={files} onFileChange={handleFileChange} />
              
              {files.length > 0 && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105"
                  >
                    Next: Job Description →
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Job Description */}
          {currentStep === 2 && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <JobRoleSelector 
                onJobRoleSelect={handleJobRoleSelect}
                onJobDescriptionChange={handleJobDescriptionChange}
              />
              
              <div className="flex justify-between mt-6">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300"
                >
                  ← Back
                </button>
                
                {canProceedToStep3 && (
                  <button
                    onClick={() => setCurrentStep(3)}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105"
                  >
                    Next: Review & Analyze →
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Review & Analyze */}
          {currentStep === 3 && (
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <div className="text-center">
                <div className="text-4xl mb-4">🚀</div>
                <h3 className="text-2xl font-bold text-white mb-6">Ready to Analyze</h3>
                
                {/* Review Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-semibold text-cyan-400 mb-3">📄 Resumes</h4>
                    <p className="text-2xl font-bold text-white">{files.length}</p>
                    <p className="text-gray-400 text-sm">Files selected for analysis</p>
                  </div>
                  
                  <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
                    <h4 className="text-lg font-semibold text-purple-400 mb-3">🎯 Job Description</h4>
                    {selectedJobRole ? (
                      <div>
                        <p className="text-lg font-bold text-white">{selectedJobRole.title}</p>
                        <p className="text-gray-400 text-sm">{selectedJobRole.company}</p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-lg font-bold text-white">Custom Description</p>
                        <p className="text-gray-400 text-sm">{jobDescription.length} characters</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentStep(2)}
                    className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-all duration-300"
                  >
                    ← Back
                  </button>
                  
                  <button
                    onClick={handleAnalyze}
                    disabled={!canAnalyze || isAnalyzing}
                    className={`px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 ${
                      !canAnalyze || isAnalyzing
                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                        : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white hover:scale-105 shadow-lg hover:shadow-xl'
                    }`}
                  >
                    {isAnalyzing ? (
                      <div className="flex items-center space-x-2">
                        <div className="animate-spin text-2xl">🤖</div>
                        <span>Analyzing...</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span>🎯</span>
                        <span>Start AI Analysis</span>
                      </div>
                    )}
                  </button>
                </div>

                {isAnalyzing && (
                  <div className="mt-6">
                    <div className="bg-white/10 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-cyan-400 to-purple-500 h-3 rounded-full transition-all duration-500"
                        style={{width: `${progress}%`}}
                      ></div>
                    </div>
                    <p className="text-sm text-gray-400 mt-3">Processing {files.length} resumes with AI... {progress}%</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Step 4: Analysis Results */}
        {currentStep === 4 && results.length > 0 && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 animate-fade-in">
            <AIAnalysis results={results} />
            
            <div className="mt-6 text-center">
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setFiles([]);
                  setResults([]);
                  setSelectedJobRole(null);
                  setJobDescription('');
                  setMessage(null);
                }}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-purple-600 hover:from-cyan-600 hover:to-purple-700 text-white rounded-xl font-medium transition-all duration-300 hover:scale-105"
              >
                🔄 Analyze More Resumes
              </button>
            </div>
          </div>
        )}

        {/* Feature Highlights - Show when not in results step */}
        {currentStep < 4 && (
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-8 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="text-5xl mb-4">🤖</div>
              <h3 className="text-xl font-bold text-white mb-3">AI-Powered Analysis</h3>
              <p className="text-gray-400 text-sm">Advanced algorithms analyze resume content and match skills instantly</p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
              <p className="text-gray-400 text-sm">Get instant results as soon as you upload your files</p>
            </div>

            <div className="text-center p-8 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm rounded-2xl border border-white/10">
              <div className="text-5xl mb-4">📊</div>
              <h3 className="text-xl font-bold text-white mb-3">Detailed Insights</h3>
              <p className="text-gray-400 text-sm">Comprehensive match scores and skill analysis reports</p>
            </div>
          </div>
        )}
      </div>

      <Footer />

      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 0.5s ease-in-out;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
