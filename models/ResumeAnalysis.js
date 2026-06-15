const mongoose = require('mongoose');

const ResumeAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  fileName: {
    type: String
  },
  extracted: {
    skills: [String],
    skillProficiencies: { type: Object },
    tools: [String],
    roles: [String],
    experienceYears: Number,
    industries: [String],
    education: [String],
    certifications: [String],
    languages: [String],
    summary: String
  }
}, {
  timestamps: true
});

ResumeAnalysisSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('ResumeAnalysis', ResumeAnalysisSchema);
