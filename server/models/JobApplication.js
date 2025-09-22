import mongoose from 'mongoose';

const jobApplicationSchema = new mongoose.Schema({
  candidateId: {
    type: String,
    unique: true,
    required: true
  },
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  job: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'JobRole',
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'shortlisted', 'interview-scheduled', 'rejected', 'hired'],
    default: 'pending'
  },
  coverLetter: {
    type: String,
    maxlength: 2000
  },
  resumeFile: {
    fileName: String,
    fileContent: String, // Store the resume content for analysis
    uploadDate: {
      type: Date,
      default: Date.now
    }
  },
  aiAnalysis: {
    matchPercentage: Number,
    matchingSkills: [String],
    missingSkills: [String],
    experienceMatch: String,
    educationRelevance: String,
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    overallAssessment: String,
    interviewReadiness: String,
    analysisDate: Date
  },
  adminNotes: {
    type: String,
    maxlength: 1000
  },
  interviewDetails: {
    scheduledDate: Date,
    location: String,
    interviewType: {
      type: String,
      enum: ['phone', 'video', 'in-person', 'technical']
    },
    interviewer: String,
    feedback: String
  },
  statusHistory: [{
    status: String,
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    changedAt: {
      type: Date,
      default: Date.now
    },
    notes: String
  }]
}, {
  timestamps: true
});

// Indexes for performance
jobApplicationSchema.index({ applicant: 1, job: 1 }, { unique: true }); // Prevent duplicate applications
jobApplicationSchema.index({ job: 1, status: 1 });
jobApplicationSchema.index({ applicant: 1 });
jobApplicationSchema.index({ createdAt: -1 });

// Generate unique candidateId and add status to history before saving
jobApplicationSchema.pre('save', function(next) {
  if (this.isNew && !this.candidateId) {
    // Generate unique candidate ID like "CAND-2024-001"
    const year = new Date().getFullYear();
    const randomNum = Math.floor(Math.random() * 9000) + 1000;
    this.candidateId = `CAND-${year}-${randomNum}`;
  }
  
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      changedAt: new Date()
    });
  }
  next();
});

export default mongoose.model('JobApplication', jobApplicationSchema);