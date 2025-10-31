'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Target, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Users, 
  ArrowRight,
  CheckCircle,
  Star,
  Briefcase,
  BarChart3
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/context/ProgressContext'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { aiAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const CareerPathPage = () => {
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedPath, setSelectedPath] = useState(null)
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false)
  const { user, userProfile, getAuthToken } = useAuth()
  const { addActivity } = useProgress()
  const router = useRouter()

  useEffect(() => {
    fetchCareerRecommendations()
  }, [])

  const fetchCareerRecommendations = async () => {
    try {
      setLoading(true)
      const token = await getAuthToken()
      
      // Mock data for demo - replace with actual API call
      const mockRecommendations = [
        {
          _id: '1',
          targetRole: 'Senior Software Engineer',
          currentRole: 'Software Engineer',
          requiredSkills: ['Advanced JavaScript', 'System Design', 'Leadership', 'Code Review'],
          timeToAchieve: '12-18 months',
          difficulty: 'intermediate',
          reasoning: 'Your strong technical foundation in JavaScript and React makes you well-positioned for a senior role. Focus on system design and leadership skills to make the transition.',
          salaryRange: '$120,000 - $160,000',
          marketDemand: 'high',
          keySteps: [
            'Lead a major project or feature',
            'Mentor junior developers',
            'Learn system design principles',
            'Contribute to architectural decisions'
          ]
        },
        {
          _id: '2',
          targetRole: 'Engineering Manager',
          currentRole: 'Software Engineer',
          requiredSkills: ['Team Management', 'Strategic Planning', 'Project Management', 'Communication'],
          timeToAchieve: '18-24 months',
          difficulty: 'advanced',
          reasoning: 'Your technical expertise combined with your collaborative approach suggests strong management potential. This path requires developing people management and strategic thinking skills.',
          salaryRange: '$140,000 - $180,000',
          marketDemand: 'high',
          keySteps: [
            'Take on team lead responsibilities',
            'Complete management training',
            'Practice performance management',
            'Develop strategic thinking skills'
          ]
        },
        {
          _id: '3',
          targetRole: 'Full Stack Architect',
          currentRole: 'Software Engineer',
          requiredSkills: ['Backend Development', 'Database Design', 'Cloud Architecture', 'DevOps'],
          timeToAchieve: '15-20 months',
          difficulty: 'intermediate',
          reasoning: 'Your frontend skills provide a solid foundation. Adding backend and architecture expertise will make you a valuable full-stack architect.',
          salaryRange: '$130,000 - $170,000',
          marketDemand: 'high',
          keySteps: [
            'Master backend technologies',
            'Learn cloud platforms (AWS/Azure)',
            'Study system architecture patterns',
            'Build full-stack projects'
          ]
        }
      ]
      
      setRecommendations(mockRecommendations)
    } catch (error) {
      console.error('Failed to fetch career recommendations:', error)
      toast.error('Failed to load career recommendations')
    } finally {
      setLoading(false)
    }
  }

  const handleSelectPath = (path) => {
    setSelectedPath(path)
  }

  const handleGenerateRoadmap = async (path) => {
    try {
      setGeneratingRoadmap(true)
      
      // Track activity
      await addActivity(
        'roadmap_generated',
        `Generated learning roadmap for ${path.targetRole}`,
        { targetRole: path.targetRole }
      )
      
      toast.success('Roadmap generated successfully!')
      router.push('/roadmap')
    } catch (error) {
      console.error('Failed to generate roadmap:', error)
      toast.error('Failed to generate roadmap')
    } finally {
      setGeneratingRoadmap(false)
    }
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'advanced': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getMarketDemandIcon = (demand) => {
    switch (demand) {
      case 'high': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'medium': return <BarChart3 className="w-4 h-4 text-yellow-600" />
      case 'low': return <BarChart3 className="w-4 h-4 text-red-600" />
      default: return <BarChart3 className="w-4 h-4 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading career recommendations...</p>
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
        
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Career Path Recommendations
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                AI-powered career progression paths tailored to your skills and goals
              </p>
            </motion.div>

            {/* Career Paths Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
              {recommendations.map((path, index) => (
                <motion.div
                  key={path._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <Card 
                    className={`h-full cursor-pointer transition-all duration-200 ${
                      selectedPath?._id === path._id 
                        ? 'ring-2 ring-primary-500 shadow-lg' 
                        : 'hover:shadow-lg hover:scale-105'
                    }`}
                    onClick={() => handleSelectPath(path)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg mb-2">{path.targetRole}</CardTitle>
                          <div className="flex items-center space-x-2 mb-3">
                            <Badge className={getDifficultyColor(path.difficulty)} size="sm">
                              {path.difficulty}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {getMarketDemandIcon(path.marketDemand)}
                              <span className="text-xs text-gray-500 capitalize">
                                {path.marketDemand} demand
                              </span>
                            </div>
                          </div>
                        </div>
                        {selectedPath?._id === path._id && (
                          <CheckCircle className="w-6 h-6 text-primary-600" />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="space-y-4">
                        {/* Timeline & Salary */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {path.timeToAchieve}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-600 dark:text-gray-400">
                              {path.salaryRange}
                            </span>
                          </div>
                        </div>

                        {/* Reasoning */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
                          {path.reasoning}
                        </p>

                        {/* Required Skills */}
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                            Key Skills Needed:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {path.requiredSkills.slice(0, 3).map((skill, skillIndex) => (
                              <Badge key={skillIndex} variant="outline" size="xs">
                                {skill}
                              </Badge>
                            ))}
                            {path.requiredSkills.length > 3 && (
                              <Badge variant="secondary" size="xs">
                                +{path.requiredSkills.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </div>

                        {/* Action Button */}
                        <Button
                          variant={selectedPath?._id === path._id ? 'primary' : 'secondary'}
                          size="sm"
                          className="w-full mt-4"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGenerateRoadmap(path)
                          }}
                          loading={generatingRoadmap && selectedPath?._id === path._id}
                        >
                          {selectedPath?._id === path._id ? 'Generate Roadmap' : 'Select Path'}
                          <ArrowRight size={16} className="ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Selected Path Details */}
            {selectedPath && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-6 h-6 text-primary-600" />
                      <span>Path to {selectedPath.targetRole}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Key Steps */}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <Briefcase className="w-5 h-5 mr-2 text-primary-600" />
                          Key Steps to Success
                        </h3>
                        <div className="space-y-3">
                          {selectedPath.keySteps.map((step, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-primary-600 dark:text-primary-400 text-xs font-medium">
                                  {index + 1}
                                </span>
                              </div>
                              <p className="text-gray-700 dark:text-gray-300 text-sm">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills Breakdown */}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                          <Star className="w-5 h-5 mr-2 text-primary-600" />
                          Skills to Develop
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedPath.requiredSkills.map((skill, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="w-2 h-2 bg-primary-500 rounded-full"></div>
                              <span className="text-sm text-gray-700 dark:text-gray-300">
                                {skill}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                      <p className="text-primary-800 dark:text-primary-200 text-sm">
                        <strong>Why this path:</strong> {selectedPath.reasoning}
                      </p>
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

export default CareerPathPage