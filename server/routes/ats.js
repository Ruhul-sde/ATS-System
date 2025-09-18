import express from 'express';
import rateLimit from 'express-rate-limit';
import multer from 'multer';
import mongoose from 'mongoose';
import { ResumeParser } from '../services/resumeParser.js';
import { JobDescriptionBuilder } from '../services/jobDescriptionBuilder.js';
import { AtsAnalyzer } from '../services/atsAnalyzer.js';
import { authenticateToken } from '../middleware/auth.js';
import JobRole from '../models/JobRole.js';
import JobApplication from '../models/JobApplication.js';
import User from '../models/User.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx', '.txt'];
    const ext = file.originalname?.split('.').pop()?.toLowerCase();
    if (allowedTypes.includes(`.${ext}`)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed.'));
    }
  }
});

// Rate limiting for ATS endpoints
const atsRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Limit each IP to 10 ATS analyses per windowMs
  message: {
    success: false,
    error: 'Too many ATS analysis requests. Please try again in 15 minutes.',
    retryAfter: 15 * 60
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting to all ATS routes
router.use(atsRateLimit);

/**
 * POST /api/ats/analyze
 * Analyze resume against job description (stateless)
 */
router.post('/analyze', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    const { jobRoleId, jobDescription, resumeText } = req.body;
    const file = req.file;

    // Validate input - need either jobRoleId or jobDescription
    if (!jobRoleId && !jobDescription) {
      return res.status(400).json({
        success: false,
        error: 'Either jobRoleId or jobDescription is required'
      });
    }

    // Validate resume input - need either resumeText or file
    if (!resumeText && !file) {
      return res.status(400).json({
        success: false,
        error: 'Either resumeText or resume file is required'
      });
    }

    let finalJobDescription = '';
    let finalResumeText = '';
    let jobRoleData = null;

    // Get job description
    if (jobRoleId) {
      // Check if database is connected
      if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({
          success: false,
          error: 'Database not available. Please provide jobDescription instead of jobRoleId for stateless analysis.'
        });
      }

      // Fetch job role from database
      jobRoleData = await JobRole.findById(jobRoleId);
      if (!jobRoleData) {
        return res.status(404).json({
          success: false,
          error: 'Job role not found'
        });
      }

      finalJobDescription = JobDescriptionBuilder.fromRole(jobRoleData);
    } else {
      finalJobDescription = jobDescription;
    }

    // Get resume text
    if (file) {
      // Validate file
      ResumeParser.validateResumeFile(file);
      
      // Extract text from file
      finalResumeText = await ResumeParser.extractText(
        file.buffer, 
        file.mimetype, 
        file.originalname
      );
      
      // Clean the extracted text
      finalResumeText = ResumeParser.cleanText(finalResumeText);
    } else {
      finalResumeText = ResumeParser.cleanText(resumeText);
    }

    // Validate extracted content
    if (!finalResumeText || finalResumeText.length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Resume content is too short or could not be extracted properly'
      });
    }

    if (!finalJobDescription || finalJobDescription.length < 50) {
      return res.status(400).json({
        success: false,
        error: 'Job description is too short'
      });
    }

    // Run ATS analysis
    console.log('Starting ATS analysis...');
    const analysis = await AtsAnalyzer.run(finalResumeText, finalJobDescription);

    // Add additional metadata
    const result = {
      success: true,
      data: {
        ...analysis,
        jobRole: jobRoleData ? {
          id: jobRoleData._id,
          title: jobRoleData.title,
          company: jobRoleData.company,
          department: jobRoleData.department
        } : null,
        resumeInfo: ResumeParser.extractKeyInfo(finalResumeText),
        analysisTimestamp: new Date().toISOString()
      }
    };

    res.json(result);
  } catch (error) {
    console.error('ATS Analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'ATS analysis failed',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * POST /api/ats/apply-and-analyze
 * Apply for job and run ATS analysis (requires database)
 */
router.post('/apply-and-analyze', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    const { jobRoleId, resumeText, coverLetter } = req.body;
    const file = req.file;
    const userId = req.user.userId;

    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not available. Cannot create job application.'
      });
    }

    // Validate required fields
    if (!jobRoleId) {
      return res.status(400).json({
        success: false,
        error: 'jobRoleId is required'
      });
    }

    if (!resumeText && !file) {
      return res.status(400).json({
        success: false,
        error: 'Either resumeText or resume file is required'
      });
    }

    // Check if user and job role exist
    const [user, jobRole] = await Promise.all([
      User.findById(userId),
      JobRole.findById(jobRoleId)
    ]);

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    if (!jobRole) {
      return res.status(404).json({
        success: false,
        error: 'Job role not found'
      });
    }

    // Check if user already applied for this job
    const existingApplication = await JobApplication.findOne({
      applicant: userId,
      job: jobRoleId
    });

    if (existingApplication) {
      return res.status(409).json({
        success: false,
        error: 'You have already applied for this position',
        applicationId: existingApplication._id
      });
    }

    // Process resume
    let finalResumeText = '';
    let resumeFileData = {};

    if (file) {
      ResumeParser.validateResumeFile(file);
      finalResumeText = await ResumeParser.extractText(
        file.buffer,
        file.mimetype,
        file.originalname
      );
      finalResumeText = ResumeParser.cleanText(finalResumeText);

      resumeFileData = {
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileContent: finalResumeText
      };
    } else {
      finalResumeText = ResumeParser.cleanText(resumeText);
    }

    // Build job description
    const jobDescriptionText = JobDescriptionBuilder.fromRole(jobRole);

    // Run ATS analysis
    console.log(`Running ATS analysis for application: ${user.email} -> ${jobRole.title}`);
    const analysis = await AtsAnalyzer.run(finalResumeText, jobDescriptionText);

    // Create job application with analysis
    const jobApplication = new JobApplication({
      applicant: userId,
      job: jobRoleId,
      status: 'pending',
      coverLetter: coverLetter || '',
      resumeFile: resumeFileData,
      aiAnalysis: analysis,
      appliedAt: new Date()
    });

    await jobApplication.save();

    // Update user's applications array
    if (!user.applications.some(app => app.jobId.toString() === jobRoleId)) {
      user.applications.push({
        jobId: jobRoleId,
        appliedAt: new Date(),
        status: 'pending',
        coverLetter: coverLetter || '',
        resumeSnapshot: finalResumeText
      });
      await user.save();
    }

    // Return successful response
    const result = {
      success: true,
      message: 'Application submitted successfully',
      data: {
        applicationId: jobApplication._id,
        analysis: analysis,
        application: {
          id: jobApplication._id,
          status: jobApplication.status,
          appliedAt: jobApplication.appliedAt,
          jobRole: {
            id: jobRole._id,
            title: jobRole.title,
            company: jobRole.company,
            department: jobRole.department
          }
        }
      }
    };

    res.status(201).json(result);
  } catch (error) {
    console.error('Apply and Analyze error:', error);
    
    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        error: 'You have already applied for this position'
      });
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to submit application',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/ats/job-roles
 * Get available job roles for ATS analysis
 */
