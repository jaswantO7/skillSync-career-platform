const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ['user', 'assistant', 'system'],
    required: true,
  },
  content: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
})

const chatSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  messages: [messageSchema],
}, {
  timestamps: true,
})

chatSchema.statics.getOrCreate = async function (userId) {
  let chat = await this.findOne({ userId })
  if (!chat) {
    chat = await this.create({ userId, messages: [] })
  }
  return chat
}

chatSchema.statics.addMessage = async function (userId, role, content) {
  const chat = await this.getOrCreate(userId)
  chat.messages.push({ role, content })
  if (chat.messages.length > 200) {
    chat.messages = chat.messages.slice(-200)
  }
  await chat.save()
  return chat
}

module.exports = mongoose.model('Chat', chatSchema)
