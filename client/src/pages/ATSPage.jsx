import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import Dashboard from '../components/Dashboard';
import Header from '../components/Header';
import JobDescription from '../components/JobDescription';
import FileUpload from '../components/FileUpload';
import ProcessButton from '../components/ProcessButton';
import Message from '../components/Message';
import InfoSection from '../components/InfoSection';
import Footer from '../components/Footer';
import AIAnalysis from '../components/AIAnalysis';

export default function ATSPage() {
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [aiResults, setAiResults] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState({ current: 0, total: 0 });

  // Load current job description on component mount
  useEffect(() => {
    fetchJobDescription();
  }, []);

  const fetchJobDescription = async () => {
    try {
      const response = await fetch('/api/job-description');
      const data = await response.json();
      setJobDescription(data.description);
    } catch (error) {
      console.error('Error fetching job description:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const validFiles = selectedFiles.filter(file => 
      file.type === 'application/pdf' || 
      file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    );

    if (validFiles.length !== selectedFiles.length) {
      setMessage('Some files were filtered out. Only PDF and DOCX files are allowed.');
    }

    setFiles(validFiles);
  };

  const updateJobDescription = async (newDescription) => {
    try {
      const response = await fetch('/api/job-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: newDescription }),
      });

      if (response.ok) {
        setMessage('Job description updated successfully!');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating job description:', error);
      setMessage('Error updating job description.');
    }
  };

  const extractTextFromFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        // For PDFs and DOCX, we'll use a simple text extraction
        // In a real app, you'd use libraries like pdf-parse or mammoth
        resolve(e.target.result);
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  };

  const analyzeWithAI = async () => {
    if (files.length === 0) {
      setMessage('Please select files to analyze.');
      return;
    }

    if (!jobDescription.trim()) {
      setMessage('Please enter a job description.');
      return;
    }

    setAiLoading(true);
    setMessage('');
    setAiResults([]);

    try {
      const resumes = [];

      // Convert files to text
      for (const file of files) {
        const fileText = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = (e) => resolve(e.target.result);
          reader.onerror = reject;
          reader.readAsText(file);
        });

        resumes.push({
          fileName: file.name,
          text: fileText
        });
      }

      // Use batch analysis with progress tracking
      const response = await fetch('/api/analyze/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ resumes, jobDescription }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let results = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

        for (const line of lines) {
          try {
            const data = JSON.parse(line.replace('data: ', ''));

            if (data.type === 'progress') {
              setMessage(`Analyzing resume ${data.current} of ${data.total}...`);
            } else if (data.type === 'complete') {
              results = data.results;
            } else if (data.type === 'error') {
              throw new Error(data.error);
            }
          } catch (parseError) {
            console.warn('Failed to parse SSE data:', parseError);
          }
        }
      }

      setAiResults(results);
      setMessage(`AI Analysis complete! Processed ${results.length} resumes.`);
    } catch (error) {
      console.error('AI Analysis error:', error);
      setMessage(`AI Analysis Error: ${error.message}`);
    } finally {
      setAiLoading(false);
    }
  };

  const processResumes = async () => {
    if (files.length === 0) {
      setMessage('Please select files to process.');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('resumes', file);
      });
      formData.append('jobDescription', jobDescription);

      const response = await fetch('/api/process-resumes', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'resume_analysis.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        setMessage('Analysis complete! Excel file downloaded.');
        setFiles([]);
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error || 'Failed to process resumes'}`);
      }
    } catch (error) {
      console.error('Error processing resumes:', error);
      setMessage('Error processing resumes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const exportAIResults = () => {
    if (aiResults.length === 0) return;

    const csvContent = [
      'File Name,Match %,Matching Skills,Missing Skills,Recommendation',
      ...aiResults.map(result => 
        `"${result.fileName}",${result.matchPercentage},"${result.matchingSkills?.join(', ') || ''}","${result.missingSkills?.join(', ') || ''}","${result.recommendation || ''}"`
      )
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ai_resume_analysis.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard />;
      case 'ats':
        return (
          <div className="space-y-6">
            <Header />
            <JobDescription 
              jobDescription={jobDescription}
              setJobDescription={setJobDescription}
              onUpdate={updateJobDescription}
            />
            <FileUpload 
              files={files}
              onFileChange={handleFileChange}
            />

            {/* Processing Buttons */}
            <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Processing Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <button
                  onClick={analyzeWithAI}
                  disabled={aiLoading || files.length === 0}
                  className="flex items-center justify-center px-6 py-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="mr-2">🤖</span>
                  {aiLoading ? `AI Processing... (${analysisProgress.current}/${analysisProgress.total})` : 'AI Analysis with Gemini'}
                </button>

                <ProcessButton 
                  loading={loading}
                  filesCount={files.length}
                  onProcess={processResumes}
                />
              </div>
            </div>

            <Message message={message} />

            <AIAnalysis 
              results={aiResults}
              loading={aiLoading}
              onExportResults={exportAIResults}
            />

            <InfoSection />
          </div>
        );
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700">
      <Navbar />

      {/* Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <div className="bg-white bg-opacity-95 rounded-xl p-2 mb-6 shadow-lg backdrop-blur-sm">
          <div className="flex space-x-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              📊 Dashboard
            </button>
            <button
              onClick={() => setActiveTab('ats')}
              className={`flex-1 px-6 py-3 text-sm font-medium rounded-lg transition-all duration-200 ${
                activeTab === 'ats' 
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              🎯 ATS Processing
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {renderContent()}
      </div>

      <Footer />
    </div>
  );
}