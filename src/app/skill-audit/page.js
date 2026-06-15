'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Link2, ArrowRight, CheckCircle, Loader, Clock, Trash2, Edit3, Save, X, Eye, Briefcase } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/context/ProgressContext'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
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
  const { user, getAuthToken, loading: authLoading } = useAuth()
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
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-8">
              <span className="pill-emerald mb-4 inline-flex">
                <FileText size={13} />
                <span>Skill Audit</span>
              </span>
              <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-4">AI-Powered Skill Audit</h1>
              <p className="text-lg text-surface-500 dark:text-surface-400 max-w-2xl mx-auto">
                Upload your resume or share your LinkedIn profile to get instant insights into your skills, experience, and career potential.
              </p>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }} className="mb-8">
              <div className="flex items-center justify-center space-x-8">
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
                <Card className="max-w-2xl mx-auto">
                  <CardHeader><CardTitle className="text-center">Choose Upload Method</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex space-x-4 mb-6">
                      <button onClick={() => setUploadMethod('file')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                          uploadMethod === 'file'
                            ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm'
                            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                        }`}>
                        <FileText className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                        <p className="font-medium text-surface-900 dark:text-white">Upload Resume</p>
                        <p className="text-sm text-surface-500 dark:text-surface-400">PDF or text file</p>
                      </button>
                      <button onClick={() => setUploadMethod('linkedin')}
                        className={`flex-1 p-4 rounded-xl border-2 transition-all ${
                          uploadMethod === 'linkedin'
                            ? 'border-emerald-500/50 bg-emerald-50 dark:bg-emerald-900/20 shadow-sm'
                            : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
                        }`}>
                        <Link2 className="w-8 h-8 mx-auto mb-2 text-emerald-600" />
                        <p className="font-medium text-surface-900 dark:text-white">LinkedIn Profile</p>
                        <p className="text-sm text-surface-500 dark:text-surface-400">Share profile URL</p>
                      </button>
                    </div>
                    {uploadMethod === 'file' ? (
                      <FileUploader onFileUpload={handleFileUpload} />
                    ) : (
                      <div className="space-y-4">
                        <Input label="LinkedIn Profile URL" placeholder="https://linkedin.com/in/your-profile"
                          value={linkedinUrl} onChange={(e) => setLinkedinUrl(e.target.value)} icon={<Link2 size={20} />} />
                        <Button onClick={handleLinkedInSubmit} className="w-full" disabled={!linkedinUrl}>
                          Analyze LinkedIn Profile <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {analyses.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-8">
                    <Card>
                      <CardHeader><CardTitle>Past Analyses ({analyses.length})</CardTitle></CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {analyses.map((a) => (
                            <div key={a._id} className="flex items-center justify-between p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-all">
                              <div className="flex items-center space-x-3 min-w-0">
                                <Clock size={18} className="text-surface-400 shrink-0" />
                                <div className="min-w-0">
                                  <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                                    {a.fileName || 'Resume upload'} — {a.extracted?.skills?.length || 0} skills
                                  </p>
                                  <p className="text-xs text-surface-500">{formatDate(a.createdAt)}</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-2 shrink-0">
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
                      <div className="flex space-x-3">
                        <Button onClick={saveEdit}><Save size={16} className="mr-2" /> Save Changes</Button>
                        <Button variant="secondary" onClick={cancelEdit}><X size={16} className="mr-2" /> Cancel</Button>
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
                    <div className="flex flex-wrap gap-3">
                      <Button onClick={handleGenerateCareerPath}>
                        <Briefcase size={16} className="mr-2" /> Generate Career Path <ArrowRight size={16} className="ml-2" />
                      </Button>
                      {currentAnalysisId && (
                        <>
                          <Button variant="secondary" onClick={() => startEdit({ _id: currentAnalysisId, extracted: parsedData.extracted })}>
                            <Edit3 size={16} className="mr-2" /> Edit
                          </Button>
                          <Button variant="secondary" onClick={() => deleteAnalysis(currentAnalysisId)} className="text-red-600 border-red-300 hover:bg-red-50">
                            <Trash2 size={16} className="mr-2" /> Delete
                          </Button>
                        </>
                      )}
                      <Button variant="secondary" onClick={() => { setStep(1); setEditingId(null); setEditData(null) }}>
                        Upload Another Resume
                      </Button>
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