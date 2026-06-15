const mongoose = require('mongoose');

const SkillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['technical', 'soft', 'tool', 'framework', 'language', 'domain', 'business', 'creative', 'leadership', 'analytical', 'other']
  },
  proficiency: {
    type: Number,
    min: 1,
    max: 5,
    default: 1
  },
  verified: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    enum: ['resume', 'manual', 'assessment', 'project'],
    default: 'manual'
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

const SkillGraphSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  skills: [SkillSchema],
  currentRole: {
    type: String,
    trim: true
  },
  experienceYears: {
    type: Number,
    min: 0,
    max: 50,
    default: 0
  },
  industries: [String],
  tools: [String],
  certifications: [{
    name: String,
    issuer: String,
    dateObtained: Date,
    expiryDate: Date,
    credentialUrl: String
  }],
  lastAnalyzed: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes
SkillGraphSchema.index({ userId: 1 });
SkillGraphSchema.index({ 'skills.category': 1 });
SkillGraphSchema.index({ currentRole: 1 });

// Methods
SkillGraphSchema.methods.addSkill = function(skillData) {
  const existingSkill = this.skills.find(s => s.name.toLowerCase() === skillData.name.toLowerCase());
  
  if (existingSkill) {
    existingSkill.proficiency = Math.max(existingSkill.proficiency, skillData.proficiency || 1);
    existingSkill.lastUpdated = new Date();
  } else {
    this.skills.push(skillData);
  }
  
  this.lastAnalyzed = new Date();
  return this.save();
};

SkillGraphSchema.methods.getSkillsByCategory = function(category) {
  return this.skills.filter(skill => skill.category === category);
};

SkillGraphSchema.methods.getTopSkills = function(limit = 10) {
  return this.skills
    .sort((a, b) => b.proficiency - a.proficiency)
    .slice(0, limit);
};

module.exports = mongoose.model('SkillGraph', SkillGraphSchema);