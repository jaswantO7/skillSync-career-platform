const mongoose = require('mongoose');

const ResourceSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['course', 'video', 'article', 'book', 'tutorial', 'practice', 'project'],
    required: true
  },
  url: String,
  provider: String, // e.g., "YouTube", "Coursera", "Udemy"
  duration: String, // e.g., "2 hours", "4 weeks"
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  },
  rating: {
    type: Number,
    min: 0,
    max: 5
  },
  cost: {
    amount: Number,
    currency: {
      type: String,
      default: 'USD'
    }
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date
});

const MonthlyPlanSchema = new mongoose.Schema({
  month: {
    type: Number,
    required: true,
    min: 1
  },
  title: {
    type: String,
    required: true
  },
  focus: {
    type: String,
    required: true
  },
  skills: [String],
  resources: [ResourceSchema],
  milestones: [String],
  estimatedHours: {
    type: Number,
    min: 1,
    default: 40
  },
  status: {
    type: String,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started'
  },
  startDate: Date,
  completedDate: Date
});

const RoadmapSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  careerPathId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CareerPath',
    index: true
  },
  title: {
    type: String,
    required: true
  },
  targetRole: {
    type: String,
    required: true
  },
  currentRole: String,
  duration: {
    months: {
      type: Number,
      required: true,
      min: 1,
      max: 24
    },
    startDate: {
      type: Date,
      default: Date.now
    },
    expectedEndDate: Date
  },
  monthlyPlans: [MonthlyPlanSchema],
  overallProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  status: {
    type: String,
    enum: ['draft', 'active', 'paused', 'completed', 'abandoned'],
    default: 'draft'
  },
  aiGeneratedAt: {
    type: Date,
    default: Date.now
  },
  customizations: [{
    type: String,
    description: String,
    appliedAt: {
      type: Date,
      default: Date.now
    }
  }]
}, {
  timestamps: true
});

// Indexes
RoadmapSchema.index({ userId: 1 });
RoadmapSchema.index({ status: 1 });
RoadmapSchema.index({ targetRole: 1 });

// Pre-save middleware to calculate expected end date
RoadmapSchema.pre('save', function(next) {
  if (this.duration.startDate && this.duration.months) {
    const endDate = new Date(this.duration.startDate);
    endDate.setMonth(endDate.getMonth() + this.duration.months);
    this.duration.expectedEndDate = endDate;
  }
  next();
});

// Methods
RoadmapSchema.methods.updateProgress = function() {
  const totalResources = this.monthlyPlans.reduce((total, plan) => total + plan.resources.length, 0);
  const completedResources = this.monthlyPlans.reduce((total, plan) => 
    total + plan.resources.filter(r => r.completed).length, 0);
  
  this.overallProgress = totalResources > 0 ? (completedResources / totalResources) * 100 : 0;
  return this.save();
};

RoadmapSchema.methods.getCurrentMonth = function() {
  const now = new Date();
  const startDate = this.duration.startDate;
  const monthsDiff = (now.getFullYear() - startDate.getFullYear()) * 12 + 
                    (now.getMonth() - startDate.getMonth()) + 1;
  
  return this.monthlyPlans.find(plan => plan.month === monthsDiff);
};

RoadmapSchema.methods.completeResource = function(monthIndex, resourceIndex) {
  if (this.monthlyPlans[monthIndex] && this.monthlyPlans[monthIndex].resources[resourceIndex]) {
    this.monthlyPlans[monthIndex].resources[resourceIndex].completed = true;
    this.monthlyPlans[monthIndex].resources[resourceIndex].completedAt = new Date();
    return this.updateProgress();
  }
  return Promise.reject(new Error('Resource not found'));
};

module.exports = mongoose.model('Roadmap', RoadmapSchema);