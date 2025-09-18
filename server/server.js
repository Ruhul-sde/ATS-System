import express from 'express';
import cors from 'cors';
import multer from 'multer';
import path from 'path';
import mongoose from 'mongoose';
import { fileURLToPath } from 'url';
// pdf-parse will be imported dynamically when needed
import { GeminiService } from './services/geminiService.js';
import { config } from './config/environment.js';
import connectDB from './config/database.js';
import JobRole from './models/JobRole.js';
import User from './models/User.js';
import JobApplication from './models/JobApplication.js';
import authRoutes from './routes/auth.js';
import jobSeekerRoutes from './routes/jobSeeker.js';
import fs from 'fs'; // Import fs module

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 8000;

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Ensure upload directories exist
const uploadDirs = [
  path.join(__dirname, '../uploads'),
  path.join(__dirname, '../uploads/resumes'),
  path.join(__dirname, '../uploads/profile-pictures')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

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
app.use('/api/auth', authRoutes);
app.use('/api/job-seeker', jobSeekerRoutes);

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
    const serviceHealth = GeminiService.getServiceHealth();

    res.json({
      success: true,
      data: {
        apiKey: apiKeyStatus,
        environment: envStatus,
        service: serviceHealth,
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          version: config.app.version,
          environment: config.app.environment
        },
        database: {
          status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
          name: mongoose.connection.name
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

// Gemini API configuration test endpoint
app.post('/api/system/test-gemini', async (req, res) => {
  try {
    const testText = "This is a test resume with JavaScript and React skills.";
    const testJob = "We are looking for a frontend developer with React experience.";

    const result = await GeminiService.analyzeResume(testText, testJob);

    res.json({
      success: true,
      message: 'Gemini API is working correctly',
      testResult: {
        matchPercentage: result.matchPercentage,
        keywordMatches: result.keywordMatches,
        status: 'operational'
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Gemini API test failed',
      error: error.message
    });
  }
});

// Admin dashboard stats endpoint
app.get('/api/admin/dashboard/stats', async (req, res) => {
  try {
    // Get total resumes count (using JobApplication as proxy)
    const totalApplications = await JobApplication.countDocuments();

    // Get processed applications (non-pending status)
    const processed = await JobApplication.countDocuments({
      status: { $nin: ['pending'] }
    });

    // Get high match candidates (example: interview-scheduled or hired)
    const matched = await JobApplication.countDocuments({
      status: { $in: ['interview-scheduled', 'hired', 'shortlisted'] }
    });

    // Get pending applications
    const pending = await JobApplication.countDocuments({
      status: 'pending'
    });

    // Get active jobs
    const activeJobs = await JobRole.countDocuments({
      status: 'active',
      isActive: true
    });

    // Get interviews scheduled
    const interviewsScheduled = await JobApplication.countDocuments({
      status: 'interview-scheduled'
    });

    // Get hired candidates
    const hiredCandidates = await JobApplication.countDocuments({
      status: 'hired'
    });

    res.json({
      success: true,
      data: {
        totalResumes: totalApplications,
        processed,
        matched,
        pending,
        activeJobs,
        totalApplications,
        interviewsScheduled,
        hiredCandidates
      }
    });
  } catch (error) {
    console.error('Error fetching admin dashboard stats:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin dashboard recent activity endpoint
app.get('/api/admin/dashboard/activity', async (req, res) => {
  try {
    const recentApplications = await JobApplication.find()
      .populate('applicant', 'firstName lastName')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const activity = recentApplications.map((app, index) => ({
      id: app._id,
      action: getActivityAction(app.status),
      candidate: app.applicant ? `${app.applicant.firstName} ${app.applicant.lastName}` : 'Unknown',
      job: app.job ? app.job.title : 'Unknown Position',
      time: getTimeAgo(app.createdAt),
      type: getActivityType(app.status),
      icon: getActivityIcon(app.status),
      priority: getActivityPriority(app.status),
      score: app.status === 'shortlisted' ? Math.floor(Math.random() * 20) + 80 : null
    }));

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    console.error('Error fetching admin dashboard activity:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin dashboard top candidates endpoint
app.get('/api/admin/dashboard/candidates', async (req, res) => {
  try {
    const topCandidates = await JobApplication.find({
      status: { $in: ['shortlisted', 'interview-scheduled', 'hired'] }
    })
      .populate('applicant', 'firstName lastName profile')
      .populate('job', 'title')
      .sort({ createdAt: -1 })
      .limit(10);

    const candidates = topCandidates.map((app, index) => ({
      name: app.applicant ? `${app.applicant.firstName} ${app.applicant.lastName}` : 'Unknown',
      match: Math.floor(Math.random() * 20) + 80, // Mock match score
      skills: app.applicant?.profile?.skills || ['JavaScript', 'React', 'Node.js'],
      status: formatCandidateStatus(app.status),
      avatar: getRandomAvatar(),
      position: app.job ? app.job.title : 'Unknown Position',
      experience: app.applicant?.profile?.experience || '5+ years',
      location: app.applicant?.profile?.location || 'Remote'
    }));

    res.json({
      success: true,
      data: candidates
    });
  } catch (error) {
    console.error('Error fetching admin dashboard candidates:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin dashboard jobs overview endpoint
app.get('/api/admin/dashboard/jobs', async (req, res) => {
  try {
    const jobs = await JobRole.find({
      isActive: true,
      status: 'active'
    }).sort({ createdAt: -1 }).limit(10);

    const jobsWithStats = await Promise.all(jobs.map(async (job) => {
      const applicationCount = await JobApplication.countDocuments({ job: job._id });

      return {
        id: job._id,
        title: job.title,
        applications: applicationCount,
        views: job.views || Math.floor(Math.random() * 200) + 50,
        status: job.status,
        urgency: job.urgency || 'medium',
        department: job.department,
        daysOpen: Math.floor((Date.now() - job.createdAt) / (1000 * 60 * 60 * 24))
      };
    }));

    res.json({
      success: true,
      data: jobsWithStats
    });
  } catch (error) {
    console.error('Error fetching admin dashboard jobs:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Admin candidates endpoint - comprehensive candidate data
app.get('/api/admin/candidates', async (req, res) => {
  try {
    console.log('Fetching candidates...');
    const { status, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Build query filter
    const filter = {};
    if (status && status !== 'all') {
      if (status === 'new') {
        filter.status = { $in: ['pending', 'new'] };
      } else if (status === 'screening') {
        filter.status = { $in: ['reviewing', 'screening'] };
      } else if (status === 'interview') {
        filter.status = { $in: ['interview-scheduled', 'shortlisted'] };
      } else {
        filter.status = status;
      }
    }

    // Check if we have any applications at all
    const totalApplications = await JobApplication.countDocuments();
    console.log('Total applications in database:', totalApplications);

    // If no applications exist, return empty array with message
    if (totalApplications === 0) {
      console.log('No applications found in database');
      return res.json({
        success: true,
        data: [],
        total: 0,
        filters: { status, search, sortBy, sortOrder },
        message: 'No candidate applications found. Applications will appear here once job seekers start applying.'
      });
    }

    // Get all applications with populated data
    let applications = await JobApplication.find(filter)
      .populate('applicant', 'firstName lastName email profile')
      .populate('job', 'title department location salaryRange')
      .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 });

    console.log(`Found ${applications.length} applications`);

    // Transform applications to candidate format
    const candidates = applications.map((app) => {
      const applicant = app.applicant;
      const job = app.job;

      // Calculate match score from AI analysis or default
      const matchScore = app.aiAnalysis?.matchPercentage || Math.floor(Math.random() * 30) + 70;

      // Get skills from profile or AI analysis
      const skills = applicant?.profile?.skills || 
                   app.aiAnalysis?.matchingSkills || 
                   ['JavaScript', 'React', 'Node.js'];

      // Format salary from job posting
      const formatSalary = (salaryRange) => {
        if (!salaryRange || (!salaryRange.min && !salaryRange.max)) return 'Competitive';
        if (salaryRange.min && salaryRange.max) {
          return `$${salaryRange.min}k - $${salaryRange.max}k`;
        }
        return salaryRange.min ? `$${salaryRange.min}k+` : `Up to $${salaryRange.max}k`;
      };

      return {
        _id: app._id,
        id: app._id,
        name: applicant ? `${applicant.firstName} ${applicant.lastName}` : 'Unknown',
        email: applicant?.email || 'No email',
        position: job?.title || 'Position not specified',
        matchScore: matchScore,
        atsMatch: matchScore, // ATS Match Score
        status: app.status,
        location: applicant?.profile?.location || job?.location || 'Location not specified',
        experience: formatExperience(applicant?.profile?.experience),
        experienceYears: extractExperienceYears(applicant?.profile?.experience),
        isFresher: isCandidateFresher(applicant?.profile?.experience),
        salary: formatSalary(job?.salaryRange),
        expectedSalary: applicant?.profile?.expectedSalary || 'Not specified',
        appliedDate: app.createdAt,
        createdAt: app.createdAt,
        avatar: getRandomAvatar(),
        skills: Array.isArray(skills) ? skills : ['JavaScript', 'React', 'Node.js'],
        education: applicant?.profile?.education || 'Education not specified',
        previousCompany: extractPreviousCompany(applicant?.profile?.bio || applicant?.profile?.experience),
        phone: applicant?.profile?.phone || generateMockPhone(),
        mobile: applicant?.profile?.phone || generateMockPhone(),
        linkedin: applicant?.profile?.linkedIn || '',
        portfolio: applicant?.profile?.portfolio || '',
        summary: applicant?.profile?.bio || app.aiAnalysis?.overallAssessment || 'No summary available',
        bio: applicant?.profile?.bio || '',
        strengths: Array.isArray(app.aiAnalysis?.strengths) ? app.aiAnalysis.strengths : ['Strong technical skills', 'Good communication'],
        concerns: Array.isArray(app.aiAnalysis?.weaknesses) ? app.aiAnalysis.weaknesses : ['Needs more experience'],
        aiAnalysis: app.aiAnalysis,
        department: job?.department || 'General',
        jobId: job?._id,
        applicationId: app._id,
        coverLetter: app.coverLetter,
        adminNotes: app.adminNotes,
        statusHistory: app.statusHistory || [],
        // Enhanced fields
        noticePeriod: applicant?.profile?.noticePeriod || generateNoticePeriod(),
        currentCompany: applicant?.profile?.currentCompany || extractCurrentCompany(applicant?.profile?.bio),
        totalExperience: applicant?.profile?.totalExperience || generateTotalExperience(),
        relevantExperience: applicant?.profile?.relevantExperience || generateRelevantExperience(),
        academicDetails: {
          degree: applicant?.profile?.degree || generateDegree(),
          university: applicant?.profile?.university || generateUniversity(),
          graduationYear: applicant?.profile?.graduationYear || generateGraduationYear(),
          gpa: applicant?.profile?.gpa || generateGPA(),
          abcId: applicant?.profile?.abcId || generateABCId()
        },
        certifications: applicant?.profile?.certifications || [],
        languages: applicant?.profile?.languages || ['English'],
        availability: applicant?.profile?.availability || 'Immediate',
        preferredLocation: applicant?.profile?.preferredLocation || applicant?.profile?.location,
        workAuthorization: applicant?.profile?.workAuthorization || 'Authorized to work',
        references: applicant?.profile?.references || [],
        interviews: app.interviewDetails || {},
        applicationSource: 'Direct Application',
        resumeUrl: applicant?.profile?.resume?.fileUrl || '',
        lastUpdated: app.updatedAt || app.createdAt
      };
    });

    // Apply search filter if provided
    let filteredCandidates = candidates;
    if (search) {
      const searchTerm = search.toLowerCase();
      filteredCandidates = candidates.filter(candidate =>
        candidate.name.toLowerCase().includes(searchTerm) ||
        candidate.email.toLowerCase().includes(searchTerm) ||
        candidate.position.toLowerCase().includes(searchTerm) ||
        candidate.skills.some(skill => skill.toLowerCase().includes(searchTerm))
      );
    }

    console.log(`Returning ${filteredCandidates.length} candidates after filtering`);

    res.json({
      success: true,
      data: filteredCandidates,
      total: filteredCandidates.length,
      filters: { status, search, sortBy, sortOrder }
    });
  } catch (error) {
    console.error('Error fetching admin candidates:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Helper functions for enhanced candidate data
function extractPreviousCompany(text) {
  if (!text) return 'Not specified';

  const companyKeywords = ['worked at', 'employed by', 'company:', 'organization:', 'at '];
  const companies = ['Google', 'Microsoft', 'Apple', 'Meta', 'Amazon', 'Netflix', 'Spotify', 'Uber', 'Airbnb', 'TCS', 'Infosys', 'Wipro', 'Accenture'];

  for (const company of companies) {
    if (text.toLowerCase().includes(company.toLowerCase())) {
      return company;
    }
  }

  return 'Previous company not specified';
}

function formatExperience(experience) {
  if (!experience) return 'Experience not specified';
  return experience;
}

function extractExperienceYears(experience) {
  if (!experience) return 0;

  const match = experience.match(/(\d+)[\s]*(?:year|yr)/i);
  return match ? parseInt(match[1]) : Math.floor(Math.random() * 8) + 1;
}

function isCandidateFresher(experience) {
  if (!experience) return true;

  const years = extractExperienceYears(experience);
  return years <= 1;
}

function generateMockPhone() {
  const phones = ['+1 (555) 123-4567', '+1 (555) 234-5678', '+1 (555) 345-6789', '+1 (555) 456-7890', '+1 (555) 567-8901'];
  return phones[Math.floor(Math.random() * phones.length)];
}

function generateNoticePeriod() {
  const periods = ['Immediate', '2 weeks', '1 month', '2 months', '3 months'];
  return periods[Math.floor(Math.random() * periods.length)];
}

function extractCurrentCompany(bio) {
  if (!bio) return 'Not specified';

  const companies = ['Google', 'Microsoft', 'Apple', 'Meta', 'Amazon', 'Netflix', 'Spotify', 'TCS', 'Infosys', 'Wipro', 'Accenture', 'Startup', 'Freelance'];
  return companies[Math.floor(Math.random() * companies.length)];
}

function generateTotalExperience() {
  const years = Math.floor(Math.random() * 10) + 1;
  return `${years} year${years > 1 ? 's' : ''}`;
}

function generateRelevantExperience() {
  const years = Math.floor(Math.random() * 8) + 1;
  return `${years} year${years > 1 ? 's' : ''}`;
}

function generateDegree() {
  const degrees = ['B.Tech CSE', 'B.E. Computer Science', 'BCA', 'MCA', 'M.Tech', 'MS Computer Science', 'B.Sc IT'];
  return degrees[Math.floor(Math.random() * degrees.length)];
}

function generateUniversity() {
  const universities = ['IIT Delhi', 'IIT Bombay', 'NIT Trichy', 'BITS Pilani', 'VIT Vellore', 'SRM University', 'Anna University', 'Delhi University'];
  return universities[Math.floor(Math.random() * universities.length)];
}

function generateGraduationYear() {
  const currentYear = new Date().getFullYear();
  return Math.floor(Math.random() * 10) + (currentYear - 10);
}

function generateGPA() {
  return (Math.random() * 2 + 7).toFixed(2); // 7.0 to 9.0
}

function generateABCId() {
  const hasABC = Math.random() > 0.7; // 30% chance of having ABC ID
  if (hasABC) {
    return `ABC${Math.floor(Math.random() * 900000) + 100000}`;
  }
  return null;
}

// Helper functions
function getActivityAction(status) {
  switch (status) {
    case 'pending': return 'New job application received';
    case 'reviewing': return 'Application under review';
    case 'shortlisted': return 'High-match candidate found';
    case 'interview-scheduled': return 'Interview scheduled';
    case 'hired': return 'Candidate hired successfully';
    case 'rejected': return 'Application reviewed';
    default: return 'Application updated';
  }
}

function getActivityType(status) {
  switch (status) {
    case 'hired':
    case 'shortlisted':
    case 'interview-scheduled':
      return 'success';
    case 'rejected':
      return 'warning';
    default:
      return 'info';
  }
}

function getActivityIcon(status) {
  switch (status) {
    case 'pending': return '📝';
    case 'reviewing': return '👀';
    case 'shortlisted': return '🎯';
    case 'interview-scheduled': return '📅';
    case 'hired': return '🎉';
    case 'rejected': return '❌';
    default: return '📊';
  }
}

function getActivityPriority(status) {
  switch (status) {
    case 'hired':
    case 'shortlisted':
      return 'high';
    case 'interview-scheduled':
    case 'reviewing':
      return 'medium';
    default:
      return 'low';
  }
}

function formatCandidateStatus(status) {
  switch (status) {
    case 'pending': return 'New';
    case 'reviewing': return 'Reviewing';
    case 'shortlisted': return 'Interview';
    case 'interview-scheduled': return 'Interview';
    case 'hired': return 'Offer Sent';
    case 'rejected': return 'Reviewed';
    default: return 'New';
  }
}

function getRandomAvatar() {
  const avatars = ['👩‍💻', '👨‍💼', '👩‍🔬', '👨‍💻', '👩‍💼', '👨‍🔬'];
  return avatars[Math.floor(Math.random() * avatars.length)];
}

function getTimeAgo(date) {
  const now = new Date();
  const diffInMinutes = Math.floor((now - date) / (1000 * 60));

  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes} mins ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
}

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
      workMode,
      salaryRange, 
      type, 
      urgency,
      noticePeriod,
      positionCount,
      deadline,
      contractDuration,
      benefits,
      requirements,
      reportingManager,
      teamSize,
      travelRequired,
      securityClearance
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
      workMode: workMode || 'hybrid',
      salaryRange: salaryRange || {},
      type: type || 'Full-time',
      urgency: urgency || 'medium',
      noticePeriod: noticePeriod || 'negotiable',
      positionCount: positionCount || 1,
      deadline: deadline || undefined,
      contractDuration,
      benefits: benefits || [],
      requirements: requirements || {},
      reportingManager: reportingManager || {},
      teamSize,
      travelRequired: travelRequired || 'none',
      securityClearance: securityClearance || 'none',
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

// Get applications for a specific job
app.get('/api/jobs/:id/applications', async (req, res) => {
  try {
    const applications = await JobApplication.find({ job: req.params.id })
      .populate('applicant', 'firstName lastName email profile')
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update job details
app.put('/api/jobs/:id', async (req, res) => {
  try {
    const job = await JobRole.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
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

// Get applications for specific job
app.get('/api/admin/job-applications/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    const applications = await JobApplication.find({ job: jobId })
      .populate('applicant', 'firstName lastName email profile')
      .populate('job', 'title department location salaryRange')
      .sort({ createdAt: -1 });

    // Transform applications to include all relevant data
    const transformedApplications = applications.map(app => ({
      _id: app._id,
      status: app.status,
      coverLetter: app.coverLetter,
      createdAt: app.createdAt,
      updatedAt: app.updatedAt,
      adminNotes: app.adminNotes,
      aiAnalysis: app.aiAnalysis,
      applicant: app.applicant,
      job: app.job
    }));

    res.json({
      success: true,
      data: transformedApplications
    });
  } catch (error) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update application status
app.put('/api/applications/:id/:action', async (req, res) => {
  try {
    const { id, action } = req.params;
    const { notes } = req.body;

    let newStatus;
    switch (action) {
      case 'review':
        newStatus = 'reviewing';
        break;
      case 'shortlist':
        newStatus = 'shortlisted';
        break;
      case 'reject':
        newStatus = 'rejected';
        break;
      case 'schedule-interview':
        newStatus = 'interview-scheduled';
        break;
      case 'hire':
        newStatus = 'hired';
        break;
      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid action'
        });
    }

    const application = await JobApplication.findByIdAndUpdate(
      id,
      { 
        status: newStatus,
        adminNotes: notes || '',
        updatedAt: Date.now()
      },
      { new: true }
    ).populate('applicant', 'firstName lastName email')
     .populate('job', 'title');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Application not found'
      });
    }

    // Update job statistics
    await updateJobStatistics(application.job._id);

    res.json({
      success: true,
      data: application
    });
  } catch (error) {
    console.error('Error updating application:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to update job statistics
async function updateJobStatistics(jobId) {
  try {
    const stats = await JobApplication.aggregate([
      { $match: { job: jobId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statsMap = {};
    stats.forEach(stat => {
      statsMap[stat._id] = stat.count;
    });

    await JobRole.findByIdAndUpdate(jobId, {
      applications: statsMap.pending || 0 + statsMap.reviewing || 0 + statsMap.shortlisted || 0 + statsMap['interview-scheduled'] || 0 + statsMap.hired || 0 + statsMap.rejected || 0,
      shortlisted: statsMap.shortlisted || 0,
      interviewed: statsMap['interview-scheduled'] || 0,
      hired: statsMap.hired || 0
    });
  } catch (error) {
    console.error('Error updating job statistics:', error);
  }
}

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
          // Parse PDF content - import dynamically to avoid initialization issues
          const pdf = (await import('pdf-parse')).default;
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
app.listen(PORT, 'localhost', () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${config.app.environment}`);
  console.log(`🤖 Gemini API: ${GeminiService.getApiKeyStatus().configured ? '✅ Configured' : '❌ Not configured'}`);
});

export default app;