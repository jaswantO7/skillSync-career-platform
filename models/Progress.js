const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['skill_added', 'resource_completed', 'project_started', 'project_completed', 'milestone_reached', 'roadmap_updated'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    skillName: String,
    resourceTitle: String,
    projectTitle: String,
    milestoneTitle: String,
    pointsEarned: Number
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

const StreakSchema = new mongoose.Schema({
  current: {
    type: Number,
    default: 0
  },
  longest: {
    type: Number,
    default: 0
  },
  lastActivityDate: {
    type: Date,
    default: Date.now
  }
});

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    index: true
  },
  roadmapId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Roadmap',
    index: true
  },
  overallProgress: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  completedModules: [{
    moduleId: String,
    moduleName: String,
    completedAt: {
      type: Date,
      default: Date.now
    },
    timeSpent: Number, // in minutes
    score: Number
  }],
  skillProgress: [{
    skillName: String,
    startLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 1
    },
    currentLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 1
    },
    targetLevel: {
      type: Number,
      min: 1,
      max: 5,
      default: 3
    },
    lastPracticed: Date,
    hoursSpent: {
      type: Number,
      default: 0
    }
  }],
  weeklyGoals: {
    hoursTarget: {
      type: Number,
      default: 10
    },
    hoursCompleted: {
      type: Number,
      default: 0
    },
    weekStartDate: {
      type: Date,
      default: () => {
        const now = new Date();
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - dayOfWeek;
        return new Date(now.setDate(diff));
      }
    },
    tasksTarget: {
      type: Number,
      default: 5
    },
    tasksCompleted: {
      type: Number,
      default: 0
    }
  },
  achievements: [{
    title: String,
    description: String,
    iconUrl: String,
    unlockedAt: {
      type: Date,
      default: Date.now
    },
    category: {
      type: String,
      enum: ['learning', 'project', 'streak', 'skill', 'milestone']
    }
  }],
  totalPoints: {
    type: Number,
    default: 0
  },
  level: {
    type: Number,
    default: 1
  },
  streak: StreakSchema,
  recentActivity: [ActivitySchema],
  statistics: {
    totalHoursLearned: {
      type: Number,
      default: 0
    },
    totalProjectsCompleted: {
      type: Number,
      default: 0
    },
    totalSkillsLearned: {
      type: Number,
      default: 0
    },
    averageSessionTime: {
      type: Number,
      default: 0
    },
    mostActiveDay: String,
    favoriteSkillCategory: String
  }
}, {
  timestamps: true
});

// Indexes
ProgressSchema.index({ userId: 1 });
ProgressSchema.index({ level: 1 });
ProgressSchema.index({ totalPoints: -1 });

// Methods
ProgressSchema.methods.addActivity = function(activityData) {
  this.recentActivity.unshift(activityData);
  
  // Keep only last 50 activities
  if (this.recentActivity.length > 50) {
    this.recentActivity = this.recentActivity.slice(0, 50);
  }
  
  // Update streak
  this.updateStreak();
  
  // Add points based on activity type
  const pointsMap = {
    'skill_added': 10,
    'resource_completed': 25,
    'project_started': 50,
    'project_completed': 100,
    'milestone_reached': 75,
    'roadmap_updated': 20
  };
  
  const points = pointsMap[activityData.type] || 5;
  this.addPoints(points);
  
  return this.save();
};

ProgressSchema.methods.updateStreak = function() {
  const today = new Date();
  const lastActivity = this.streak.lastActivityDate;
  const daysDiff = Math.floor((today - lastActivity) / (1000 * 60 * 60 * 24));
  
  if (daysDiff === 0) {
    // Same day, no change
    return;
  } else if (daysDiff === 1) {
    // Consecutive day, increment streak
    this.streak.current += 1;
    this.streak.longest = Math.max(this.streak.longest, this.streak.current);
  } else {
    // Streak broken
    this.streak.current = 1;
  }
  
  this.streak.lastActivityDate = today;
};

ProgressSchema.methods.addPoints = function(points) {
  this.totalPoints += points;
  
  // Level up calculation (every 1000 points = 1 level)
  const newLevel = Math.floor(this.totalPoints / 1000) + 1;
  if (newLevel > this.level) {
    this.level = newLevel;
    this.addActivity({
      type: 'milestone_reached',
      description: `Reached level ${newLevel}!`,
      metadata: { pointsEarned: points }
    });
  }
};

ProgressSchema.methods.updateWeeklyProgress = function(hoursSpent, tasksCompleted = 0) {
  const now = new Date();
  const weekStart = this.weeklyGoals.weekStartDate;
  const daysDiff = Math.floor((now - weekStart) / (1000 * 60 * 60 * 24));
  
  // Reset weekly goals if it's a new week
  if (daysDiff >= 7) {
    this.weeklyGoals.hoursCompleted = 0;
    this.weeklyGoals.tasksCompleted = 0;
    this.weeklyGoals.weekStartDate = new Date();
  }
  
  this.weeklyGoals.hoursCompleted += hoursSpent;
  this.weeklyGoals.tasksCompleted += tasksCompleted;
  
  return this.save();
};

module.exports = mongoose.model('Progress', ProgressSchema);