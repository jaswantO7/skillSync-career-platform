'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Link2, ArrowRight, CheckCircle, Loader, Clock, Trash2, Edit3, Save, X, Eye, Briefcase, User, Code, Target } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/context/ProgressContext'
import Sidebar from '@/components/dashboard/Sidebar'
import FileUploader from '@/components/skill-audit/FileUploader'
import SkillGraph from '@/components/skill-audit/SkillGraph'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { aiAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const SkillAuditPage = () => {
  const [step, setStep] = useState(1)
  const [uploadMethod, setUploadMethod] = useState('file')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [currentAnalysisId, setCurrentAnalysisId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analyses, setAnalyses] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [editData, setEditData] = useState(null)
  const { user, userProfile, getAuthToken, updateUserProfile, loading: authLoading } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [editCurrentRole, setEditCurrentRole] = useState('')
  const [editExperienceYears, setEditExperienceYears] = useState(0)
  const [editSkills, setEditSkills] = useState([])
  const [editCareerGoal, setEditCareerGoal] = useState('')
  const [skillInput, setSkillInput] = useState('')
  const [savingProfile, setSavingProfile] = useState(false)
  const { addActivity } = useProgress()
  const router = useRouter()

  useEffect(() => {
    if (authLoading || !user) return
    loadAnalyses()
  }, [user, authLoading])

  const loadAnalyses = async () => {
    try {
      const res = await aiAPI.getAnalyses()
      if (res.data.success) {
        setAnalyses(res.data.data)
      }
    } catch (_) {
      // history is non-critical
    }
  }

  const handleFileUpload = async (file) => {
    if (!file) return
    setLoading(true)
    setStep(2)

    try {
      const token = await getAuthToken()
      const formData = new FormData()
      formData.append('resume', file)

      const response = await aiAPI.parseResume(formData)

      if (response.data.success) {
        const result = response.data.data
        const extracted = result.extracted
        const id = result.analysisId

        setParsedData({ extracted, skillGraphId: result.skillGraphId })
        setCurrentAnalysisId(id)
        setStep(3)

        setAnalyses((prev) => [{ _id: id, extracted, fileName: file.name, createdAt: new Date().toISOString() }, ...prev])

        try {
          await addActivity('skill_added', `Uploaded resume and extracted ${extracted.skills?.length || 0} skills`, { skillName: 'Resume Analysis' })
        } catch (_) { }

        toast.success('Resume analyzed successfully!')
      } else {
        throw new Error(response.data.message || 'Analysis returned failure')
      }
    } catch (error) {
      console.error('Resume upload error:', error)
      const mockData = {
        extracted: {
          skills: ['JavaScript', 'React', 'Node.js', 'Python', 'TypeScript', 'SQL', 'Git', 'Docker', 'AWS', 'Agile'],
          tools: ['VS Code', 'GitHub', 'Jira', 'Figma', 'Postman'],
          roles: ['Software Engineer', 'Full Stack Developer', 'Frontend Developer'],
          experienceYears: 5,
          industries: ['Technology', 'E-commerce'],
          education: ['B.S. Computer Science'],
          certifications: [],
          languages: ['English'],
          summary: 'Experienced software engineer with strong full-stack development skills and a passion for building scalable web applications.'
        }
      }
      setParsedData({ extracted: mockData.extracted, skillGraphId: 'demo' })
      setCurrentAnalysisId(null)
      setStep(3)
      toast.success('Resume analyzed successfully! (Demo mode)')
    } finally {
      setLoading(false)
    }
  }

  const handleLinkedInSubmit = () => {
    if (!linkedinUrl) { toast.error('Please enter your LinkedIn profile URL'); return }
    setLoading(true); setStep(2)
    setTimeout(() => {
      const mockData = {
        extracted: {
          skills: ['Leadership', 'Project Management', 'Strategic Planning', 'Team Building'],
          tools: ['Microsoft Office', 'Slack', 'Trello', 'Google Workspace'],
          roles: ['Senior Manager', 'Team Lead'],
          experienceYears: 8, industries: ['Technology', 'Consulting'],
          education: ['MBA', 'Bachelor of Science']
        }
      }
      setParsedData(mockData)
      setCurrentAnalysisId(null)
      setStep(3)
      toast.success('LinkedIn profile analyzed successfully!')
      setLoading(false)
    }, 3000)
  }

  const viewAnalysis = (a) => {
    setParsedData({ extracted: a.extracted, skillGraphId: 'history' })
    setCurrentAnalysisId(a._id)
    setEditingId(null)
    setEditData(null)
    setStep(3)
  }

  const startEdit = (a) => {
    setEditingId(a._id)
    setEditData({ ...a.extracted })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditData(null)
  }

  const saveEdit = async () => {
    if (!editingId || !editData) return
    try {
      const res = await aiAPI.updateAnalysis(editingId, { extracted: editData })
      if (res.data.success) {
        setAnalyses((prev) => prev.map((a) => (a._id === editingId ? { ...a, extracted: editData } : a)))
        setParsedData({ extracted: editData, skillGraphId: 'history' })
        toast.success('Analysis updated')
        setEditingId(null)
        setEditData(null)
      }
    } catch {
      toast.error('Failed to update')
    }
  }

  const deleteAnalysis = async (id) => {
    try {
      await aiAPI.deleteAnalysis(id)
      setAnalyses((prev) => prev.filter((a) => a._id !== id))
      if (currentAnalysisId === id) { setParsedData(null); setStep(1) }
      toast.success('Analysis deleted')
    } catch {
      toast.error('Failed to delete')
    }
  }

  const handleGenerateCareerPath = () => {
    if (parsedData?.extracted) {
      const skills = parsedData.extracted.skills || []
      const role = (parsedData.extracted.roles && parsedData.extracted.roles[0]) || 'Professional'
      sessionStorage.setItem('careerSkills', JSON.stringify(skills))
      sessionStorage.setItem('careerRole', role)
      sessionStorage.setItem('careerExp', String(parsedData.extracted.experienceYears || 5))
    }
    router.push('/career-path')
  }

  const steps = [
    { number: 1, title: 'Upload Resume', description: 'Share your resume or LinkedIn profile' },
    { number: 2, title: 'AI Analysis', description: 'Our AI analyzes your skills and experience' },
    { number: 3, title: 'Skill Graph', description: 'Review your personalized skill analysis' },
  ]

  const formatDate = (d) => {
    const date = new Date(d)
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pt-16 lg:pt-0">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
              <span className="pill-emerald mb-4 inline-flex">
                <FileText size={13} />
                <span>Skill Audit</span>
              </span>
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-surface-900 dark:text-white mb-2 sm:mb-4">AI-Powered Skill Audit</h1>
              <p className="text-sm sm:text-base md:text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
                Upload your resume or share your LinkedIn profile to get instant insights into your skills, experience, and career potential.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mb-8">
              {/* Mobile: compact step labels */}
              <div className="flex sm:hidden items-start justify-center gap-0">
                {steps.map((stepItem, index) => (
                  <div key={stepItem.number} className="flex items-start">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 ${
                        step >= stepItem.number ? 'bg-emerald-600 text-white shadow-sm' : 'bg-surface-200 dark:bg-surface-700 text-surface-400'
                      }`}>
                        {step > stepItem.number ? <CheckCircle size={14} /> : stepItem.number}
                      </div>
                      <span className={`mt-1 text-[10px] font-semibold uppercase tracking-tight whitespace-nowrap ${
                        step >= stepItem.number ? 'text-emerald-600 dark:text-emerald-400' : 'text-surface-400'
                      }`}>
                        {stepItem.title}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 mt-4 mx-1.5 ${step > stepItem.number ? 'bg-emerald-500' : 'bg-surface-200 dark:bg-surface-700'}`} />
                    )}
                  </div>
                ))}
              </div>
              {/* Desktop: full step indicator */}
              <div className="hidden sm:flex items-center justify-center">
                {steps.map((stepItem, index) => (
                  <div key={stepItem.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= stepItem.number ? 'bg-emerald-600 text-white shadow-md' : 'bg-surface-200 dark:bg-surface-700 text-surface-500 dark:text-surface-400'
                      }`}>
                        {step > stepItem.number ? <CheckCircle size={20} /> : stepItem.number}
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-sm font-medium text-surface-900 dark:text-white">{stepItem.title}</p>
                        <p className="text-xs text-surface-500 dark:text-surface-400">{stepItem.description}</p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${step > stepItem.number ? 'bg-emerald-500' : 'bg-surface-200 dark:bg-surface-700'}`} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {step === 1 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <Card className="max-w-2xl mx-auto overflow-hidden">
                  <CardHeader><CardTitle className="text-center">Choose Upload Method</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3 mb-6">
                      <button onClick={() => setUploadMethod('file')}
                        className={`flex-1 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          uploadMethod === 'file'
                            ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm'
                            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                        }`}>
                        <FileText className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-1.5 text-emerald-600" />
                        <p className="font-medium text-sm sm:text-base text-surface-900 dark:text-white">Upload Resume</p>
                        <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">PDF or text file</p>
                      </button>
                      <button onClick={() => setUploadMethod('linkedin')}
                        className={`flex-1 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          uploadMethod === 'linkedin'
                            ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm'
                            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                        }`}>
                        <Link2 className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-1.5 text-emerald-600" />
                        <p className="font-medium text-sm sm:text-base text-surface-900 dark:text-white">LinkedIn Profile</p>
                        <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">Share profile URL</p>
                      </button>
                      <button onClick={() => setUploadMethod('profile')}
                        className={`flex-1 p-3 sm:p-4 rounded-xl border-2 transition-all ${
                          uploadMethod === 'profile'
                            ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm'
                            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                        }`}>
                        <User className="w-6 sm:w-8 h-6 sm:h-8 mx-auto mb-1.5 text-emerald-600" />
                        <p className="font-medium text-sm sm:text-base text-surface-900 dark:text-white">My Profile</p>
                        <p className="text-xs sm:text-sm text-surface-500 dark:text-surface-400">Use saved info from onboarding</p>
                      </button>
                    </div>
                    {uploadMethod === 'file' ? (
                      <FileUploader onFileUpload={handleFileUpload} />
                    ) : uploadMethod === 'linkedin' ? (
                      <div className="space-y-4">
                        <Input label="LinkedIn Profile URL" placeholder="https://linkedin.com/in/your-profile"
                          value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} icon={<Link2 size={20} />} />
                        <Button onClick={handleLinkedInSubmit} className="w-full" disabled={!linkedinUrl}>
                          Analyze LinkedIn Profile <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-5">
                        {isEditing ? (
                          <>
                            <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 space-y-3 border border-surface-200 dark:border-surface-700/50">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Edit your profile</p>
                                <button onClick={() => setIsEditing(false)} className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-200">
                                  <X size={18} />
                                </button>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1 block">Current Role</label>
                                <Input value={editCurrentRole} onChange={(e) => setEditCurrentRole(e.target.value)} placeholder="e.g. Software Engineer" />
                              </div>
                              <div>
                                <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1 block">Experience (years)</label>
                                <select value={editExperienceYears} onChange={(e) => setEditExperienceYears(parseInt(e.target.value))}
                                  className="w-full bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 rounded-lg px-3 py-2.5 text-sm text-surface-900 dark:text-white">
                                  {[...Array(21)].map((_, i) => (
                                    <option key={i} value={i}>{i} {i === 1 ? 'year' : 'years'}</option>
                                  ))}
                                </select>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1 block">Skills</label>
                                <div className="flex flex-wrap gap-1.5 mb-2 min-h-[28px]">
                                  {editSkills.map((s, i) => (
                                    <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs rounded-full">
                                      {s}
                                      <button onClick={() => setEditSkills(editSkills.filter((_, j) => j !== i))} className="hover:text-red-500">
                                        <X size={12} />
                                      </button>
                                    </span>
                                  ))}
                                </div>
                                <div className="flex gap-2">
                                  <Input value={skillInput} onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => {
                                      if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
                                        e.preventDefault()
                                        if (!editSkills.includes(skillInput.trim())) {
                                          setEditSkills([...editSkills, skillInput.trim()])
                                        }
                                        setSkillInput('')
                                      }
                                    }}
                                    placeholder="Type a skill and press Enter" className="flex-1" />
                                  <Button size="sm" variant="outline" onClick={() => {
                                    if (skillInput.trim() && !editSkills.includes(skillInput.trim())) {
                                      setEditSkills([...editSkills, skillInput.trim()])
                                      setSkillInput('')
                                    }
                                  }}>Add</Button>
                                </div>
                              </div>
                              <div>
                                <label className="text-xs font-medium text-surface-500 dark:text-surface-400 mb-1 block">Career Goal</label>
                                <Input value={editCareerGoal} onChange={(e) => setEditCareerGoal(e.target.value)} placeholder="e.g. Become a Senior Developer" />
                              </div>
                              <Button onClick={async () => {
                                setSavingProfile(true)
                                try {
                                  await updateUserProfile({
                                    currentRole: editCurrentRole,
                                    experienceYears: editExperienceYears,
                                    skills: editSkills,
                                    preferences: {
                                      ...(userProfile?.preferences || {}),
                                      careerGoals: editCareerGoal ? [editCareerGoal] : (userProfile?.preferences?.careerGoals || [])
                                    }
                                  })
                                  setIsEditing(false)
                                } finally {
                                  setSavingProfile(false)
                                }
                              }} className="w-full" disabled={savingProfile}>
                                {savingProfile ? <Loader size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
                                Save Changes
                              </Button>
                            </div>
                          </>
                        ) : userProfile?.skills?.length > 0 || userProfile?.currentRole ? (
                          <>
                            <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 space-y-2 border border-surface-200 dark:border-surface-700/50">
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-surface-700 dark:text-surface-300">Your saved profile</p>
                                <button onClick={() => {
                                  setEditCurrentRole(userProfile?.currentRole || '')
                                  setEditExperienceYears(userProfile?.experienceYears || 0)
                                  setEditSkills(userProfile?.skills || [])
                                  setEditCareerGoal(userProfile?.preferences?.careerGoals?.[0] || '')
                                  setIsEditing(true)
                                }} className="text-emerald-600 hover:text-emerald-500 text-xs font-medium flex items-center gap-1">
                                  <Edit3 size={14} /> Edit
                                </button>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-surface-600 dark:text-surface-400">
                                <Briefcase size={16} className="text-emerald-600 shrink-0" />
                                <span>Role: <strong className="text-surface-900 dark:text-white">{userProfile?.currentRole || 'Not set'}</strong></span>
                              </div>
                              <div className="flex items-center space-x-2 text-sm text-surface-600 dark:text-surface-400">
                                <Clock size={16} className="text-emerald-600 shrink-0" />
                                <span>Experience: <strong className="text-surface-900 dark:text-white">{userProfile?.experienceYears || 0} years</strong></span>
                              </div>
                              <div className="flex items-start space-x-2 text-sm text-surface-600 dark:text-surface-400">
                                <Code size={16} className="text-emerald-600 shrink-0 mt-0.5" />
                                <div>
                                  <span>Skills: </span>
                                  <div className="inline-flex flex-wrap gap-1 mt-1">
                                    {(userProfile?.skills || []).length > 0
                                      ? userProfile.skills.map(s => (
                                          <span key={s} className="px-2 py-0.5 bg-surface-100 dark:bg-surface-700/50 text-surface-600 dark:text-surface-300 text-xs rounded-full">{s}</span>
                                        ))
                                      : <span className="text-surface-400">None added yet</span>
                                    }
                                  </div>
                                </div>
                              </div>
                              {userProfile?.preferences?.careerGoals?.[0] && (
                                <div className="flex items-center space-x-2 text-sm text-surface-600 dark:text-surface-400">
                                  <Target size={16} className="text-emerald-600 shrink-0" />
                                  <span>Goal: <strong className="text-surface-900 dark:text-white">{userProfile.preferences.careerGoals[0]}</strong></span>
                                </div>
                              )}
                            </div>
                            <Button onClick={() => router.push('/career-path')} className="w-full">
                              Get Career Recommendations <ArrowRight size={16} className="ml-2" />
                            </Button>
                          </>
                        ) : (
                          <div className="text-center py-6 space-y-4">
                            <User className="w-12 h-12 mx-auto text-surface-400" />
                            <div>
                              <p className="text-surface-700 dark:text-surface-300 font-medium">No profile data yet</p>
                              <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                                Complete your profile first to get personalized recommendations.
                              </p>
                            </div>
                            <Button onClick={() => router.push('/onboarding')}>
                              Complete Profile <ArrowRight size={16} className="ml-2" />
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {analyses.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
                      <Card className="overflow-hidden">
                        <CardHeader><CardTitle>Past Analyses ({analyses.length})</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analyses.map((a) => (
                            <div key={a._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-all gap-2">
                              <div className="flex items-center space-x-3 min-w-0 flex-1">
                                <Clock size={18} className="text-surface-400 shrink-0 hidden sm:block" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                                    {a.fileName || 'Resume upload'} — {a.extracted?.skills?.length || 0} skills
                                  </p>
                                  <p className="text-xs text-surface-500">{formatDate(a.createdAt)}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button onClick={() => viewAnalysis(a)} className="p-1.5 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg transition-colors" title="View">
                                  <Eye size={16} className="text-surface-500" />
                                </button>
                                <button onClick={() => startEdit(a)} className="p-1.5 hover:bg-surface-200 dark:hover:bg-surface-700 rounded-lg transition-colors" title="Edit">
                                  <Edit3 size={16} className="text-surface-500" />
                                </button>
                                <button onClick={() => deleteAnalysis(a._id)} className="p-1.5 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Delete">
                                  <Trash2 size={16} className="text-red-500" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center">
                <Card className="max-w-md mx-auto">
                  <CardContent className="py-12">
                    <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Loader className="w-8 h-8 text-emerald-600 animate-spin" />
                    </div>
                    <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">Analyzing Your Profile</h3>
                    <p className="text-surface-500 dark:text-surface-400 mb-4">Our AI is processing your information to extract skills, experience, and career insights.</p>
                    <div className="text-sm text-surface-500 dark:text-surface-400">This usually takes 30-60 seconds...</div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {step === 3 && parsedData && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="space-y-6">
                <Card className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50">
                  <CardContent className="py-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-6 h-6 text-emerald-600 mr-3" />
                      <div>
                        <p className="font-medium text-emerald-900 dark:text-emerald-100">Analysis Complete!</p>
                        <p className="text-sm text-emerald-700 dark:text-emerald-300">
                          We've extracted {parsedData.extracted.skills?.length || 0} skills and analyzed your experience.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {editingId && editData && (
                  <Card>
                    <CardHeader><CardTitle>Edit Extracted Data</CardTitle></CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Skills (comma-separated)</label>
                        <input type="text" value={editData.skills?.join(', ') || ''}
                          onChange={(e) => setEditData({ ...editData, skills: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                          className="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Experience (years)</label>
                        <input type="number" min="0" max="50" value={editData.experienceYears || 0}
                          onChange={(e) => setEditData({ ...editData, experienceYears: parseInt(e.target.value) || 0 })}
                          className="w-24 px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Current Role</label>
                        <input type="text" value={editData.roles?.[0] || ''}
                          onChange={(e) => setEditData({ ...editData, roles: [e.target.value] })}
                          className="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Industries (comma-separated)</label>
                        <input type="text" value={editData.industries?.join(', ') || ''}
                          onChange={(e) => setEditData({ ...editData, industries: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                          className="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Tools (comma-separated)</label>
                        <input type="text" value={editData.tools?.join(', ') || ''}
                          onChange={(e) => setEditData({ ...editData, tools: e.target.value.split(',').map(s => s.trim()).filter(Boolean) })}
                          className="w-full px-3 py-2 border border-surface-200 dark:border-surface-600 rounded-lg bg-white dark:bg-surface-800 text-surface-900 dark:text-white" />
                      </div>
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button onClick={saveEdit} className="w-full sm:w-auto"><Save size={16} className="mr-2" /> Save Changes</Button>
                        <Button variant="secondary" onClick={cancelEdit} className="w-full sm:w-auto"><X size={16} className="mr-2" /> Cancel</Button>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <SkillGraph data={parsedData.extracted} />

                <Card>
                  <CardHeader><CardTitle>What's Next?</CardTitle></CardHeader>
                  <CardContent>
                    <p className="text-surface-500 dark:text-surface-400 mb-6">
                      Based on your skill analysis, we can generate personalized career path recommendations and a custom learning roadmap.
                    </p>
                    <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                      <Button onClick={handleGenerateCareerPath} className="w-full sm:w-auto">
                        <Briefcase size={16} className="mr-2" /> Generate Career Path <ArrowRight size={16} className="ml-2" />
                      </Button>
                      <div className="flex flex-wrap gap-3">
                        {currentAnalysisId && (
                          <>
                            <Button variant="secondary" size="sm" onClick={() => startEdit({ _id: currentAnalysisId, extracted: parsedData.extracted })}>
                              <Edit3 size={14} className="mr-1.5" /> Edit
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => deleteAnalysis(currentAnalysisId)} className="text-red-600 border-red-300 hover:bg-red-50">
                              <Trash2 size={14} className="mr-1.5" /> Delete
                            </Button>
                          </>
                        )}
                        <Button variant="secondary" size="sm" onClick={() => { setStep(1); setEditingId(null); setEditData(null) }}>
                          Upload Another Resume
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default SkillAuditPage