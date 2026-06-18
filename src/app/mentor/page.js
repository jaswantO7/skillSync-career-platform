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
  Clock,
  Zap
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/context/ProgressContext'
import Sidebar from '@/components/dashboard/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import UsageBar from '@/components/plans/UsageBar'
import { aiAPI, authAPI } from '@/lib/api'
import { formatDateTime } from '@/lib/utils'
import toast from 'react-hot-toast'
import Link from 'next/link'

const MentorPage = () => {
  const [messages, setMessages] = useState([])
  const [inputMessage, setInputMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [loading, setLoading] = useState(true)
  const [usage, setUsage] = useState(null)
  const messagesEndRef = useRef(null)
  const fetchedRef = useRef(false)
  const { user, userProfile, getAuthToken, loading: authLoading } = useAuth()
  const { stats, roadmap } = useProgress()

  const quickPrompts = [
    { icon: Target, title: 'Career Goals', message: 'Help me define clear career goals for the next 2 years' },
    { icon: TrendingUp, title: 'Skill Gap Analysis', message: 'What skills should I focus on to advance in my career?' },
    { icon: Lightbulb, title: 'Interview Prep', message: 'Give me tips for preparing for technical interviews' },
    { icon: MessageCircle, title: 'Networking', message: 'How can I build a stronger professional network?' },
  ]

  const chatLimit = userProfile?.subscriptionPlan === 'free' ? 5 : Infinity
  const hasReachedLimit = (usage?.mentorChats || 0) >= chatLimit

  useEffect(() => {
    if (authLoading || !user || fetchedRef.current) return
    fetchedRef.current = true
    initializeChat()
    fetchUsage()
    scrollToBottom()
  }, [user, authLoading])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const initializeChat = async () => {
    try {
      setLoading(true)
      const res = await aiAPI.getChatHistory()
      const history = res.data?.data?.messages || []

      if (history.length > 0) {
        const formatted = history.map((m, i) => ({
          id: m._id || Date.now() + i,
          type: m.role === 'assistant' ? 'bot' : 'user',
          content: m.content,
          timestamp: m.timestamp || new Date().toISOString(),
        }))
        setMessages(formatted)
      } else {
        setMessages([{
          id: Date.now(),
          type: 'bot',
          content: `Hi ${userProfile?.name || user?.displayName || 'there'}! 👋 I'm Alex, your AI career mentor. I'm here to help you navigate your professional journey, develop new skills, and achieve your career goals.\n\nI can help you with:\n• Career planning and goal setting\n• Skill development recommendations\n• Interview preparation\n• Networking strategies\n• Learning path guidance\n\nWhat would you like to discuss today?`,
          timestamp: new Date().toISOString()
        }])
      }
    } catch (error) {
      console.error('Failed to load chat history:', error)
      setMessages([{
        id: Date.now(),
        type: 'bot',
        content: `Hi ${userProfile?.name || user?.displayName || 'there'}! 👋 I'm Alex, your AI career mentor.`,
        timestamp: new Date().toISOString()
      }])
    } finally {
      setLoading(false)
    }
  }

  const fetchUsage = async () => {
    try {
      const res = await authAPI.getUsage()
      if (res.data?.success) {
        setUsage(res.data.data)
      }
    } catch {
      // non-critical
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const handleSendMessage = async (messageText = inputMessage) => {
    if (!messageText.trim() || isTyping) return

    const chatLimit = userProfile?.subscriptionPlan === 'free' ? 5 : Infinity
    const chatsUsed = usage?.mentorChats || 0
    if (chatsUsed >= chatLimit) {
      toast.error('You have reached your monthly chat limit. Upgrade to Pro for unlimited chats.')
      return
    }

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
      const context = {}
      if (userProfile?.currentRole) context.currentRole = userProfile.currentRole
      if (userProfile?.preferences?.careerGoals?.length) context.goals = userProfile.preferences.careerGoals
      if (roadmap?.title) context.roadmapTitle = roadmap.title

      try {
        const response = await aiAPI.mentorChat({ message: messageText.trim(), context })
        if (response.data?.success && response.data?.data?.response) {
          setMessages(prev => [...prev, {
            id: Date.now() + 1,
            type: 'bot',
            content: response.data.data.response,
            timestamp: response.data.data.timestamp || new Date().toISOString()
          }])
          setIsTyping(false)
          fetchUsage()
          return
        }
      } catch (e) {
        console.warn('AI mentor unavailable, using fallback response:', e.message)
      }

      const fallbackResponses = [
        "That's a great question! Based on your current experience and goals, I'd recommend focusing on...",
        "I understand your concern. Here's what I suggest based on industry trends and your profile...",
        "Excellent point! Let me share some strategies that have worked well for professionals in similar situations...",
        "That's definitely achievable! Here's a step-by-step approach you can take...",
        "I'm glad you asked about this. It's a common challenge, and here's how you can tackle it..."
      ]
      const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)]
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'bot',
        content: `${randomResponse}\n\n1. Start by identifying your core strengths and areas for improvement\n2. Set specific, measurable goals with clear timelines\n3. Create a learning plan that aligns with your career objectives\n4. Network with professionals in your target field\n5. Practice regularly and seek feedback\n\nWould you like me to elaborate on any of these points or help you with something specific?`,
        timestamp: new Date().toISOString()
      }])
      setIsTyping(false)
      fetchUsage()

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
    if (e.key === 'Enter' && !e.shiftKey && !hasReachedLimit) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-surface-50 dark:bg-surface-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-8 h-8 mx-auto mb-4 text-emerald-600"></div>
            <p className="text-surface-500 dark:text-surface-400">Loading mentor chat...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 flex overflow-hidden p-3 sm:p-4 pt-16 lg:pt-0">
          <div className="flex-1 flex flex-col">
            {userProfile?.subscriptionPlan === 'free' && (
              <div className="bg-gradient-to-r from-emerald-600 to-violet-600 px-4 py-3">
                <div className="flex items-start sm:items-center justify-between text-white text-sm mb-2 gap-2">
                  <div className="flex items-center space-x-2">
                    <Zap size={16} className="fill-yellow-300 text-yellow-300" />
                    <span>Free plan: {usage?.mentorChats || 0}/5 mentor chats used this month</span>
                  </div>
                  <Link href="/plans" className="text-xs font-medium underline underline-offset-2 hover:no-underline shrink-0 ml-2">
                    Upgrade to Pro
                  </Link>
                </div>
                <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all"
                    style={{ width: `${Math.min(((usage?.mentorChats || 0) / 5) * 100, 100)}%` }}
                  />
                </div>
              </div>
            )}

            <div className="glass border-b border-surface-200/50 dark:border-surface-700/30 p-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-violet-600 rounded-full flex items-center justify-center shadow-md">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white">
                    Alex - AI Career Mentor
                  </h2>
                  <p className="text-sm text-surface-500 dark:text-surface-400">
                    Your personal career growth companion
                  </p>
                </div>
                <div className="flex-1"></div>
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1.5 text-xs text-surface-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
                    <span>Online</span>
                  </div>
                  <span className="text-xs text-surface-400">·</span>
                  <span className="text-xs text-surface-400">Saved</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface-50/50 dark:bg-surface-950/50">
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
                    <div className={`flex items-start space-x-3 max-w-[85%] sm:max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 shadow-sm ${
                        message.type === 'user'
                          ? 'bg-emerald-600'
                          : 'bg-gradient-to-br from-emerald-500 to-violet-600'
                      }`}>
                        {message.type === 'user' ? (
                          <User className="w-5 h-5 text-white" />
                        ) : (
                          <Bot className="w-5 h-5 text-white" />
                        )}
                      </div>

                      <div className={`rounded-2xl px-4 py-3 ${
                        message.type === 'user'
                          ? 'bg-emerald-600 text-white'
                          : 'glass-card'
                      }`}>
                        <div className="whitespace-pre-wrap text-sm leading-relaxed">
                          {message.content}
                        </div>
                        <div className={`text-xs mt-2 ${
                          message.type === 'user'
                            ? 'text-emerald-100'
                            : 'text-surface-400'
                        }`}>
                          {formatDateTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex justify-start"
                >
                  <div className="flex items-start space-x-3 max-w-3xl">
                    <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-violet-600 rounded-full flex items-center justify-center">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="glass-card">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce delay-100"></div>
                        <div className="w-2 h-2 bg-surface-400 rounded-full animate-bounce delay-200"></div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {messages.length <= 1 && (
              <div className="p-4 border-t border-surface-200/50 dark:border-surface-700/30 bg-white/50 dark:bg-surface-900/50">
                <p className="text-sm text-surface-500 dark:text-surface-400 mb-3">
                  Quick questions to get started:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {quickPrompts.map((prompt, index) => {
                    const Icon = prompt.icon
                    return (
                      <button
                        key={index}
                        onClick={() => handleQuickPrompt(prompt)}
                        className="flex items-center space-x-2 p-3 bg-surface-100 dark:bg-surface-800/50 hover:bg-surface-200 dark:hover:bg-surface-700/50 rounded-xl text-left transition-all"
                        disabled={isTyping || hasReachedLimit}
                      >
                        <Icon className="w-4 h-4 text-emerald-600" />
                        <span className="text-sm text-surface-700 dark:text-surface-300">
                          {prompt.title}
                        </span>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {hasReachedLimit ? (
              <div className="glass border-t border-surface-200/50 dark:border-surface-700/30 p-6 text-center">
                <Zap size={24} className="text-yellow-500 mx-auto mb-2" />
                <p className="text-surface-900 dark:text-white font-medium mb-1">Monthly chat limit reached</p>
                <p className="text-sm text-surface-500 dark:text-surface-400 mb-4">Upgrade to Pro for unlimited mentor conversations.</p>
                <Link href="/plans">
                  <Button size="sm">Upgrade to Pro</Button>
                </Link>
              </div>
            ) : (
            <div className="glass border-t border-surface-200/50 dark:border-surface-700/30 p-4">
              <div className="flex items-end space-x-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Ask me anything about your career, skills, or professional growth..."
                    rows={1}
                    className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-600/50 bg-white dark:bg-surface-800/60 text-surface-900 dark:text-surface-100 placeholder-surface-400 dark:placeholder-surface-500 focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500/50 transition-all duration-200 resize-none backdrop-blur-sm"
                    style={{ minHeight: '48px', maxHeight: '120px' }}
                    disabled={isTyping || hasReachedLimit}
                  />
                </div>
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping || hasReachedLimit}
                  className="px-4 py-3"
                >
                  <Send size={20} />
                </Button>
              </div>
              <p className="text-xs text-surface-500 dark:text-surface-400 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
            )}
          </div>

          <div className="w-80 bg-white/50 dark:bg-surface-900/50 backdrop-blur-xl border-l border-surface-200/50 dark:border-surface-700/30 p-4 overflow-y-auto hidden lg:block">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Sparkles className="w-5 h-5 mr-2 text-emerald-600" />
                    About Your Mentor
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-surface-500 dark:text-surface-400 space-y-2">
                    <p><strong className="text-surface-700 dark:text-surface-300">Alex</strong> is your AI career mentor with expertise in:</p>
                    <ul className="list-disc list-inside space-y-1 text-xs">
                      <li>Career planning & goal setting</li>
                      <li>Skill development strategies</li>
                      <li>Interview preparation</li>
                      <li>Professional networking</li>
                      <li>Industry insights & trends</li>
                    </ul>
                    <p className="text-xs pt-2">Available 24/7 to support your career growth journey.</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                    Your Progress
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-surface-500 dark:text-surface-400">Level</span>
                      <span className="font-semibold text-surface-900 dark:text-white">{stats?.level || 1}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-surface-500 dark:text-surface-400">Total Points</span>
                      <span className="font-semibold text-surface-900 dark:text-white">{stats?.totalPoints || 0}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-surface-500 dark:text-surface-400">Current Streak</span>
                      <span className="font-semibold text-surface-900 dark:text-white">{stats?.streak?.current || 0} days</span>
                    </div>
                    <div className="pt-3 border-t border-surface-200 dark:border-surface-700">
                      <p className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-2">Monthly Usage</p>
                      <UsageBar
                        label="Mentor Chat"
                        used={usage?.mentorChats || 0}
                        limit={userProfile?.subscriptionPlan === 'free' ? 5 : Infinity}
                        icon={MessageCircle}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {roadmap && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="w-5 h-5 mr-2 text-emerald-600" />
                      Current Focus
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm">
                      <p className="font-medium text-surface-900 dark:text-white mb-1">{roadmap.title}</p>
                      <p className="text-surface-500 dark:text-surface-400 text-xs">Target: {roadmap.targetRole}</p>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Lightbulb className="w-5 h-5 mr-2 text-emerald-600" />
                    Pro Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-xs text-surface-500 dark:text-surface-400">
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