router.get('/job-roles', authenticateToken, async (req, res) => {
  try {
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({
        success: false,
        error: 'Database not available',
        data: []
      });
    }

    const { search, department, status = 'active' } = req.query;
    
    // Build filter query
    const filter = { isActive: true };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    if (department && department !== 'all') {
      filter.department = department;
    }

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const jobRoles = await JobRole.find(filter)
      .select('title company department location employmentType salaryRange createdAt')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      data: jobRoles,
      total: jobRoles.length
    });
  } catch (error) {
    console.error('Get job roles error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch job roles',
      data: []
    });
  }
});

/**
 * GET /api/ats/analysis-history
 * Get user's ATS analysis history
 */
router.get('/analysis-history', authenticateToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    
    // Check if database is connected
    if (mongoose.connection.readyState !== 1) {
      return res.json({
        success: true,
        message: 'Database not available - no analysis history',
        data: []
      });
    }

    const applications = await JobApplication.find({ applicant: userId })
      .populate('job', 'title company department')
      .select('job status aiAnalysis appliedAt')
      .sort({ appliedAt: -1 })
      .limit(20);

    const history = applications.map(app => ({
      id: app._id,
      jobTitle: app.job?.title || 'Unknown Position',
      company: app.job?.company || 'Unknown Company',
      department: app.job?.department || 'Unknown Department',
      status: app.status,
      matchPercentage: app.aiAnalysis?.matchPercentage || 0,
      appliedAt: app.appliedAt,
      hasAnalysis: !!app.aiAnalysis
    }));

    res.json({
      success: true,
      data: history,
      total: history.length
    });
  } catch (error) {
    console.error('Get analysis history error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to fetch analysis history',
      data: []
    });
  }
});

/**
 * GET /api/ats/cache-stats
 * Get ATS analyzer cache statistics (for debugging)
 */
router.get('/cache-stats', authenticateToken, async (req, res) => {
  try {
    const stats = AtsAnalyzer.getCacheStats();
    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;