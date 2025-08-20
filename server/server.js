import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
import pdf from 'pdf-parse';
import { GeminiService } from './services/geminiService.js';
import { config } from './config/environment.js';
import connectDB from './config/database.js';
import JobRole from './models/JobRole.js';


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://0.0.0.0:5173', 'https://*.replit.dev', 'https://*.replit.co'],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

// Routes

// Health check endpoint
app.get('/api/health', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.app.environment,
    database: dbStatus
  });
});

// System status endpoint
app.get('/api/system/status', (req, res) => {
  try {
    const apiKeyStatus = GeminiService.getApiKeyStatus();
    const envStatus = GeminiService.validateEnvironment();

    res.json({
      success: true,
      data: {
        apiKey: apiKeyStatus,
        environment: envStatus,
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: config.app.version
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Job Roles endpoints
app.get('/api/job-roles', async (req, res) => {
  try {
    const jobRoles = await JobRole.find({ isActive: true }).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: jobRoles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Job postings endpoints
app.get('/api/jobs', async (req, res) => {
  try {
    const { status } = req.query;
    const filter = { isActive: true };
    if (status) {
      filter.status = status;
    }
    
    const jobs = await JobRole.find(filter).sort({ createdAt: -1 });
    res.json({
      success: true,
      data: jobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/jobs', async (req, res) => {
  try {
    const { 
      title, 
      description, 
      department, 
      experienceLevel, 
      skills, 
      location, 
      salaryRange, 
      type, 
      urgency 
    } = req.body;

    console.log('Creating job with data:', { title, department, experienceLevel });

    if (!title || !description || !department || !experienceLevel) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, department, and experience level are required'
      });
    }

    // Check if mongoose is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database connection not available'
      });
    }

    const job = new JobRole({
      title,
      description,
      department,
      experienceLevel,
      skills: skills || [],
      location,
      salaryRange,
      type: type || 'Full-time',
      urgency: urgency || 'medium',
      status: 'active'
    });

    const savedJob = await job.save();
    console.log('Job created successfully:', savedJob._id);

    res.status(201).json({
      success: true,
      data: savedJob
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/jobs/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    
    if (!['active', 'paused', 'closed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be active, paused, or closed'
      });
    }

    const job = await JobRole.findByIdAndUpdate(
      req.params.id,
      { status, updatedAt: Date.now() },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/jobs/:id/views', async (req, res) => {
  try {
    const job = await JobRole.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    res.json({
      success: true,
      data: job
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/job-roles', async (req, res) => {
  try {
    const { title, description, department, experienceLevel, skills, location, salaryRange } = req.body;

    if (!title || !description || !department || !experienceLevel) {
      return res.status(400).json({
        success: false,
        error: 'Title, description, department, and experience level are required'
      });
    }

    const jobRole = new JobRole({
      title,
      description,
      department,
      experienceLevel,
      skills: skills || [],
      location,
      salaryRange
    });

    await jobRole.save();

    res.status(201).json({
      success: true,
      data: jobRole
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.get('/api/job-roles/:id', async (req, res) => {
  try {
    const jobRole = await JobRole.findById(req.params.id);
    if (!jobRole) {
      return res.status(404).json({
        success: false,
        error: 'Job role not found'
      });
    }

    res.json({
      success: true,
      data: jobRole
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.put('/api/job-roles/:id', async (req, res) => {
  try {
    const { title, description, department, experienceLevel, skills, location, salaryRange, isActive } = req.body;

    const jobRole = await JobRole.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        department,
        experienceLevel,
        skills,
        location,
        salaryRange,
        isActive,
        updatedAt: Date.now()
      },
      { new: true, runValidators: true }
    );

    if (!jobRole) {
      return res.status(404).json({
        success: false,
        error: 'Job role not found'
      });
    }

    res.json({
      success: true,
      data: jobRole
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.delete('/api/job-roles/:id', async (req, res) => {
  try {
    const jobRole = await JobRole.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );

    if (!jobRole) {
      return res.status(404).json({
        success: false,
        error: 'Job role not found'
      });
    }

    res.json({
      success: true,
      data: { message: 'Job role deactivated successfully' }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Legacy job description endpoints (for backward compatibility)
let currentJobDescription = '';

app.get('/api/job-description', (req, res) => {
  res.json({
    success: true,
    data: { description: currentJobDescription }
  });
});

app.post('/api/job-description', (req, res) => {
  try {
    const { description } = req.body;

    if (!description || description.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Job description is required'
      });
    }

    currentJobDescription = description;

    res.json({
      success: true,
      data: { description: currentJobDescription }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Resume analysis endpoint
app.post('/api/analyze/single', async (req, res) => {
  try {
    const { resumeText, jobDescription } = req.body;

    if (!resumeText || !jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Both resume text and job description are required'
      });
    }

    const analysis = await GeminiService.analyzeResume(resumeText, jobDescription);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error) {
    console.error('Single analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Batch resume analysis endpoint
app.post('/api/analyze/batch', async (req, res) => {
  try {
    const { resumes, jobDescription } = req.body;

    if (!Array.isArray(resumes) || resumes.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Resumes array is required and cannot be empty'
      });
    }

    if (!jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Job description is required'
      });
    }

    // Set up Server-Sent Events for progress updates
    res.writeHead(200, {
      'Content-Type': 'text/plain',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive'
    });

    const results = await GeminiService.batchAnalyzeResumes(
      resumes, 
      jobDescription,
      (current, total) => {
        res.write(`data: ${JSON.stringify({ type: 'progress', current, total })}\n\n`);
      }
    );

    res.write(`data: ${JSON.stringify({ type: 'complete', results })}\n\n`);
    res.end();

  } catch (error) {
    console.error('Batch analysis error:', error);
    res.write(`data: ${JSON.stringify({ type: 'error', error: error.message })}\n\n`);
    res.end();
  }
});

// Resume analysis endpoint (compatible with FormData)
app.post('/api/analyze', upload.array('resumes'), async (req, res) => {
  console.log('Resume analysis request received');
  console.log('Files:', req.files?.length || 0);
  console.log('Job description length:', req.body.jobDescription?.length || 0);
  
  try {
    const { jobDescription } = req.body;
    
    if (!req.files || req.files.length === 0) {
      console.log('Error: No files uploaded');
      return res.status(400).json({
        success: false,
        message: 'No resume files uploaded'
      });
    }

    if (!jobDescription || jobDescription.trim() === '') {
      console.log('Error: No job description provided');
      return res.status(400).json({
        success: false,
        message: 'Job description is required'
      });
    }

    console.log(`Processing ${req.files.length} resumes...`);
    
    // Validate Gemini service
    const serviceHealth = GeminiService.getServiceHealth();
    if (serviceHealth.status !== 'healthy') {
      console.log('Error: Gemini service not healthy', serviceHealth);
      return res.status(503).json({
        success: false,
        message: 'AI service is not available. Please check your configuration.'
      });
    }

    // Process uploaded files with proper PDF parsing
    const resumes = await Promise.all(req.files.map(async file => {
      let text = '';
      
      try {
        if (file.mimetype === 'application/pdf') {
          // Parse PDF content
          const pdfData = await pdf(file.buffer);
          text = pdfData.text;
        } else {
          // For other file types, use simple text extraction
          text = file.buffer.toString('utf-8');
        }
        
        if (!text || text.trim() === '') {
          text = `Unable to extract text from ${file.originalname}. Please ensure the file contains readable text.`;
        }
      } catch (parseError) {
        console.error(`Error parsing ${file.originalname}:`, parseError);
        text = `Error extracting text from ${file.originalname}: ${parseError.message}`;
      }
      
      return {
        fileName: file.originalname,
        text: text,
        size: file.size
      };
    }));

    // Use the batch analysis service
    const results = await GeminiService.batchAnalyzeResumes(resumes, jobDescription);

    res.json({
      success: true,
      results: results.results,
      summary: results.summary
    });

  } catch (error) {
    console.error('Resume analysis error:', error);
    
    // Log stack trace for debugging
    if (error.stack) {
      console.error('Stack trace:', error.stack);
    }
    
    res.status(500).json({
      success: false,
      message: error.message || 'Analysis failed',
      error: error.message
    });
  }
});

// File upload endpoint
app.post('/api/upload', upload.array('files'), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files uploaded'
      });
    }

    const processedFiles = req.files.map(file => ({
      fileName: file.originalname,
      size: file.size,
      type: file.mimetype,
      buffer: file.buffer,
      text: file.buffer.toString('utf-8') // Simple text extraction
    }));

    res.json({
      success: true,
      data: {
        files: processedFiles,
        count: processedFiles.length
      }
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);

  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        error: 'File too large. Maximum size is 10MB.'
      });
    }
  }

  res.status(500).json({
    success: false,
    error: error.message || 'Internal server error'
  });
});

// 404 handler - FIXED: Use proper middleware format
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Environment: ${config.app.environment}`);
  console.log(`🤖 Gemini API: ${GeminiService.getApiKeyStatus().configured ? '✅ Configured' : '❌ Not configured'}`);
});

export default app;