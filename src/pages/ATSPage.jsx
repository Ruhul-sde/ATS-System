
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import JobDescription from '../components/JobDescription';
import FileUpload from '../components/FileUpload';
import ProcessButton from '../components/ProcessButton';
import Message from '../components/Message';
import InfoSection from '../components/InfoSection';

export default function ATSPage() {
  const [files, setFiles] = useState([]);
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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

  const updateJobDescription = async () => {
    try {
      const response = await fetch('/api/job-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ description: jobDescription }),
      });
      
      const data = await response.json();
      if (data.success) {
        setMessage('Job description updated successfully!');
      }
    } catch (error) {
      setMessage('Error updating job description');
      console.error('Error:', error);
    }
  };

  const processResumes = async () => {
    if (files.length === 0) {
      setMessage('Please select at least one resume file');
      return;
    }

    if (!jobDescription.trim()) {
      setMessage('Please enter a job description');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('resumes', file);
      });

      const response = await fetch('/api/process-resumes', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resume-analysis.xlsx';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        setMessage(`Successfully processed ${files.length} resume(s). Excel file downloaded!`);
        setFiles([]);
        document.getElementById('file-input').value = '';
      } else {
        const errorData = await response.json();
        setMessage(`Error: ${errorData.error}`);
      }
    } catch (error) {
      setMessage('Error processing resumes');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 via-purple-600 to-purple-700">
      <div className="max-w-4xl mx-auto px-5 py-5 min-h-screen">
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
        
        <ProcessButton 
          loading={loading}
          filesCount={files.length}
          onProcess={processResumes}
        />
        
        <Message message={message} />
        
        <InfoSection />
      </div>
    </div>
  );
}
