const mongoose = require('mongoose');

const DeliverableSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  type: {
    type: String,
    enum: ['code', 'design', 'documentation', 'presentation', 'deployment'],
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  completedAt: Date,
  url: String, // Link to GitHub, portfolio, etc.
  notes: String
});

const ProjectSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    index: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  objective: {
    type: String,
    required: true
  },
  targetRole: String,
  skillsToPractice: [String],
  difficulty: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    required: true
  },
  estimatedDuration: {
    value: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ['hours', 'days', 'weeks', 'months'],
      required: true
    }
  },
  deliverables: [DeliverableSchema],
  technologies: [String],
  resources: [{
    title: String,
    url: String,
    type: {
      type: String,
      enum: ['tutorial', 'documentation', 'example', 'tool']
    }
  }],
  status: {
    type: String,
    enum: ['suggested', 'planned', 'in_progress', 'completed', 'abandoned'],
    default: 'suggested'
  },
  progress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  startDate: Date,
  completedDate: Date,
  githubUrl: String,
  liveUrl: String,
  portfolioIncluded: {
    type: Boolean,
    default: false
  },
  feedback: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comments: String,
    submittedAt: Date
  },
  aiGeneratedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
ProjectSchema.index({ userId: 1 });
ProjectSchema.index({ status: 1 });
ProjectSchema.index({ targetRole: 1 });
ProjectSchema.index({ difficulty: 1 });

// Methods
ProjectSchema.methods.updateProgress = function() {
  const totalDeliverables = this.deliverables.length;
  const completedDeliverables = this.deliverables.filter(d => d.completed).length;
  
  this.progress = totalDeliverables > 0 ? (completedDeliverables / totalDeliverables) * 100 : 0;
  
  if (this.progress === 100 && this.status !== 'completed') {
    this.status = 'completed';
    this.completedDate = new Date();
  }
  
  return this.save();
};

ProjectSchema.methods.completeDeliverable = function(deliverableIndex) {
  if (this.deliverables[deliverableIndex]) {
    this.deliverables[deliverableIndex].completed = true;
    this.deliverables[deliverableIndex].completedAt = new Date();
    return this.updateProgress();
  }
  return Promise.reject(new Error('Deliverable not found'));
};

ProjectSchema.methods.startProject = function() {
  this.status = 'in_progress';
  this.startDate = new Date();
  return this.save();
};

// Virtual field for estimated hours (computed from estimatedDuration)
ProjectSchema.virtual('estimatedHours').get(function() {
  if (!this.estimatedDuration) return 0;
  if (this.estimatedDuration.unit === 'hours') return this.estimatedDuration.value;
  if (this.estimatedDuration.unit === 'days') return this.estimatedDuration.value * 8;
  if (this.estimatedDuration.unit === 'weeks') return this.estimatedDuration.value * 40;
  return this.estimatedDuration.value;
});

ProjectSchema.set('toJSON', { virtuals: true });
ProjectSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Project', ProjectSchema);