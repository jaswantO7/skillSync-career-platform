'use client'

import { useState, useEffect, useRef } from 'react'
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
  BarChart3,
  Search,
  Info,
  Map,
  Plus
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/context/ProgressContext'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'
import { Modal } from '@/components/ui/Modal'
import { aiAPI, authAPI, careerPathAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const CareerPathPage = () => {
  const [recommendations, setRecommendations] = useState([])
  const [pageLoading, setPageLoading] = useState(true)
  const [selectedPath, setSelectedPath] = useState(null)
  const [generatingRoadmap, setGeneratingRoadmap] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [pendingPath, setPendingPath] = useState(null)
  const { user, userProfile, getAuthToken, loading: authLoading } = useAuth()
  const { addActivity, progress, roadmap, roadmaps, fetchUserProgress } = useProgress()
  const router = useRouter()
  const fetchedRef = useRef(false)
  const [showRoadmapConfirm, setShowRoadmapConfirm] = useState(false)
  const [pendingRoadmapPath, setPendingRoadmapPath] = useState(null)
  const [customPath, setCustomPath] = useState('')
  const [searchLoading, setSearchLoading] = useState(false)
  const [showPathDetails, setShowPathDetails] = useState(false)
  const [selectedPathForDetails, setSelectedPathForDetails] = useState(null)
  const [showAllRoadmaps, setShowAllRoadmaps] = useState(false)

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
      keySteps: ['Lead a major project or feature', 'Mentor junior developers', 'Learn system design principles', 'Contribute to architectural decisions']
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
      keySteps: ['Take on team lead responsibilities', 'Complete management training', 'Practice performance management', 'Develop strategic thinking skills']
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
      keySteps: ['Master backend technologies', 'Learn cloud platforms (AWS/Azure)', 'Study system architecture patterns', 'Build full-stack projects']
    }
  ]

  const fetchCareerRecommendations = async () => {
    try {
      setPageLoading(true)

      // Check session cache first — same tab, stable results
      const cached = typeof window !== 'undefined' ? sessionStorage.getItem('cachedRecommendations') : null
      if (cached) {
        setRecommendations(JSON.parse(cached))
        setPageLoading(false)
        return
      }

      // Use skills/role/exp from resume analysis if passed via sessionStorage
      const storedSkills = typeof window !== 'undefined' ? sessionStorage.getItem('careerSkills') : null
      const storedRole = typeof window !== 'undefined' ? sessionStorage.getItem('careerRole') : null
      const storedExp = typeof window !== 'undefined' ? sessionStorage.getItem('careerExp') : null
      const currentSkills = storedSkills ? JSON.parse(storedSkills) : (userProfile?.skills || [])
      const currentRole = storedRole || userProfile?.currentRole || ''
      const currentExp = storedExp ? parseInt(storedExp) : (userProfile?.experienceYears || 0)

      try {
        const response = await aiAPI.recommendPath({
          currentSkills,
          goals: userProfile?.preferences?.careerGoals || [currentRole],
          experienceYears: currentExp,
          currentRole
        })
        if (response.data?.success && response.data?.data?.recommendations?.length) {
          const results = response.data.data.recommendations
          sessionStorage.setItem('cachedRecommendations', JSON.stringify(results))
          setRecommendations(results)
          return
        }
      } catch (e) {
        console.warn('AI career path unavailable, using mock data:', e.message)
      }

      sessionStorage.setItem('cachedRecommendations', JSON.stringify(mockRecommendations))
      setRecommendations(mockRecommendations)
    } catch (error) {
      console.error('Failed to fetch career recommendations:', error)
      toast.error('Failed to load career recommendations')
    } finally {
      setPageLoading(false)
    }
  }

  useEffect(() => {
    if (authLoading || !user || fetchedRef.current) return
    fetchedRef.current = true
    fetchCareerRecommendations()
  }, [user, authLoading])

  const handleCustomSearch = async () => {
    const query = customPath.trim()
    if (!query) {
      toast.error('Enter a career path to search')
      return
    }
    try {
      setSearchLoading(true)
      const storedSkills = typeof window !== 'undefined' ? sessionStorage.getItem('careerSkills') : null
      const storedRole = typeof window !== 'undefined' ? sessionStorage.getItem('careerRole') : null
      const storedExp = typeof window !== 'undefined' ? sessionStorage.getItem('careerExp') : null
      const currentSkills = storedSkills ? JSON.parse(storedSkills) : (userProfile?.skills || [])
      const currentRole = storedRole || userProfile?.currentRole || ''
      const currentExp = storedExp ? parseInt(storedExp) : (userProfile?.experienceYears || 0)

      const response = await aiAPI.recommendPath({
        currentSkills,
        goals: [query],
        experienceYears: currentExp,
        currentRole,
        targetRole: query
      })
      if (response.data?.success && response.data?.data?.recommendations?.length) {
        const results = response.data.data.recommendations
        setRecommendations(results)
        sessionStorage.setItem('cachedRecommendations', JSON.stringify(results))
        toast.success(`Found ${results.length} paths for "${query}"`)
      } else {
        toast.error('No results found for that career path')
      }
    } catch (error) {
      console.error('Custom career search failed:', error)
      toast.error('Failed to search career path')
    } finally {
      setSearchLoading(false)
    }
  }

  const handleSelectPath = (path) => {
    const storedPath = typeof window !== 'undefined' ? sessionStorage.getItem('selectedPath') : null
    const sessionPath = storedPath ? JSON.parse(storedPath) : null
    const existingPath = userProfile?.selectedCareerPath?.targetRole || sessionPath?.targetRole
    const isFreePlan = userProfile?.subscriptionPlan === 'free'
    // Show confirmation if already has a different path saved
    if (existingPath && existingPath !== path.targetRole && isFreePlan) {
      setPendingPath(path)
      setShowConfirm(true)
      return
    }
    setSelectedPath(path)
  }

  const handleConfirmReplace = () => {
    if (pendingPath) setSelectedPath(pendingPath)
    setShowConfirm(false)
    setPendingPath(null)
  }

  const handleCancelReplace = () => {
    setShowConfirm(false)
    setPendingPath(null)
  }

  const handleGenerateRoadmap = (path) => {
    const isFreePlan = userProfile?.subscriptionPlan === 'free'
    // Check if an active roadmap already exists
    if (roadmap && isFreePlan) {
      setPendingRoadmapPath(path)
      setShowRoadmapConfirm(true)
      return
    }
    proceedGenerateRoadmap(path)
  }

  const proceedGenerateRoadmap = async (path) => {
    try {
      setGeneratingRoadmap(true)

      // Save selected career path to database
      await authAPI.updateProfile({
        name: userProfile?.name || user?.displayName || user?.email?.split('@')[0] || 'User',
        selectedCareerPath: {
          targetRole: path.targetRole,
          requiredSkills: path.requiredSkills,
          currentRole: path.currentRole,
          timeToAchieve: path.timeToAchieve,
          difficulty: path.difficulty
        }
      })

      // Save to CareerPath collection for history
      await careerPathAPI.save({
        targetRole: path.targetRole,
        currentRole: path.currentRole,
        requiredSkills: path.requiredSkills,
        timeToAchieve: path.timeToAchieve,
        difficulty: path.difficulty,
        reasoning: path.reasoning || `Career path to become a ${path.targetRole}`,
        salaryRange: path.salaryRange,
        marketDemand: path.marketDemand,
        keySteps: path.keySteps,
        pathSteps: path.pathSteps,
      })

      // Also save to sessionStorage for immediate warning check
      sessionStorage.setItem('selectedPath', JSON.stringify(path))

      // Actually generate the learning roadmap via AI
      try {
        const token = await getAuthToken()
        const storedSkills = typeof window !== 'undefined' ? sessionStorage.getItem('careerSkills') : null
        const currentSkills = storedSkills ? JSON.parse(storedSkills) : (userProfile?.skills || [])
        const parsedMonths = parseInt(path.timeToAchieve) || 6
        await aiAPI.generateRoadmap({
          targetRole: path.targetRole,
          requiredSkills: path.requiredSkills || [],
          timeframe: parsedMonths,
          hoursPerWeek: userProfile?.preferences?.availableHoursPerWeek || 10,
          currentSkills,
        })
      } catch (e) {
        console.warn('Roadmap generation API call failed, profile saved:', e.message)
      }

      // Refresh progress context so /roadmap page loads fresh data
      await fetchUserProgress()

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
      default: return 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-200'
    }
  }

  const getMarketDemandIcon = (demand) => {
    switch (demand) {
      case 'high': return <TrendingUp className="w-4 h-4 text-green-600" />
      case 'medium': return <BarChart3 className="w-4 h-4 text-yellow-600" />
      case 'low': return <BarChart3 className="w-4 h-4 text-red-600" />
      default: return <BarChart3 className="w-4 h-4 text-surface-600" />
    }
  }

  if (pageLoading) {
    return (
      <div className="flex h-screen bg-surface-50 dark:bg-surface-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-surface-600 dark:text-surface-400">Loading career recommendations...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader />
        
        <main className="flex-1 overflow-y-auto p-2">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-surface-900 dark:text-white mb-2">
                Career Path Recommendations
              </h1>
              <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400">
                AI-powered career progression paths tailored to your skills and goals
              </p>
            </motion.div>

            {/* Current Selected Path / My Roadmaps */}
            {userProfile?.subscriptionPlan !== 'free' && roadmaps?.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="mb-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-surface-900 dark:text-white">My Roadmaps</h2>
                  <span className="text-sm text-surface-500 dark:text-surface-400">
                    {roadmaps.filter(r => r.status !== 'abandoned').length} total
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {roadmaps.filter(r => r.status !== 'abandoned')
                    .slice(0, showAllRoadmaps ? undefined : 3)
                    .map(r => (
                    <div key={r._id} className="bg-surface-50 dark:bg-surface-800/50 border border-surface-200 dark:border-surface-700/50 rounded-xl p-4 hover:shadow-md transition-all">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
                            <Map className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-surface-900 dark:text-white leading-tight">{r.title}</p>
                            <p className="text-xs text-surface-500 dark:text-surface-400">{r.targetRole}</p>
                          </div>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          r.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                          r.status === 'paused' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                          'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400'
                        }`}>{r.status}</span>
                      </div>
                      <div className="h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden mb-3">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${r.overallProgress || 0}%` }} />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-surface-500 dark:text-surface-400">{r.overallProgress || 0}% complete</span>
                        <Button size="sm" variant="secondary" onClick={() => router.push(`/roadmap?id=${r._id}`)}>
                          View
                          <ArrowRight size={14} className="ml-1" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                {roadmaps.filter(r => r.status !== 'abandoned').length > 3 && (
                  <div className="mt-4 text-center">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowAllRoadmaps(!showAllRoadmaps)}
                    >
                      {showAllRoadmaps ? 'Show Less' : `Show All (${roadmaps.filter(r => r.status !== 'abandoned').length})`}
                    </Button>
                  </div>
                )}
              </motion.div>
            ) : userProfile?.selectedCareerPath?.targetRole ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.05 }}
                className="mb-6"
              >
                <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-5 flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-800 rounded-xl flex items-center justify-center">
                      <Target className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Current Path</p>
                      <p className="text-lg font-semibold text-surface-900 dark:text-white">{userProfile.selectedCareerPath.targetRole}</p>
                      <div className="flex items-center space-x-3 mt-1 text-sm text-surface-600 dark:text-surface-400">
                        {userProfile.selectedCareerPath.difficulty && (
                          <span className="capitalize">{userProfile.selectedCareerPath.difficulty}</span>
                        )}
                        {userProfile.selectedCareerPath.timeToAchieve && (
                          <>
                            <span>·</span>
                            <span>{userProfile.selectedCareerPath.timeToAchieve}</span>
                          </>
                        )}
                        {(userProfile.selectedCareerPath.requiredSkills || []).length > 0 && (
                          <>
                            <span>·</span>
                            <span>{userProfile.selectedCareerPath.requiredSkills.length} skills</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" onClick={() => router.push('/roadmap')}>
                    View Roadmap
                    <ArrowRight size={16} className="ml-2" />
                  </Button>
                </div>
              </motion.div>
            ) : null}

            {/* Custom Career Path Search */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <div className="glass-card rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-700/50">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                  Looking for a specific career path?
                </label>
                <div className="flex space-x-3">
                  <input
                    type="text"
                    value={customPath}
                    onChange={(e) => setCustomPath(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCustomSearch()}
                    placeholder="e.g. Cloud Architect, AI Engineer, DevOps Lead, Product Manager..."
                    className="flex-1 px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-600 bg-white dark:bg-surface-700 text-surface-900 dark:text-surface-100 placeholder-surface-400 dark:placeholder-surface-500 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  />
                  <Button
                    onClick={handleCustomSearch}
                    loading={searchLoading}
                    className="px-6"
                  >
                    <Search size={18} className="mr-2" />
                    Search
                  </Button>
                </div>
              </div>
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
                    hover
                    className={`h-full flex flex-col cursor-pointer transition-all duration-200 ${
                      selectedPath?._id === path._id 
                        ? 'ring-2 ring-emerald-500 shadow-lg' 
                        : ''
                    }`}
                    onClick={() => handleSelectPath(path)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-surface-400 mb-1 flex items-center gap-1.5">
                            <span>From</span>
                            <span className="text-surface-600 dark:text-surface-400 font-semibold truncate">{path.currentRole}</span>
                          </div>
                          <h3 className="text-xl font-bold text-surface-900 dark:text-white mb-2 leading-tight">{path.targetRole}</h3>
                          <div className="flex items-center space-x-2 mb-3">
                            <Badge className={getDifficultyColor(path.difficulty)} size="sm">
                              {path.difficulty}
                            </Badge>
                            <div className="flex items-center space-x-1">
                              {getMarketDemandIcon(path.marketDemand)}
                              <span className="text-xs text-surface-500 capitalize">
                                {path.marketDemand} demand
                              </span>
                            </div>
                          </div>
                        </div>
                        {selectedPath?._id === path._id && (
                          <CheckCircle className="w-6 h-6 text-emerald-600 shrink-0" />
                        )}
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col">
                      <div className="space-y-4 flex-1 flex flex-col">
                        {/* Timeline & Salary */}
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-surface-500" />
                            <span className="text-surface-600 dark:text-surface-400">
                              {path.timeToAchieve}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <DollarSign className="w-4 h-4 text-surface-500" />
                            <span className="text-surface-600 dark:text-surface-400">
                              {path.salaryRange}
                            </span>
                          </div>
                        </div>

                        {/* Reasoning */}
                        <p className="text-sm text-surface-600 dark:text-surface-400 line-clamp-3">
                          {path.reasoning}
                        </p>

                        {/* Required Skills */}
                        <div>
                          <p className="text-sm font-medium text-surface-900 dark:text-white mb-2">
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

                        {/* Spacer to push buttons to bottom */}
                        <div className="flex-1" />

                        {/* Action Buttons */}
                        <div className="flex space-x-2">
                          <Button
                            variant="secondary"
                            size="sm"
                            className="flex-1"
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedPathForDetails(path)
                              setShowPathDetails(true)
                            }}
                          >
                            <Info size={14} className="mr-1" />
                            Details
                          </Button>
                          <Button
                            variant={selectedPath?._id === path._id ? 'primary' : 'secondary'}
                            size="sm"
                            className="flex-1"
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
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Empty state */}
            {recommendations.length === 0 && !pageLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-16"
              >
                <div className="w-20 h-20 mx-auto mb-6 bg-surface-100 dark:bg-surface-800 rounded-full flex items-center justify-center">
                  <Target className="w-10 h-10 text-surface-400" />
                </div>
                <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-3">
                  Getting your recommendations...
                </h3>
                <p className="text-surface-500 dark:text-surface-400 max-w-md mx-auto mb-8 leading-relaxed">
                  The AI is ready to analyze your profile. Try searching for a specific role above, or upload a resume for deeper skill extraction.
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <Button onClick={() => router.push('/skill-audit')}>
                    Upload Resume
                  </Button>
                  <Button variant="secondary" onClick={() => window.location.reload()}>
                    Reload Page
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Selected Path Details */}
            {selectedPath && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <Card className="bg-white border-surface-200">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Target className="w-6 h-6 text-emerald-600" />
                      <span>Path to {selectedPath.targetRole}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Key Steps */}
                      <div>
                        <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center">
                          <Briefcase className="w-5 h-5 mr-2 text-emerald-600" />
                          Key Steps to Success
                        </h3>
                        <div className="space-y-3">
                          {selectedPath.keySteps.map((step, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="w-6 h-6 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">
                                  {index + 1}
                                </span>
                              </div>
                              <p className="text-surface-700 dark:text-surface-300 text-sm">
                                {step}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Skills Breakdown */}
                      <div>
                        <h3 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center">
                          <Star className="w-5 h-5 mr-2 text-emerald-600" />
                          Skills to Develop
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedPath.requiredSkills.map((skill, index) => (
                            <div key={index} className="flex items-center space-x-2 p-2 bg-surface-50 dark:bg-surface-800 rounded-lg">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                              <span className="text-sm text-surface-700 dark:text-surface-300">
                                {skill}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                      <p className="text-emerald-800 dark:text-emerald-200 text-sm">
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

      {/* Career Path Details Modal */}
      <Modal
        isOpen={showPathDetails}
        onClose={() => setShowPathDetails(false)}
        title={selectedPathForDetails?.targetRole || 'Path Details'}
        size="lg"
      >
        {selectedPathForDetails && (
          <div className="space-y-6">
            {/* Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <Badge className={getDifficultyColor(selectedPathForDetails.difficulty)} size="sm">
                {selectedPathForDetails.difficulty}
              </Badge>
              <div className="flex items-center space-x-1">
                {getMarketDemandIcon(selectedPathForDetails.marketDemand)}
                <span className="text-xs text-surface-500 capitalize">{selectedPathForDetails.marketDemand} demand</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">Time to Achieve</p>
                <p className="text-lg font-semibold text-surface-900 dark:text-white">{selectedPathForDetails.timeToAchieve}</p>
              </div>
              <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-xl">
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-1">Salary Range</p>
                <p className="text-lg font-semibold text-surface-900 dark:text-white">{selectedPathForDetails.salaryRange}</p>
              </div>
            </div>

            {/* Reasoning */}
            <div>
              <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">Why This Path</h4>
              <p className="text-surface-700 dark:text-surface-300 leading-relaxed">{selectedPathForDetails.reasoning}</p>
            </div>

            {/* Key Steps */}
            <div>
              <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-3">Key Steps to Success</h4>
              <div className="space-y-3">
                {(selectedPathForDetails.keySteps || []).map((step, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="w-7 h-7 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-emerald-600 dark:text-emerald-400 text-xs font-medium">{index + 1}</span>
                    </div>
                    <p className="text-surface-700 dark:text-surface-300 text-sm pt-1">{step}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Skills */}
            <div>
              <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-3">Skills to Develop</h4>
              <div className="grid grid-cols-2 gap-3">
                {(selectedPathForDetails.requiredSkills || []).map((skill, index) => (
                  <div key={index} className="flex items-center space-x-2 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                    <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                    <span className="text-sm text-surface-700 dark:text-surface-300">{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <Button variant="secondary" onClick={() => setShowPathDetails(false)}>Close</Button>
              <Button
                onClick={() => {
                  setShowPathDetails(false)
                  handleSelectPath(selectedPathForDetails)
                }}
              >
                Select This Path
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Replace Career Path Confirmation */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 mx-4 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-3">
              Replace Career Path?
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              You already have <strong>{userProfile?.selectedCareerPath?.targetRole}</strong> selected.
              Selecting <strong>{pendingPath?.targetRole}</strong> will replace it. Your current roadmap
              and progress for the existing path will remain accessible.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={handleCancelReplace}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleConfirmReplace}>
                Replace Path
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Replace Roadmap Confirmation */}
      {showRoadmapConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="glass-card rounded-xl p-6 mx-4 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-3">
              Generate New Roadmap?
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              You already have an active roadmap for <strong>{roadmap?.targetRole}</strong>.
              Generating a new one will replace it. Your current roadmap and its progress will no longer be active.
            </p>
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => { setShowRoadmapConfirm(false); setPendingRoadmapPath(null) }}>
                Cancel
              </Button>
              <Button variant="primary" onClick={() => { setShowRoadmapConfirm(false); proceedGenerateRoadmap(pendingRoadmapPath) }}>
                Generate New
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CareerPathPage