
import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import CandidateProfile from '../models/CandidateProfile.js';
import User from '../models/User.js';
import { authenticateToken } from '../middleware/auth.js';
import { GeminiService } from '../services/geminiService.js';

const router = express.Router();

// Configure multer for resume uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), 'uploads/resumes');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${req.user._id}-${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['.pdf', '.doc', '.docx'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.includes(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only PDF, DOC, and DOCX files are allowed.'));
    }
  }
});

// Get or create candidate profile for logged-in user
router.get('/profile', authenticateToken, async (req, res) => {
  try {
    let candidateProfile = await CandidateProfile.findOne({
      'personalInfo.email': req.user.email
    });

    if (!candidateProfile) {
      // Create new candidate profile from user data
      candidateProfile = new CandidateProfile({
        personalInfo: {
          firstName: req.user.firstName,
          lastName: req.user.lastName,
          email: req.user.email,
          phone: req.user.profile?.phone || '',
          location: req.user.profile?.location || '',
          profilePictureUrl: req.user.profile?.profilePictureUrl || ''
        },
        professionalInfo: {
          currentRole: req.user.profile?.currentDesignation || '',
          currentCompany: req.user.profile?.currentCompany || '',
          totalExperience: req.user.profile?.totalExperience || '',
          relevantExperience: req.user.profile?.relevantExperience || '',
          expectedSalary: req.user.profile?.expectedSalary || '',
          noticePeriod: req.user.profile?.noticePeriod || '',
          bio: req.user.profile?.bio || ''
        },
        education: {
          degree: req.user.profile?.degree || '',
          university: req.user.profile?.university || '',
          graduationYear: req.user.profile?.graduationYear || null
        },
        skillsAndCertifications: {
          technicalSkills: req.user.profile?.skills || [],
          certifications: (req.user.profile?.certifications || []).map(cert => ({
            name: cert,
            issuer: 'Unknown',
            issueDate: null,
            expiryDate: null
          })),
          languages: req.user.profile?.languages || []
        },
        resume: req.user.profile?.resume || {},
        socialLinks: {
          linkedin: req.user.profile?.linkedIn || '',
          portfolio: req.user.profile?.portfolio || ''
        },
        source: 'Manual Registration'
      });

      await candidateProfile.save();
    }

    res.json({
      success: true,
      data: candidateProfile
    });
  } catch (error) {
    console.error('Error fetching candidate profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Update candidate profile
router.put('/profile', authenticateToken, async (req, res) => {
  try {
    const updateData = req.body;
    
    const candidateProfile = await CandidateProfile.findOneAndUpdate(
      { 'personalInfo.email': req.user.email },
      updateData,
      { new: true, upsert: true, runValidators: true }
    );

    // Also update the main User profile for consistency
    const userProfileUpdate = {
      phone: updateData.personalInfo?.phone,
      bio: updateData.professionalInfo?.bio,
      skills: updateData.skillsAndCertifications?.technicalSkills,
      currentDesignation: updateData.professionalInfo?.currentRole,
      currentCompany: updateData.professionalInfo?.currentCompany,
      totalExperience: updateData.professionalInfo?.totalExperience,
      degree: updateData.education?.degree,
      university: updateData.education?.university,
      graduationYear: updateData.education?.graduationYear
    };

    await User.findByIdAndUpdate(req.user._id, {
      'profile': { ...req.user.profile, ...userProfileUpdate }
    });

    res.json({
      success: true,
      data: candidateProfile,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Error updating candidate profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Upload resume for candidate profile
router.post('/resume', authenticateToken, upload.single('resume'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No resume file uploaded'
      });
    }

    const fileUrl = `/uploads/resumes/${req.file.filename}`;
    
    // Extract text from resume for AI analysis (optional)
    let extractedText = '';
    try {
      if (req.file.mimetype === 'application/pdf') {
        const pdf = (await import('pdf-parse')).default;
        const pdfData = await pdf(fs.readFileSync(req.file.path));
        extractedText = pdfData.text;
      }
    } catch (extractError) {
      console.log('Text extraction failed, continuing without analysis:', extractError.message);
    }

    // Perform AI analysis if text was extracted
    let aiAnalysis = null;
    if (extractedText && extractedText.trim()) {
      try {
        const analysis = await GeminiService.analyzeResume(
          extractedText,
          'General candidate profile analysis for skill extraction and experience parsing'
        );
        
        aiAnalysis = {
          extractedSkills: analysis.extractedInfo?.skills || [],
          extractedExperience: analysis.extractedInfo?.totalExperience || '',
          extractedEducation: analysis.extractedInfo?.education || '',
          extractedCertifications: analysis.extractedInfo?.certifications || [],
          analysisDate: new Date(),
          confidenceScore: analysis.confidenceScore || 75
        };
      } catch (aiError) {
        console.log('AI analysis failed, continuing without analysis:', aiError.message);
      }
    }

    // Update candidate profile with resume information
    const candidateProfile = await CandidateProfile.findOneAndUpdate(
      { 'personalInfo.email': req.user.email },
      {
        resume: {
          fileName: req.file.originalname,
          fileUrl: fileUrl,
          fileSize: req.file.size,
          uploadDate: new Date(),
          extractedText: extractedText,
          aiAnalysis: aiAnalysis
        }
      },
      { new: true, upsert: true }
    );

    // Also update User profile for backward compatibility
    await User.findByIdAndUpdate(req.user._id, {
      'profile.resume': {
        fileName: req.file.originalname,
        fileUrl: fileUrl,
        uploadDate: new Date()
      }
    });

    res.json({
      success: true,
      data: {
        resume: candidateProfile.resume,
        aiAnalysis: aiAnalysis
      },
      message: 'Resume uploaded successfully'
    });
  } catch (error) {
    console.error('Error uploading resume:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Get all candidates for admin view
router.get('/all', authenticateToken, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin role required.'
      });
    }

    const { search, skills, experience, location, company, page = 1, limit = 20 } = req.query;
    
    // Build search filter
    const filter = { isActive: true };
    
    if (search) {
      filter.$or = [
        { 'personalInfo.firstName': { $regex: search, $options: 'i' } },
        { 'personalInfo.lastName': { $regex: search, $options: 'i' } },
        { 'personalInfo.email': { $regex: search, $options: 'i' } },
        { 'professionalInfo.currentRole': { $regex: search, $options: 'i' } },
        { 'professionalInfo.currentCompany': { $regex: search, $options: 'i' } },
        { 'workExperienceHistory.companyName': { $regex: search, $options: 'i' } },
        { 'workExperienceHistory.jobTitle': { $regex: search, $options: 'i' } },
        { 'educationHistory.graduation.degree': { $regex: search, $options: 'i' } },
        { 'educationHistory.graduation.university': { $regex: search, $options: 'i' } }
      ];
    }
    
    if (skills) {
      const skillsArray = skills.split(',').map(s => s.trim());
      filter.$or = [
        { 'skillsAndCertifications.technicalSkills.skillName': { $in: skillsArray } },
        { 'skillsAndCertifications.technicalSkills': { $in: skillsArray } }
      ];
    }
    
    if (location) {
      filter.$or = [
        { 'personalInfo.location': { $regex: location, $options: 'i' } },
        { 'workExperienceHistory.location': { $regex: location, $options: 'i' } }
      ];
    }

    if (experience) {
      filter['professionalInfo.totalExperience'] = { $regex: experience, $options: 'i' };
    }

    if (company) {
      filter.$or = [
        { 'professionalInfo.currentCompany': { $regex: company, $options: 'i' } },
        { 'workExperienceHistory.companyName': { $regex: company, $options: 'i' } }
      ];
    }

    const candidates = await CandidateProfile.find(filter)
      .sort({ profileCompleteness: -1, createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);

    const total = await CandidateProfile.countDocuments(filter);

    res.json({
      success: true,
      data: candidates,
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
router.get('/:candidateId', authenticateToken, async (req, res) => {
  try {
    const candidate = await CandidateProfile.findOne({
      candidateId: req.params.candidateId
    });

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate not found'
      });
    }

    res.json({
      success: true,
      data: candidate
    });
  } catch (error) {
    console.error('Error fetching candidate:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Delete candidate profile
router.delete('/profile', authenticateToken, async (req, res) => {
  try {
    const candidate = await CandidateProfile.findOneAndUpdate(
      { 'personalInfo.email': req.user.email },
      { isActive: false },
      { new: true }
    );

    if (!candidate) {
      return res.status(404).json({
        success: false,
        error: 'Candidate profile not found'
      });
    }

    res.json({
      success: true,
      message: 'Candidate profile deactivated successfully'
    });
  } catch (error) {
    console.error('Error deleting candidate profile:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
