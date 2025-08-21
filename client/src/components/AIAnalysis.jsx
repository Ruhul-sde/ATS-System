import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import JobDescription from '../components/JobDescription';
import ProcessButton from '../components/ProcessButton';
import AIAnalysis from '../components/AIAnalysis';
import InfoSection from '../components/InfoSection';
import Message from '../components/Message';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// Mock data for demonstration
const mockAnalysisResults = [
  {
    fileName: "Sarah_Chen_Resume.pdf",
    matchPercentage: 92,
    matchingSkills: ["React", "TypeScript", "Node.js", "AWS", "GraphQL", "Docker"],
    missingSkills: ["Kubernetes", "Jenkins", "Terraform"],
    experienceMatch: "senior",
    educationRelevance: "high",
    strengths: ["Strong technical leadership", "Full-stack expertise", "Cloud architecture experience"],
    weaknesses: ["Limited DevOps experience", "No mention of testing frameworks"],
    recommendations: ["Consider DevOps training", "Highlight any testing experience", "Emphasize leadership projects"],
    keywordMatches: 15,
    overallAssessment: "Excellent candidate with strong technical skills and leadership experience. Perfect fit for senior developer role.",
    interviewReadiness: "ready",
    status: "success"
  },
  {
    fileName: "Michael_Rodriguez_Resume.pdf",
    matchPercentage: 78,
    matchingSkills: ["JavaScript", "React", "Node.js", "MongoDB"],
    missingSkills: ["TypeScript", "AWS", "GraphQL", "Docker", "Testing"],
    experienceMatch: "mid",
    educationRelevance: "medium",
    strengths: ["Good JavaScript fundamentals", "MERN stack experience", "Quick learner"],
    weaknesses: ["Limited cloud experience", "No TypeScript background", "Minimal testing knowledge"],
    recommendations: ["Learn TypeScript", "Gain cloud platform experience", "Practice testing frameworks"],
    keywordMatches: 8,
    overallAssessment: "Solid mid-level candidate with room for growth. Good cultural fit with some skill gaps.",
    interviewReadiness: "needs-preparation",
    status: "success"
  },
  {
    fileName: "Alice_Johnson_Resume.pdf",
    matchPercentage: 85,
    matchingSkills: ["React", "TypeScript", "Python", "AWS", "Docker", "Jest"],
    missingSkills: ["GraphQL", "Microservices", "Kubernetes"],
    experienceMatch: "senior",
    educationRelevance: "high",
    strengths: ["Excellent full-stack skills", "Strong testing background", "Cloud-native development"],
    weaknesses: ["Limited microservices experience", "No GraphQL exposure"],
    recommendations: ["Explore GraphQL implementation", "Study microservices architecture", "Highlight system design experience"],
    keywordMatches: 12,
    overallAssessment: "Strong candidate with excellent technical foundation. Would excel in the role with minimal onboarding.",
    interviewReadiness: "ready",
    status: "success"
  }
];

export default function ATSPage() {
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [message, setMessage] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    setMessage({ type: 'success', text: `${selectedFiles.length} file(s) selected successfully!` });
  };

  const handleJobDescriptionChange = (value) => {
    setJobDescription(value);
  };

  const handleProcess = async () => {
    if (files.length === 0) {
      setMessage({ type: 'error', text: 'Please select at least one resume file.' });
      return;
    }

    if (!jobDescription.trim()) {
      setMessage({ type: 'error', text: 'Please enter a job description.' });
      return;
    }

    setIsAnalyzing(true);
    setResults([]);
    setProgress(0);
    setMessage({ type: 'info', text: 'Starting analysis... This may take a few minutes.' });

    try {
      // Create FormData for file upload
      const formData = new FormData();
      
      // Add all files to FormData
      files.forEach((file) => {
        formData.append('resumes', file);
      });
      
      // Add job description
      formData.append('jobDescription', jobDescription);

      console.log(`Uploading ${files.length} files for analysis...`);

      // Call the real backend API
      const response = await fetch('http://0.0.0.0:4000/api/analyze', {
        method: 'POST',
        body: formData,
        // Don't set Content-Type header - let browser set it with boundary for multipart/form-data
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || errorData.error || `Server error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.message || data.error || 'Analysis failed');
      }

      // Set the real results from API
      setResults(data.results || []);
      setMessage({
        type: 'success',
        text: `Analysis complete! Processed ${data.results?.length || 0} resumes successfully.`
      });

    } catch (error) {
      console.error('Analysis error:', error);
      
      // Handle network errors specifically
      if (error.message.includes('fetch')) {
        setMessage({
          type: 'error',
          text: 'Cannot connect to server. Please make sure the server is running on port 4000.'
        });
      } else {
        setMessage({
          type: 'error',
          text: `Analysis failed: ${error.message}`
        });
      }
    } finally {
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-96 h-96 bg-gradient-to-br from-blue-400/8 to-purple-600/8 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 right-10 w-80 h-80 bg-gradient-to-br from-pink-400/8 to-red-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }}></div>
        <div className="absolute bottom-20 left-1/4 w-72 h-72 bg-gradient-to-br from-green-400/8 to-cyan-600/8 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }}></div>
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      </div>

      <Navbar />

      <div className="relative z-10 max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 pt-2 pb-6">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
              🎯 Resume Analyzer
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
              Upload resumes and analyze them against job descriptions with AI-powered matching
            </p>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className="mb-8">
            <Message message={message} onClose={() => setMessage(null)} />
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Left Column - Upload & Job Description */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <FileUpload files={files} onFileChange={handleFileChange} />
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <JobDescription value={jobDescription} onChange={handleJobDescriptionChange} />
            </div>
          </div>

          {/* Right Column - Process & Info */}
          <div className="space-y-8">
            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <ProcessButton 
                onProcess={handleProcess} 
                isAnalyzing={isAnalyzing}
                disabled={files.length === 0 || !jobDescription.trim()}
                filesCount={files.length}
                progress={progress}
              />
            </div>

            <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
              <InfoSection />
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {(results.length > 0 || isAnalyzing) && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 animate-fade-in-up">
            <AIAnalysis results={results} isAnalyzing={isAnalyzing} />
          </div>
        )}

        {/* Feature Highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center p-8 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-5xl mb-4">🤖</div>
            <h3 className="text-xl font-bold text-white mb-3">AI-Powered Analysis</h3>
            <p className="text-gray-400 text-sm">Advanced machine learning algorithms analyze resume content and match skills</p>
          </div>

          <div className="text-center p-8 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-5xl mb-4">⚡</div>
            <h3 className="text-xl font-bold text-white mb-3">Lightning Fast</h3>
            <p className="text-gray-400 text-sm">Process multiple resumes in seconds with optimized batch processing</p>
          </div>

          <div className="text-center p-8 bg-gradient-to-br from-white/5 to-white/2 backdrop-blur-sm rounded-2xl border border-white/10">
            <div className="text-5xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-white mb-3">Detailed Insights</h3>
            <p className="text-gray-400 text-sm">Get comprehensive match scores and detailed skill analysis reports</p>
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

        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
}