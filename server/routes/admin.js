
import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import JobApplication from '../models/JobApplication.js';

const router = express.Router();

// Get all candidates for admin view
router.get('/candidates', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
    }

    const { search, skills, experience, location, company, page = 1, limit = 50 } = req.query;

    // Build search filter
    const filter = {};

    // Fetch all applications with populated data
    let applications = await JobApplication.find(filter)
      .populate('applicant', 'firstName lastName email phone profile')
      .populate('job', 'title department')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    // Transform the data to match frontend expectations
    const transformedCandidates = applications.map(app => {
      const applicant = app.applicant;
      const profile = applicant?.profile || {};
      
      return {
        _id: app._id,
        candidateId: app.candidateId,
        name: applicant ? `${applicant.firstName} ${applicant.lastName}` : 'Unknown',
        firstName: applicant?.firstName || '',
        lastName: applicant?.lastName || '',
        email: applicant?.email || '',
        phone: applicant?.phone || profile.phone || '',
        mobile: profile.mobile || applicant?.phone || '',
        alternatePhone: profile.alternatePhone || '',
        position: app.job?.title || profile.currentDesignation || 'Not specified',
        currentDesignation: profile.currentDesignation || '',
        currentCompany: profile.currentCompany || '',
        location: profile.location || profile.address?.city || '',
        address: profile.address || {},
        bio: profile.bio || '',
        summary: profile.summary || '',
        skills: profile.skills || [],
        experienceYears: profile.totalExperience || 0,
        totalExperience: profile.totalExperience || '',
        relevantExperience: profile.relevantExperience || '',
        isFresher: profile.isFresher || false,
        education: profile.education || '',
        degree: profile.degree || '',
        university: profile.university || '',
        graduationYear: profile.graduationYear || '',
        gpa: profile.gpa || '',
        academicDetails: {
          degree: profile.degree || '',
          university: profile.university || '',
          graduationYear: profile.graduationYear || '',
          gpa: profile.gpa || '',
          abcId: profile.abcId || '',
          additionalEducation: profile.additionalEducation || ''
        },
        currentSalary: profile.currentSalary || '',
        expectedSalary: profile.expectedSalary || '',
        noticePeriod: profile.noticePeriod || '',
        workAuthorization: profile.workAuthorization || '',
        availability: profile.availability || '',
        preferredLocation: profile.preferredLocation || [],
        workPreferences: profile.workPreferences || [],
        languages: profile.languages || [],
        certifications: profile.certifications || [],
        linkedIn: profile.linkedIn || profile.linkedin || '',
        linkedin: profile.linkedin || profile.linkedIn || '',
        portfolio: profile.portfolio || '',
        github: profile.github || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        profilePicture: profile.profilePicture || {},
        resume: app.resumeFile || profile.resume || {},
        status: app.status,
        appliedDate: app.createdAt,
        applicationSource: app.applicationSource || 'Direct Application',
        matchScore: app.aiAnalysis?.matchPercentage || 0,
        atsMatch: app.aiAnalysis?.matchPercentage || 0,
        strengths: app.aiAnalysis?.strengths || [],
        concerns: app.aiAnalysis?.weaknesses || [],
        aiAnalysis: app.aiAnalysis || {},
        references: app.references || [],
        hiringDetails: app.hiringDetails || {},
        jobId: app.job?._id || '',
        coverLetter: app.coverLetter || '',
        adminNotes: app.adminNotes || '',
        interviewDetails: app.interviewDetails || {},
        statusHistory: app.statusHistory || [],
        createdAt: app.createdAt,
        updatedAt: app.updatedAt
      };
    });

    // Apply search filters on transformed data if needed
    let filteredCandidates = transformedCandidates;

    if (search) {
      filteredCandidates = filteredCandidates.filter(c => 
        c.name?.toLowerCase().includes(search.toLowerCase()) ||
        c.email?.toLowerCase().includes(search.toLowerCase()) ||
        c.position?.toLowerCase().includes(search.toLowerCase()) ||
        c.currentCompany?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim().toLowerCase());
      filteredCandidates = filteredCandidates.filter(c =>
        c.skills.some(skill => skillsArray.includes(skill.toLowerCase()))
      );
    }

    if (location) {
      filteredCandidates = filteredCandidates.filter(c =>
        c.location?.toLowerCase().includes(location.toLowerCase())
      );
    }

    if (company) {
      filteredCandidates = filteredCandidates.filter(c =>
        c.currentCompany?.toLowerCase().includes(company.toLowerCase())
      );
    }

    const total = filteredCandidates.length;

    res.json({
      success: true,
      data: filteredCandidates,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalCandidates: total,
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1
      }
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get single candidate by ID
router.get('/candidates/:candidateId', authenticateToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
    }

    const application = await JobApplication.findById(req.params.candidateId)
      .populate('applicant', 'firstName lastName email phone profile')
      .populate('job', 'title department');

    if (!application) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found'
      });
    }

    const applicant = application.applicant;
    const profile = applicant?.profile || {};
    
    const transformedCandidate = {
      _id: application._id,
      candidateId: application.candidateId,
      name: applicant ? `${applicant.firstName} ${applicant.lastName}` : 'Unknown',
      firstName: applicant?.firstName || '',
      lastName: applicant?.lastName || '',
      email: applicant?.email || '',
      phone: applicant?.phone || profile.phone || '',
      position: application.job?.title || profile.currentDesignation || 'Not specified',
      location: profile.location || '',
      skills: profile.skills || [],
      status: application.status,
      matchScore: application.aiAnalysis?.matchPercentage || 0,
      aiAnalysis: application.aiAnalysis || {},
      resume: application.resumeFile || {},
      createdAt: application.createdAt
    };

    res.json({
      success: true,
      data: transformedCandidate
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
