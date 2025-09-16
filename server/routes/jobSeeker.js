
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import JobApplication from '../models/JobApplication.js';
import SavedJob from '../models/SavedJob.js';
import Interview from '../models/Interview.js';
import JobRole from '../models/JobRole.js';

const router = express.Router();

// Get dashboard stats for job seeker
router.get('/dashboard/stats', authenticateToken, async (req, res) => {
  try {
    const userId = req.user._id;

    // Get counts
    const appliedJobs = await JobApplication.countDocuments({ applicant: userId });
    const savedJobs = await SavedJob.countDocuments({ user: userId });
    const interviews = await Interview.countDocuments({ 
      applicant: userId, 
      status: { $in: ['scheduled', 'completed'] }
    });

    // Calculate profile views (placeholder - would need tracking implementation)
    const profileViews = req.user.profileViews || 0;

    res.json({
      success: true,
      data: {
        appliedJobs,
        savedJobs,
        interviews,
        profileViews
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get applied jobs
router.get('/applications', authenticateToken, async (req, res) => {
  try {
    const applications = await JobApplication.find({ applicant: req.user._id })
      .populate('job', 'title department location salaryRange')
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedApplications = applications.map(app => ({
      id: app._id,
      job: app.job.title,
      company: app.job.department,
      status: app.status,
      appliedDate: app.createdAt,
      statusColor: getStatusColor(app.status),
      jobId: app.job._id,
      location: app.job.location,
      salary: app.job.salaryRange
    }));

    res.json({
      success: true,
      data: formattedApplications
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get saved jobs
router.get('/saved-jobs', authenticateToken, async (req, res) => {
  try {
    const savedJobs = await SavedJob.find({ user: req.user._id })
      .populate('job', 'title department location salaryRange createdAt status')
      .sort({ createdAt: -1 })
      .limit(20);

    const formattedJobs = savedJobs.map(saved => ({
      id: saved._id,
      jobId: saved.job._id,
      title: saved.job.title,
      company: saved.job.department,
      location: saved.job.location,
      salary: saved.job.salaryRange,
      savedDate: saved.createdAt,
      status: saved.job.status
    }));

    res.json({
      success: true,
      data: formattedJobs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get interviews
router.get('/interviews', authenticateToken, async (req, res) => {
  try {
    const interviews = await Interview.find({ applicant: req.user._id })
      .populate('job', 'title department')
      .populate('application', 'status')
      .sort({ scheduledDate: 1 });

    const formattedInterviews = interviews.map(interview => ({
      id: interview._id,
      job: interview.job.title,
      company: interview.job.department,
      scheduledDate: interview.scheduledDate,
      duration: interview.duration,
      type: interview.type,
      status: interview.status,
      interviewer: interview.interviewer,
      meetingLink: interview.meetingLink,
      location: interview.location,
      notes: interview.notes
    }));

    res.json({
      success: true,
      data: formattedInterviews
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Apply to a job
router.post('/apply/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const { coverLetter } = req.body;
    const userId = req.user._id;

    // Check if job exists
    const job = await JobRole.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if already applied
    const existingApplication = await JobApplication.findOne({
      applicant: userId,
      job: jobId
    });

    if (existingApplication) {
      return res.status(400).json({
        success: false,
        error: 'You have already applied to this job'
      });
    }

    // Create application
    const application = new JobApplication({
      applicant: userId,
      job: jobId,
      coverLetter,
      status: 'pending'
    });

    await application.save();

    // Update job application count
    await JobRole.findByIdAndUpdate(jobId, {
      $inc: { applications: 1 }
    });

    res.status(201).json({
      success: true,
      data: application
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Save/unsave a job
router.post('/save-job/:jobId', authenticateToken, async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.user._id;

    // Check if job exists
    const job = await JobRole.findById(jobId);
    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      });
    }

    // Check if already saved
    const existingSave = await SavedJob.findOne({
      user: userId,
      job: jobId
    });

    if (existingSave) {
      // Unsave
      await SavedJob.deleteOne({ _id: existingSave._id });
      res.json({
        success: true,
        data: { action: 'unsaved' }
      });
    } else {
      // Save
      const savedJob = new SavedJob({
        user: userId,
        job: jobId
      });
      await savedJob.save();
      res.json({
        success: true,
        data: { action: 'saved' }
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Helper function to get status color
function getStatusColor(status) {
  switch (status.toLowerCase()) {
    case 'pending': return 'blue';
    case 'reviewing': return 'yellow';
    case 'shortlisted': return 'green';
    case 'interview-scheduled': return 'purple';
    case 'rejected': return 'red';
    case 'hired': return 'green';
    default: return 'gray';
  }
}

export default router;
