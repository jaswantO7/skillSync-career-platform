const mongoose = require('mongoose');

const PathStepSchema = new mongoose.Schema({
  role: {
    type: String,
    required: true
  },
  requiredSkills: [String],
  averageSalary: {
    min: Number,
    max: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  timeToAchieve: {
    type: String, // e.g., "6-12 months", "1-2 years"
    required: true
  },
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced', 'expert'],
    required: true
  },
  description: String,
  keyResponsibilities: [String]
});

const CareerPathSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  currentRole: {
    type: String,
    required: true
  },
  targetRole: {
    type: String,
    required: true
  },
  pathSteps: [PathStepSchema],
  reasoning: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    min: 0,
    max: 1,
    default: 0.8
  },
  status: {
    type: String,
    enum: ['active', 'completed', 'paused', 'abandoned'],
    default: 'active'
  },
  progress: {
    currentStep: {
      type: Number,
      default: 0
    },
    completedSteps: [Number],
    overallProgress: {
      type: Number,
      min: 0,
      max: 100,
      default: 0
    }
  },
  aiGeneratedAt: {
    type: Date,
    default: Date.now
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
CareerPathSchema.index({ userId: 1 });
CareerPathSchema.index({ status: 1 });
CareerPathSchema.index({ targetRole: 1 });

// Methods
CareerPathSchema.methods.updateProgress = function(stepIndex, completed = true) {
  if (completed && !this.progress.completedSteps.includes(stepIndex)) {
    this.progress.completedSteps.push(stepIndex);
  }
  
  this.progress.overallProgress = (this.progress.completedSteps.length / this.pathSteps.length) * 100;
  this.lastUpdated = new Date();
  
  return this.save();
};

CareerPathSchema.methods.getNextStep = function() {
  const nextStepIndex = this.progress.completedSteps.length;
  return nextStepIndex < this.pathSteps.length ? this.pathSteps[nextStepIndex] : null;
};

module.exports = mongoose.model('CareerPath', CareerPathSchema);