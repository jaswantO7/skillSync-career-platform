const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    firebaseUid: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    currentRole: {
      type: String,
      trim: true,
    },
    skills: [String],
    experienceYears: {
      type: Number,
      default: 0,
    },
    userType: {
      type: String,
      enum: ["learner", "mentor", "admin"],
      default: "learner",
    },
    role: {
      type: String,
      trim: true,
      enum: ["user", "admin"],
      default: "user",
    },
    subscriptionPlan: {
      type: String,
      enum: ["free", "pro", "enterprise"],
      default: "free",
    },
    stripeCustomerId: {
      type: String,
      trim: true,
    },
    selectedCareerPath: {
      targetRole: String,
      requiredSkills: [String],
      currentRole: String,
      timeToAchieve: String,
      difficulty: String
    },
    preferences: {
      industries: [String],
      careerGoals: [String],
      learningStyle: {
        type: String,
        enum: ["visual", "auditory", "kinesthetic", "reading"],
        default: "visual",
      },
      availableHoursPerWeek: {
        type: Number,
        min: 1,
        max: 168,
        default: 10,
      },
    },
    notifications: {
      weeklyProgress: { type: Boolean, default: true },
      achievementAlerts: { type: Boolean, default: true },
      resourceRecommendations: { type: Boolean, default: false },
      careerMilestones: { type: Boolean, default: true },
    },
    profile: {
      avatar: String,
      banner: String,
      bio: String,
      location: String,
      linkedinUrl: String,
      githubUrl: String,
      portfolioUrl: String,
    },
    onboardingCompleted: {
      type: Boolean,
      default: false,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for performance
UserSchema.index({ email: 1 });
UserSchema.index({ firebaseUid: 1 });
UserSchema.index({ subscriptionPlan: 1 });

// Methods
UserSchema.methods.updateLastActive = function () {
  this.lastActive = new Date();
  return this.save();
};

UserSchema.methods.toPublicJSON = function () {
  const user = this.toObject();
  delete user.firebaseUid;
  return user;
};

module.exports = mongoose.model("User", UserSchema);
