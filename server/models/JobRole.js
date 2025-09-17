
import mongoose from 'mongoose';

const jobRoleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  department: {
    type: String,
    required: true,
    trim: true
  },
  experienceLevel: {
    type: String,
    enum: ['entry', 'mid', 'senior', 'lead', 'director', 'vp'],
    required: true
  },
  skills: [{
    type: String,
    trim: true
  }],
  location: {
    type: String,
    trim: true
  },
  workMode: {
    type: String,
    enum: ['remote', 'hybrid', 'onsite'],
    default: 'hybrid'
  },
  salaryRange: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship', 'Freelance'],
    default: 'Full-time'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed', 'draft'],
    default: 'draft'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  noticePeriod: {
    type: String,
    enum: ['immediate', '2-weeks', '1-month', '2-months', '3-months', 'negotiable'],
    default: 'negotiable'
  },
  contractDuration: {
    type: String, // For contract positions
    trim: true
  },
  benefits: [{
    type: String,
    trim: true
  }],
  requirements: {
    education: {
      type: String,
      trim: true
    },
    certifications: [{
      type: String,
      trim: true
    }],
    languages: [{
      language: String,
      proficiency: {
        type: String,
        enum: ['basic', 'intermediate', 'advanced', 'native']
      }
    }]
  },
  reportingManager: {
    title: String,
    department: String
  },
  teamSize: {
    type: Number,
    min: 0
  },
  travelRequired: {
    type: String,
    enum: ['none', 'minimal', 'occasional', 'frequent'],
    default: 'none'
  },
  securityClearance: {
    type: String,
    enum: ['none', 'public-trust', 'secret', 'top-secret'],
    default: 'none'
  },
  applications: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  shortlisted: {
    type: Number,
    default: 0
  },
  interviewed: {
    type: Number,
    default: 0
  },
  hired: {
    type: Number,
    default: 0
  },
  positionCount: {
    type: Number,
    default: 1,
    min: 1
  },
  filledPositions: {
    type: Number,
    default: 0
  },
  deadline: {
    type: Date
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
jobRoleSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

const JobRole = mongoose.model('JobRole', jobRoleSchema);

export default JobRole;
