import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { GeminiService } from './services/geminiService.js';
import { config } from './config/environment.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
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
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    environment: config.app.environment
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

// Job description endpoints
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

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint not found'
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
  console.log(`📊 Environment: ${config.app.environment}`);
  console.log(`🤖 Gemini API: ${GeminiService.getApiKeyStatus().configured ? '✅ Configured' : '❌ Not configured'}`);
});

export default app;