'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Send, 
  Bot, 
  User, 
  Lightbulb, 
  Target, 
  TrendingUp, 
  MessageCircle,
  Sparkles,
  Clock
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/context/ProgressContext'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { aiAPI } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'

const MentorPage = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const messagesEndRef = useRef(null)
  const { user, userProfile, getAuthToken } = useAuth()
  const { stats, roadmap } = useProgress()

  const quickPrompts = [
    {
      icon: Target,
      title: 'Career Goals',
      message: 'Help me define clear career goals for the next 2 years'
    },
    {
      icon: TrendingUp,
      title: 'Skill Gap Analysis',
      message: 'What skills should I focus on to advance in my career?'
    },
    {
      icon: Lightbulb,
      title: 'Interview Prep',
      message: 'Give me tips for preparing for technical interviews'
    },
    {
      icon: MessageCircle,
      title: 'Networking',
      message: 'How can I build a stronger professional network?'
    }
  ]

  useEffect(() => {
    initializeChat()
    scrollToBottom()
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeChat = async () => {
    try {
      setLoading(true)
      
      // Load previous chat history or start with welcome message
      const welcomeMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Hi ${userProfile?.name || user?.displayName || 'there'}! 👋 I'm Alex, your AI career mentor. I'm here to help you navigate your professional journey, develop new skills, and achieve your career goals.\n\nI can help you with:\n• Career planning and goal setting\n• Skill development recommendations\n• Interview preparation\n• Networking strategies\n• Learning path guidance\n\nWhat would you like to discuss today?`,
        timestamp: new Date().toISOString()
      }
      
      setMessages([welcomeMessage])
    } catch (error) {
      console.error('Failed to initialize chat:', error)
      toast.error('Failed to load chat history')
    } finally {
      setLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isTyping) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: messageText.trim(),
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage('')
    setIsTyping(true)

    try {
      const token = await getAuthToken()
      
      // Prepare context for the AI mentor
      const context = {
        currentRole: userProfile?.role || 'Professional',
        experienceYears: stats?.experienceYears || 0,
        skills: stats?.skills || [],
        goals: userProfile?.careerGoals || [],
        roadmapTitle: roadmap?.title
      }

      // Mock AI response - replace with actual API call
      setTimeout(() => {
        const responses = [
          "That's a great question! Based on your current experience and goals, I'd recommend focusing on...",
          "I understand your concern. Here's what I suggest based on industry trends and your profile...",
          "Excellent point! Let me share some strategies that have worked well for professionals in similar situations...",
          "That's definitely achievable! Here's a step-by-step approach you can take...",
          "I'm glad you asked about this. It's a common challenge, and here's how you can tackle it..."
        ]
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)]
        
        const botMessage = {
          id: Date.now() + 1,
          type: 'bot',
          content: `${randomResponse}\n\n1. Start by identifying your core strengths and areas for improvement\n2. Set specific, measurable goals with clear timelines\n3. Create a learning plan that aligns with your career objectives\n4. Network with professionals in your target field\n5. Practice regularly and seek feedback\n\nWould you like me to elaborate on any of these points or help you with something specific?`,
          timestamp: new Date().toISOString()
        }
        
        setMessages(prev => [...prev, botMessage])
        setIsTyping(false)
      }, 2000)

    } catch (error) {
      console.error('Failed to send message:', error)
      toast.error('Failed to send message')
      setIsTyping(false)
    }
  }

  const handleQuickPrompt = (prompt) => {
    handleSendMessage(prompt.message)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading mentor chat...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 flex overflow-hidden">
          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Alex - AI Career Mentor
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Your personal career growth companion
                  </p>
                </div>
                <div className="flex-1"></div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm text-gray-600 dark:text-gray-400">Online</span>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <AnimatePresence>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`flex items-start space-x-3 max-w-3xl ${
                      message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}>
                      {/* Avatar */}
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.type === 'user' 
                          ? 'bg-primary-600' 
                          : 'bg-gradient-to-r from-primary-600 to-secondary-600'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <Bot className="w-5 h-5 text-white" />
                        )}
                      </div>

                      {/* Message Bubble */}
                      <div className={`rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-2 ${
                          message.type === 'user' 
                            ? 'text-primary-100' 
                            : 'text-gray-500 dark:text-gray-400'
                        }`}>
                          {formatDateTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {/* Typing Indicator */}
              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="w-8 h-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl px-4 py-3">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts */}
            {messages.length <= 1 && (
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                  Quick questions to get started:
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {quickPrompts.map((prompt, index) => {
                    const Icon = prompt.icon
                    return (
                      <button
                        key={index}
                        onClick={() => handleQuickPrompt(prompt)}
                        className="flex items-center space-x-2 p-3 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-left transition-colors"
                        disabled={isTyping}
                      >
                        <Icon className="w-4 h-4 text-primary-600" />
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {prompt.title}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Message Input */}
            <div className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your career, skills, or professional growth..."
                    rows={1}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200 resize-none"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                    disabled={isTyping}
                  />
                </div>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                  className="px-4 py-3"
                >
                  <Send size={20} />
                </Button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 p-4 overflow-y-auto">
            <div className="space-y-6">
              {/* Mentor Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-primary-600" />
                    About Your Mentor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
                    <p>
                      <strong>Alex</strong> is your AI career mentor with expertise in:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Career planning & goal setting</li>
                      <li>Skill development strategies</li>
                      <li>Interview preparation</li>
                      <li>Professional networking</li>
                      <li>Industry insights & trends</li>
                    </ul>
                    <p className="text-xs pt-2">
                      Available 24/7 to support your career growth journey.
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Your Progress */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Level</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats?.level || 1}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Total Points</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats?.totalPoints || 0}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Current Streak</span>
                      <span className="font-semibold text-gray-900 dark:text-white">
                        {stats?.streak?.current || 0} days
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Focus */}
              {roadmap && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-primary-600" />
                      Current Focus
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p className="font-medium text-gray-900 dark:text-white mb-1">
                        {roadmap.title}
                      </p>
                      <p className="text-gray-600 dark:text-gray-400 text-xs">
                        Target: {roadmap.targetRole}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-primary-600" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs text-gray-600 dark:text-gray-400">
                    <p>💡 Be specific about your goals and challenges</p>
                    <p>🎯 Ask for actionable advice and next steps</p>
                    <p>📈 Share your progress and celebrate wins</p>
                    <p>🤝 Don't hesitate to ask follow-up questions</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default MentorPage