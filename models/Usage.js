const mongoose = require('mongoose')

const UsageSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  month: {
    type: String,
    required: true, // "2026-06"
  },
  mentorChats: { type: Number, default: 0 },
  careerPathsGenerated: { type: Number, default: 0 },
  roadmapsGenerated: { type: Number, default: 0 },
  resumesParsed: { type: Number, default: 0 },
  projectsSuggested: { type: Number, default: 0 },
}, {
  timestamps: true,
})

UsageSchema.index({ userId: 1, month: 1 }, { unique: true })

UsageSchema.statics.increment = async function (userId, field) {
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return this.findOneAndUpdate(
    { userId, month },
    { $inc: { [field]: 1 } },
    { upsert: true, new: true }
  )
}

UsageSchema.statics.getUsage = async function (userId) {
  const now = new Date()
  const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  const doc = await this.findOne({ userId, month })
  return doc || { mentorChats: 0, careerPathsGenerated: 0, roadmapsGenerated: 0, resumesParsed: 0, projectsSuggested: 0 }
}

module.exports = mongoose.model('Usage', UsageSchema)
