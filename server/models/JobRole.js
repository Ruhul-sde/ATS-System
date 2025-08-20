
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
    enum: ['entry', 'mid', 'senior', 'lead'],
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
  salaryRange: {
    min: Number,
    max: Number
  },
  type: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Internship'],
    default: 'Full-time'
  },
  status: {
    type: String,
    enum: ['active', 'paused', 'closed'],
    default: 'active'
  },
  urgency: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  applications: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
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
