'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Settings,
  Mail,
  Lock,
  BookOpen,
  Globe,
  Github,
  Linkedin,
  MapPin,
  Clock,
  Trophy,
  AlertTriangle,
  Save,
  Trash2,
  Target,
  CheckCircle,
  Shield,
  Bell,
  CreditCard,
  Camera,
  Image,
  Code,
  Plus,
  X
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'
import { authAPI, stripeAPI } from '@/lib/api'

const SettingsPage = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { user, userProfile, updateUserProfile, resetPassword } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const params = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '')
    if (params.get('tab') === 'account') {
      setActiveTab('account')
    }
  }, [])

  const [form, setForm] = useState({
    name: '',
    bio: '',
    location: '',
    role: '',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    learningStyle: 'visual',
    availableHoursPerWeek: 10,
    careerGoals: '',
    industries: '',
    skills: []
  })
  const [skillInput, setSkillInput] = useState('')

  const avatarPresets = [
    { id: 'sunset', gradient: 'from-orange-500 to-pink-500', bg: 'bg-gradient-to-br from-orange-500 to-pink-500' },
    { id: 'ocean', gradient: 'from-cyan-500 to-blue-500', bg: 'bg-gradient-to-br from-cyan-500 to-blue-500' },
    { id: 'forest', gradient: 'from-green-500 to-emerald-500', bg: 'bg-gradient-to-br from-green-500 to-emerald-500' },
    { id: 'lavender', gradient: 'from-purple-500 to-indigo-500', bg: 'bg-gradient-to-br from-purple-500 to-indigo-500' },
    { id: 'ruby', gradient: 'from-red-500 to-rose-500', bg: 'bg-gradient-to-br from-red-500 to-rose-500' },
    { id: 'amber', gradient: 'from-yellow-500 to-orange-500', bg: 'bg-gradient-to-br from-yellow-500 to-orange-500' },
    { id: 'teal', gradient: 'from-teal-500 to-cyan-500', bg: 'bg-gradient-to-br from-teal-500 to-cyan-500' },
    { id: 'violet', gradient: 'from-violet-500 to-purple-500', bg: 'bg-gradient-to-br from-violet-500 to-purple-500' },
  ]

  const bannerPresets = [
    { id: 'corporate', gradient: 'from-emerald-600 via-emerald-500 to-purple-500', bg: 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-purple-500' },
    { id: 'sunset', gradient: 'from-orange-600 via-red-500 to-pink-500', bg: 'bg-gradient-to-r from-orange-600 via-red-500 to-pink-500' },
    { id: 'ocean', gradient: 'from-blue-600 via-cyan-500 to-teal-500', bg: 'bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-500' },
    { id: 'midnight', gradient: 'from-surface-800 via-surface-700 to-indigo-900', bg: 'bg-gradient-to-r from-surface-800 via-surface-700 to-indigo-900' },
    { id: 'aurora', gradient: 'from-green-600 via-emerald-500 to-teal-500', bg: 'bg-gradient-to-r from-green-600 via-emerald-500 to-teal-500' },
    { id: 'royal', gradient: 'from-purple-600 via-violet-500 to-indigo-600', bg: 'bg-gradient-to-r from-purple-600 via-violet-500 to-indigo-600' },
  ]

  const [selectedAvatar, setSelectedAvatar] = useState(userProfile?.profile?.avatar || 'sunset')
  const [selectedBanner, setSelectedBanner] = useState(userProfile?.profile?.banner || 'corporate')
  const [notifications, setNotifications] = useState({
    weeklyProgress: true,
    achievementAlerts: true,
    resourceRecommendations: false,
    careerMilestones: true
  })

  useEffect(() => {
    if (userProfile) {
      setForm({
        name: userProfile.name || '',
        bio: userProfile.profile?.bio || '',
        location: userProfile.profile?.location || '',
        role: userProfile.currentRole || '',
        linkedinUrl: userProfile.profile?.linkedinUrl || '',
        githubUrl: userProfile.profile?.githubUrl || '',
        portfolioUrl: userProfile.profile?.portfolioUrl || '',
        learningStyle: userProfile.preferences?.learningStyle || 'visual',
        availableHoursPerWeek: userProfile.preferences?.availableHoursPerWeek || 10,
        careerGoals: (userProfile.preferences?.careerGoals || []).join(', '),
        industries: (userProfile.preferences?.industries || []).join(', '),
        skills: userProfile.skills || []
      })
      if (userProfile.profile?.avatar) setSelectedAvatar(userProfile.profile.avatar)
      if (userProfile.profile?.banner) setSelectedBanner(userProfile.profile.banner)
      if (userProfile.notifications) setNotifications(userProfile.notifications)
    }
  }, [userProfile])

  const handleChange = (field) => (e) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }))
  }

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      await updateUserProfile({
        name: form.name,
        currentRole: form.role,
        profile: {
          bio: form.bio,
          location: form.location,
          linkedinUrl: form.linkedinUrl,
          githubUrl: form.githubUrl,
          portfolioUrl: form.portfolioUrl,
          avatar: selectedAvatar,
          banner: selectedBanner
        },
        experienceYears: userProfile?.experienceYears || 0,
        skills: form.skills,
        preferences: {
          learningStyle: form.learningStyle,
          availableHoursPerWeek: parseInt(form.availableHoursPerWeek) || 10,
          careerGoals: form.careerGoals.split(',').map(s => s.trim()).filter(Boolean),
          industries: form.industries.split(',').map(s => s.trim()).filter(Boolean)
        },
        notifications
      })
    } finally {
      setSaving(false)
    }
  }

  const handleResetPassword = async () => {
    try {
      await resetPassword(user?.email)
    } catch {
      // error handled by AuthContext
    }
  }

  const handleManageBilling = async () => {
    try {
      const res = await stripeAPI.getPortalLink()
      if (res.data?.url) {
        window.location.href = res.data.url
      }
    } catch (error) {
      toast.error('Failed to open billing portal')
    }
  }

  const handleDeleteAccount = async () => {
    try {
      setDeleting(true)
      await authAPI.deleteAccount()
      toast.success('Account deleted')
      window.location.href = '/auth/signin'
    } catch (error) {
      console.error('Delete account error:', error)
      toast.error('Failed to delete account')
    } finally {
      setDeleting(false)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile Settings', icon: User },
    { id: 'account', label: 'Account Settings', icon: Shield },
  ]

  const generateAvatar = (name) => {
    if (!name) return ''
    const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    const colors = [
      'from-purple-500 to-pink-500',
      'from-blue-500 to-cyan-500',
      'from-green-500 to-emerald-500',
      'from-orange-500 to-red-500',
      'from-indigo-500 to-purple-500'
    ]
    const colorIndex = name.length % colors.length
    return { initials, gradient: colors[colorIndex] }
  }

  const avatar = generateAvatar(userProfile?.name || user?.displayName || 'User')

  return (
    <div className="flex h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-surface-900 dark:via-surface-900 dark:to-indigo-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-2">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            {/* Profile Header Card */}
            <Card className="mb-8 overflow-hidden">
              {/* Banner Preview */}
              <div className={`h-32 ${bannerPresets.find(b => b.id === selectedBanner)?.bg || bannerPresets[0].bg}`} />
              <CardContent className="relative">
                <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-20 sm:-mt-16 space-y-4 sm:space-y-0 sm:space-x-6">
                  {/* Avatar Preview */}
                  <div className="relative">
                    <div className={`w-28 h-28 sm:w-32 sm:h-32 rounded-2xl ${avatarPresets.find(a => a.id === selectedAvatar)?.bg || avatarPresets[0].bg} flex items-center justify-center shadow-xl ring-4 ring-white dark:ring-surface-900 overflow-hidden`}>
                      <span className="text-3xl sm:text-4xl font-bold text-white">{avatar.initials}</span>
                    </div>
                  </div>
                  <div className="text-center sm:text-left pb-2">
                    <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{form.name || 'Your Name'}</h1>
                    <p className="text-surface-600 dark:text-surface-400">{form.role || 'Set your current role'}</p>
                    <div className="flex items-center justify-center sm:justify-start space-x-4 mt-2 text-sm text-surface-500 dark:text-surface-400">
                      {form.location && (
                        <span className="flex items-center space-x-1">
                          <MapPin size={14} />
                          <span>{form.location}</span>
                        </span>
                      )}
                      <span className="flex items-center space-x-1">
                        <Mail size={14} />
                        <span>{user?.email || ''}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Avatar & Banner Presets */}
            <Card className="mb-8">
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                    <Camera className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle>Customize Your Profile</CardTitle>
                    <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                      Choose an avatar and banner style
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Avatar Presets */}
                <div>
                  <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-3">Avatar Style</h4>
                  <div className="flex flex-wrap gap-3">
                    {avatarPresets.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedAvatar(p.id)}
                        className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl ${p.bg} flex items-center justify-center ring-2 transition-all ${
                          selectedAvatar === p.id ? 'ring-emerald-500 scale-110 shadow-lg' : 'ring-transparent hover:scale-110'
                        }`}
                      >
                        <span className="text-white font-bold text-sm">{avatar.initials}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Banner Presets */}
                <div>
                  <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-3">Banner Style</h4>
                  <div className="flex flex-wrap gap-3">
                    {bannerPresets.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => setSelectedBanner(p.id)}
                        className={`h-10 w-28 sm:w-32 rounded-lg ${p.bg} ring-2 transition-all ${
                          selectedBanner === p.id ? 'ring-emerald-500 scale-105 shadow-lg' : 'ring-transparent hover:scale-105'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Tabs */}
            <div className="flex space-x-2 mb-8 overflow-x-auto scrollbar-none flex-nowrap">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2.5 px-4 md:px-5 py-3 rounded-xl text-sm font-medium transition-all shrink-0 ${
                    activeTab === tab.id
                      ? 'glass-card text-emerald-600 dark:text-emerald-400 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/20'
                      : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-300 hover:bg-white/50 dark:hover:bg-surface-800/50'
                  }`}
                >
                  <tab.icon size={18} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              {activeTab === 'profile' && (
                <motion.div
                  key="profile"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl">
                          <User className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div>
                          <CardTitle>Personal Information</CardTitle>
                          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                            Update your personal details and professional information
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-8">
                        {/* Basic Info */}
                        <div>
                          <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-4">Basic Info</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                              label="Full Name"
                              required
                              value={form.name}
                              onChange={handleChange('name')}
                              icon={<User size={16} />}
                            />
                            <Input
                              label="Current Role"
                              value={form.role}
                              onChange={handleChange('role')}
                              icon={<Trophy size={16} />}
                              placeholder="e.g., Senior Software Engineer"
                            />
                          </div>
                          <div className="mt-5">
                            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Bio</label>
                            <textarea
                              value={form.bio}
                              onChange={handleChange('bio')}
                              placeholder="Tell us about yourself — your experience, passion, and what drives you..."
                              rows={3}
                              className="input-field resize-none"
                            />
                          </div>
                        </div>

                        <div className="border-t border-surface-200 dark:border-surface-700" />

                        {/* Location & Preferences */}
                        <div>
                          <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-4">Location & Preferences</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                              label="Location"
                              value={form.location}
                              onChange={handleChange('location')}
                              icon={<MapPin size={16} />}
                              placeholder="City, Country"
                            />
                            <div>
                              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">Learning Style</label>
                              <div className="flex space-x-2">
                                {['visual', 'reading', 'auditory', 'kinesthetic'].map(style => (
                                  <button
                                    key={style}
                                    onClick={() => setForm(prev => ({ ...prev, learningStyle: style }))}
                                    className={`px-3 py-2 rounded-lg text-xs font-medium capitalize transition-all ${
                                      form.learningStyle === style
                                        ? 'bg-emerald-600 text-white shadow-md'
                                        : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600'
                                    }`}
                                  >
                                    {style}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="mt-5">
                            <Input
                              label="Available Hours Per Week"
                              type="number"
                              value={form.availableHoursPerWeek}
                              onChange={handleChange('availableHoursPerWeek')}
                              icon={<Clock size={16} />}
                              helper="How many hours can you dedicate to learning each week?"
                            />
                          </div>
                        </div>

                        <div className="border-t border-surface-200 dark:border-surface-700" />

                        {/* Social & Portfolio */}
                        <div>
                          <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-4">Social & Portfolio</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <Input
                              label="LinkedIn URL"
                              value={form.linkedinUrl}
                              onChange={handleChange('linkedinUrl')}
                              icon={<Linkedin size={16} />}
                              placeholder="https://linkedin.com/in/..."
                            />
                            <Input
                              label="GitHub URL"
                              value={form.githubUrl}
                              onChange={handleChange('githubUrl')}
                              icon={<Github size={16} />}
                              placeholder="https://github.com/..."
                            />
                          </div>
                          <div className="mt-5">
                            <Input
                              label="Portfolio URL"
                              value={form.portfolioUrl}
                              onChange={handleChange('portfolioUrl')}
                              icon={<Globe size={16} />}
                              placeholder="https://yourportfolio.com"
                            />
                          </div>
                        </div>

                        <div className="border-t border-surface-200 dark:border-surface-700" />

                        {/* Career Goals */}
                        <div>
                          <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-4">Career & Industry</h4>
                          <div className="space-y-5">
                            <Input
                              label="Career Goals"
                              value={form.careerGoals}
                              onChange={handleChange('careerGoals')}
                              icon={<Target size={16} />}
                              placeholder="e.g., Senior Developer, Tech Lead"
                              helper="Separate multiple goals with commas"
                            />
                            <Input
                              label="Industries of Interest"
                              value={form.industries}
                              onChange={handleChange('industries')}
                              placeholder="e.g., Fintech, Healthcare, E-commerce"
                              helper="Separate multiple industries with commas"
                            />
                          </div>
                        </div>

                        <div className="border-t border-surface-200 dark:border-surface-700" />

                        {/* Skills */}
                        <div>
                          <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-4">Skills</h4>
                          <div>
                            <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                              {form.skills.map((s, i) => (
                                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-sm rounded-lg">
                                  <Code size={12} />
                                  {s}
                                  <button type="button" onClick={() => setForm(prev => ({ ...prev, skills: prev.skills.filter((_, j) => j !== i) }))} className="hover:text-red-500 ml-0.5">
                                    <X size={12} />
                                  </button>
                                </span>
                              ))}
                            </div>
                            <div className="flex gap-2">
                              <Input
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyDown={(e) => {
                                  if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
                                    e.preventDefault()
                                    if (!form.skills.includes(skillInput.trim())) {
                                      setForm(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }))
                                    }
                                    setSkillInput('')
                                  }
                                }}
                                placeholder="Type a skill and press Enter"
                                className="flex-1"
                                icon={<Plus size={16} />}
                              />
                              <Button size="sm" variant="outline" type="button" onClick={() => {
                                if (skillInput.trim() && !form.skills.includes(skillInput.trim())) {
                                  setForm(prev => ({ ...prev, skills: [...prev.skills, skillInput.trim()] }))
                                  setSkillInput('')
                                }
                              }}>
                                Add
                              </Button>
                            </div>
                          </div>
                        </div>

                        {/* Save Button */}
                        <div className="border-t border-surface-200 dark:border-surface-700 pt-6">
                          <div className="flex items-center justify-between">
                            <p className="text-sm text-surface-500 dark:text-surface-400">
                              Your changes will be saved to your profile
                            </p>
                            <Button
                              onClick={handleSaveProfile}
                              loading={saving}
                              icon={<Save size={16} />}
                            >
                              Save Changes
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'account' && (
                <motion.div
                  key="account"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  {/* Account Details */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                          <Shield className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle>Account Details</CardTitle>
                          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                            Your account information and security settings
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {/* Email */}
                        <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                          <div className="flex items-center space-x-4">
                            <div className="p-2.5 bg-white dark:bg-surface-700 rounded-xl shadow-sm">
                              <Mail className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-surface-900 dark:text-white">Email Address</p>
                              <p className="text-sm text-surface-500 dark:text-surface-400">{user?.email || 'Not set'}</p>
                            </div>
                          </div>
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        </div>

                        {/* Plan */}
                        <div className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                          <div className="flex items-center space-x-4">
                            <div className="p-2.5 bg-white dark:bg-surface-700 rounded-xl shadow-sm">
                              <CreditCard className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                            </div>
                            <div>
                              <p className="text-sm font-medium text-surface-900 dark:text-white">Subscription Plan</p>
                              <p className="text-sm text-surface-500 dark:text-surface-400 capitalize">{userProfile?.subscriptionPlan || 'Free'}</p>
                            </div>
                          </div>
                          {userProfile?.subscriptionPlan === 'free' ? (
                            <button
                              type="button"
                              onClick={() => router.push('/plans')}
                              className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-full hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors cursor-pointer"
                            >
                              Upgrade
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={handleManageBilling}
                              className="px-3 py-1 bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 text-xs font-medium rounded-full hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors cursor-pointer"
                            >
                              Manage Billing
                            </button>
                          )}
                        </div>

                        {/* Password Reset */}
                        <div className="p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="p-2.5 bg-white dark:bg-surface-700 rounded-xl shadow-sm">
                                <Lock className="w-5 h-5 text-surface-600 dark:text-surface-400" />
                              </div>
                              <div>
                                <p className="text-sm font-medium text-surface-900 dark:text-white">Password</p>
                                <p className="text-sm text-surface-500 dark:text-surface-400">Reset your password to keep your account secure</p>
                              </div>
                            </div>
                            <Button
                              variant="secondary"
                              size="sm"
                              onClick={handleResetPassword}
                            >
                              Reset
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Notification Preferences */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-xl">
                          <Bell className="w-5 h-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <CardTitle>Notifications</CardTitle>
                          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                            Manage your notification preferences
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {[
                          { key: 'weeklyProgress', label: 'Weekly Progress Reports', desc: 'Get a summary of your learning progress every week' },
                          { key: 'achievementAlerts', label: 'Achievement Alerts', desc: 'Notifications when you unlock new achievements' },
                          { key: 'resourceRecommendations', label: 'Resource Recommendations', desc: 'Get notified about new learning resources' },
                          { key: 'careerMilestones', label: 'Career Milestones', desc: 'Updates when you reach career milestones' },
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                            <div>
                              <p className="text-sm font-medium text-surface-900 dark:text-white">{item.label}</p>
                              <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{item.desc}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => setNotifications(prev => ({ ...prev, [item.key]: !prev[item.key] }))}
                              className={`relative w-11 h-6 rounded-full transition-all cursor-pointer ${
                                notifications[item.key] ? 'bg-emerald-600' : 'bg-surface-300 dark:bg-surface-600'
                              }`}
                            >
                              <motion.div
                                animate={{ x: notifications[item.key] ? 22 : 2 }}
                                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                      <div className="mt-6 flex justify-end">
                        <Button
                          onClick={handleSaveProfile}
                          loading={saving}
                          size="sm"
                          icon={<Save size={14} />}
                        >
                          Save Notification Settings
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Danger Zone */}
                  <Card className="border-2 border-red-200 dark:border-red-900/50 overflow-hidden">
                    <div className="h-1.5 bg-gradient-to-r from-red-500 to-red-600" />
                    <CardHeader>
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-xl">
                          <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div>
                          <CardTitle className="text-red-600 dark:text-red-400">Danger Zone</CardTitle>
                          <p className="text-sm text-surface-500 dark:text-surface-400 mt-0.5">
                            Irreversible actions for your account
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between p-4 bg-red-50 dark:bg-red-900/20 rounded-xl">
                        <div className="flex items-center space-x-4">
                          <div className="p-2.5 glass-card rounded-xl shadow-sm">
                            <Trash2 className="w-5 h-5 text-red-500" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-surface-900 dark:text-white">Delete Account</p>
                            <p className="text-sm text-surface-500 dark:text-surface-400">
                              Permanently delete your account and all data
                            </p>
                          </div>
                        </div>
                        {!showDeleteConfirm ? (
                          <Button
                            variant="danger"
                            size="sm"
                            icon={<Trash2 size={14} />}
                            onClick={() => setShowDeleteConfirm(true)}
                          >
                            Delete
                          </Button>
                        ) : null}
                      </div>

                      <AnimatePresence>
                        {showDeleteConfirm && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 rounded-xl border border-red-200 dark:border-red-800"
                          >
                            <div className="flex items-start space-x-3 mb-4">
                              <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
                              <p className="text-sm text-red-700 dark:text-red-300">
                                This will permanently delete your account and all associated data including your progress, roadmaps, and skill history. <strong>This action cannot be undone.</strong>
                              </p>
                            </div>
                            <div className="flex space-x-3">
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={handleDeleteAccount}
                                loading={deleting}
                              >
                                Yes, Delete My Account
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => setShowDeleteConfirm(false)}
                              >
                                Cancel
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default SettingsPage
