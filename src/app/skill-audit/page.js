'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Upload, FileText, Link2, ArrowRight, CheckCircle, Loader } from 'lucide-react'
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
  const [step, setStep] = useState(1) // 1: Upload, 2: Processing, 3: Results
  const [uploadMethod, setUploadMethod] = useState('file') // 'file' or 'linkedin'
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [parsedData, setParsedData] = useState(null)
  const [loading, setLoading] = useState(false)
  const { user, getAuthToken } = useAuth()
  const { addActivity } = useProgress()
  const router = useRouter()

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
        setParsedData(response.data.data)
        setStep(3)
        
        // Track activity
        await addActivity(
          'skill_added',
          `Uploaded resume and extracted ${response.data.data.extracted.skills?.length || 0} skills`,
          { skillName: 'Resume Analysis' }
        )
        
        toast.success('Resume analyzed successfully!')
      }
    } catch (error) {
      console.error('Resume upload error:', error)
      toast.error('Failed to analyze resume. Please try again.')
      setStep(1)
    } finally {
      setLoading(false)
    }
  }

  const handleLinkedInSubmit = async () => {
    if (!linkedinUrl) {
      toast.error('Please enter your LinkedIn profile URL')
      return
    }

    setLoading(true)
    setStep(2)

    try {
      // For now, we'll simulate LinkedIn parsing since it requires special API access
      setTimeout(() => {
        const mockData = {
          extracted: {
            skills: ['Leadership', 'Project Management', 'Strategic Planning', 'Team Building'],
            tools: ['Microsoft Office', 'Slack', 'Trello', 'Google Workspace'],
            roles: ['Senior Manager', 'Team Lead'],
            experienceYears: 8,
            industries: ['Technology', 'Consulting'],
            education: ['MBA', 'Bachelor of Science']
          }
        }
        setParsedData(mockData)
        setStep(3)
        toast.success('LinkedIn profile analyzed successfully!')
        setLoading(false)
      }, 3000)
    } catch (error) {
      console.error('LinkedIn analysis error:', error)
      toast.error('Failed to analyze LinkedIn profile. Please try again.')
      setStep(1)
      setLoading(false)
    }
  }

  const handleGenerateCareerPath = () => {
    router.push('/career-path')
  }

  const steps = [
    { number: 1, title: 'Upload Resume', description: 'Share your resume or LinkedIn profile' },
    { number: 2, title: 'AI Analysis', description: 'Our AI analyzes your skills and experience' },
    { number: 3, title: 'Skill Graph', description: 'Review your personalized skill analysis' },
  ]

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                AI-Powered Skill Audit
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Upload your resume or share your LinkedIn profile to get instant insights into your skills, 
                experience, and career potential with our advanced AI analysis.
              </p>
            </motion.div>

            {/* Progress Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="flex items-center justify-center space-x-8">
                {steps.map((stepItem, index) => (
                  <div key={stepItem.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium ${
                        step >= stepItem.number
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                      }`}>
                        {step > stepItem.number ? (
                          <CheckCircle size={20} />
                        ) : (
                          stepItem.number
                        )}
                      </div>
                      <div className="mt-2 text-center">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {stepItem.title}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {stepItem.description}
                        </p>
                      </div>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`w-16 h-0.5 mx-4 ${
                        step > stepItem.number ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Step 1: Upload */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <Card className="max-w-2xl mx-auto">
                  <CardHeader>
                    <CardTitle className="text-center">Choose Upload Method</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {/* Method Selection */}
                    <div className="flex space-x-4 mb-6">
                      <button
                        onClick={() => setUploadMethod('file')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                          uploadMethod === 'file'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <FileText className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                        <p className="font-medium text-gray-900 dark:text-white">Upload Resume</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">PDF or text file</p>
                      </button>
                      
                      <button
                        onClick={() => setUploadMethod('linkedin')}
                        className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
                          uploadMethod === 'linkedin'
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                            : 'border-gray-200 dark:border-gray-700'
                        }`}
                      >
                        <Link2 className="w-8 h-8 mx-auto mb-2 text-primary-600" />
                        <p className="font-medium text-gray-900 dark:text-white">LinkedIn Profile</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Share profile URL</p>
                      </button>
                    </div>

                    {/* Upload Interface */}
                    {uploadMethod === 'file' ? (
                      <FileUploader onFileUpload={handleFileUpload} />
                    ) : (
                      <div className="space-y-4">
                        <Input
                          label="LinkedIn Profile URL"
                          placeholder="https://linkedin.com/in/your-profile"
                          value={linkedinUrl}
                          onChange={(e) => setLinkedinUrl(e.target.value)}
                          icon={<Link2 size={20} />}
                        />
                        <Button 
                          onClick={handleLinkedInSubmit}
                          className="w-full"
                          disabled={!linkedinUrl}
                        >
                          Analyze LinkedIn Profile
                          <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Processing */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center"
              >
                <Card className="max-w-md mx-auto">
                  <CardContent className="py-12">
                    <div className="w-16 h-16 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Loader className="w-8 h-8 text-primary-600 animate-spin" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                      Analyzing Your Profile
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      Our AI is processing your information to extract skills, experience, and career insights.
                    </p>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      This usually takes 30-60 seconds...
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Results */}
            {step === 3 && parsedData && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="space-y-6"
              >
                {/* Success Message */}
                <Card className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="py-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3" />
                      <div>
                        <p className="font-medium text-green-900 dark:text-green-100">
                          Analysis Complete!
                        </p>
                        <p className="text-sm text-green-700 dark:text-green-300">
                          We've extracted {parsedData.extracted.skills?.length || 0} skills and analyzed your experience.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Skill Graph */}
                <SkillGraph data={parsedData.extracted} />

                {/* Next Steps */}
                <Card>
                  <CardHeader>
                    <CardTitle>What's Next?</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600 dark:text-gray-400 mb-6">
                      Based on your skill analysis, we can now generate personalized career path recommendations 
                      and create a custom learning roadmap to help you reach your goals.
                    </p>
                    <div className="flex space-x-4">
                      <Button onClick={handleGenerateCareerPath} className="flex-1">
                        Generate Career Path
                        <ArrowRight size={16} className="ml-2" />
                      </Button>
                      <Button variant="secondary" onClick={() => setStep(1)} className="flex-1">
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