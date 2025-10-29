const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  firebaseUid: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    trim: true,
    default: ''
  },
  subscriptionPlan: {
    type: String,
    enum: ['free', 'pro', 'enterprise'],
    default: 'free'
  },
  preferences: {
    industries: [String],
    careerGoals: [String],
    learningStyle: {
      type: String,
      enum: ['visual', 'auditory', 'kinesthetic', 'reading'],
      default: 'visual'
    },
    availableHoursPerWeek: {
      type: Number,
      min: 1,
      max: 168,
      default: 10
    }
  },
  profile: {
    avatar: String,
    bio: String,
    location: String,
    linkedinUrl: String,
    githubUrl: String,
    portfolioUrl: String
  },
  onboardingCompleted: {
    type: Boolean,
    default: false
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ subscriptionPlan: 1 });

// Methods
UserSchema.methods.updateLastActive = function() {
  this.lastActive = new Date();
  return this.save();
};

UserSchema.methods.toPublicJSON = function() {
  const user = this.toObject();
  delete user.firebaseUid;
  return user;
};

module.exports = mongoose.model('User', UserSchema);