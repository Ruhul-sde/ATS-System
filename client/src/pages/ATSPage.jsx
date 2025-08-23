
import { useState } from 'react';
import FileUpload from '../components/FileUpload';
import JobDescription from '../components/JobDescription';
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
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [results, setResults] = useState([]);
  const [message, setMessage] = useState(null);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setFiles(selectedFiles);
    
    // Show dummy results immediately when files are uploaded
    if (selectedFiles.length > 0) {
      const dummyResults = selectedFiles.map((file, index) => {
        const mockData = mockAnalysisResults[index % mockAnalysisResults.length];
        return {
          ...mockData,
          fileName: file.name,
          fileSize: file.size
        };
      });
      
      setResults(dummyResults);
      setMessage({
        type: 'success',
        text: `✨ AI Analysis Complete! Processed ${dummyResults.length} resumes instantly (Demo Mode)`
      });
    }
  };

  const handleJobDescriptionChange = (value) => {
    setJobDescription(value);
  };

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
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-black mb-4 bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
            🎯 Resume Analyzer
          </h1>
          <p className="text-lg md:text-xl text-gray-300 max-w-4xl mx-auto font-light leading-relaxed">
            Upload resumes and get instant AI-powered analysis with match scores and recommendations
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

        {/* Main Content */}
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

          {/* Right Column - Info */}
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="text-3xl">ℹ️</div>
                <div>
                  <h2 className="text-2xl font-bold text-white">How It Works</h2>
                  <p className="text-gray-400">Simple 3-step process</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl">1️⃣</div>
                  <div>
                    <h3 className="text-white font-semibold">Upload Resumes</h3>
                    <p className="text-gray-400 text-sm">Upload PDF or Word documents</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl">2️⃣</div>
                  <div>
                    <h3 className="text-white font-semibold">Add Job Description</h3>
                    <p className="text-gray-400 text-sm">Paste or type the job requirements</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4 p-4 bg-white/5 rounded-xl">
                  <div className="text-2xl">3️⃣</div>
                  <div>
                    <h3 className="text-white font-semibold">Get Instant Results</h3>
                    <p className="text-gray-400 text-sm">View detailed AI analysis immediately</p>
                  </div>
                </div>
              </div>

              {files.length > 0 && (
                <div className="mt-6 p-4 bg-green-500/20 border border-green-500/30 rounded-xl">
                  <div className="flex items-center space-x-2">
                    <span className="text-green-400 text-xl">✨</span>
                    <span className="text-green-300 font-medium">
                      {files.length} files ready for analysis!
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analysis Results */}
        {results.length > 0 && (
          <div className="bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-md rounded-3xl p-8 border border-white/20 animate-fade-in">
            <AIAnalysis results={results} />
          </div>
        )}

        {/* Feature Highlights */}
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
