'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  BookOpen, 
  Play,
  ExternalLink,
  Target,
  TrendingUp,
  Award,
  FileText,
  Video,
  GraduationCap,
  Users,
  Flame,
  DollarSign,
  Sparkles,
  ChevronDown
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/context/ProgressContext'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Progress from '@/components/ui/Progress'
import Badge from '@/components/ui/Badge'
import { aiAPI, progressAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const RoadmapContent = () => {
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completingResource, setCompletingResource] = useState(null)
  const [showRoadmapPicker, setShowRoadmapPicker] = useState(false)
  const [switchingRoadmap, setSwitchingRoadmap] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, userProfile, getAuthToken, loading: authLoading } = useAuth()
  const { completeResource, addActivity, progress, roadmaps, roadmap: contextRoadmap, fetchUserProgress, switchRoadmap, loading: progressLoading } = useProgress()
  const fetchedRef = useRef(false)

  useEffect(() => {
    if (authLoading || !user || fetchedRef.current || progressLoading) return
    fetchedRef.current = true

    const urlId = searchParams.get('id')
    if (urlId && urlId !== contextRoadmap?._id) {
      switchRoadmap(urlId)
    } else {
      fetchRoadmap()
    }
  }, [user, authLoading, progressLoading])

  // Sync with context when roadmap switches
  useEffect(() => {
    if (contextRoadmap) setRoadmap(contextRoadmap)
    setSwitchingRoadmap(false)
  }, [contextRoadmap])

  const fetchRoadmap = async () => {
    try {
      setLoading(true)

      // Read selected career path — DB first, then sessionStorage as fallback
      const storedPath = typeof window !== 'undefined' ? sessionStorage.getItem('selectedPath') : null
      const sessionPath = storedPath ? JSON.parse(storedPath) : null
      const selectedPath = userProfile?.selectedCareerPath || sessionPath || null
      const targetRole = selectedPath?.targetRole || 'Senior Software Engineer'
      const requiredSkills = selectedPath?.requiredSkills || ['JavaScript', 'React', 'System Design', 'Leadership']

      const buildMockRoadmap = () => ({
        _id: '1',
        title: `Path to ${targetRole}`,
        targetRole,
        duration: {
          months: 6,
          hoursPerWeek: 10,
          totalHours: 240
        },
        overallProgress: 35,
        monthlyPlans: [
          {
            month: 1,
            title: `Foundation: ${requiredSkills[0] || targetRole} Basics`,
            focus: `Master the fundamentals of ${requiredSkills[0] || targetRole}`,
            skills: [requiredSkills[0] || 'Core Skills', ...(requiredSkills.slice(1, 3) || [])],
            status: 'completed',
            progress: 100,
            resources: [
              {
                title: `Advanced ${requiredSkills[0] || 'Core'} Course`,
                type: 'course',
                url: 'https://frontendmasters.com',
                provider: 'Frontend Masters',
                duration: '8 hours',
                difficulty: 'advanced',
                completed: true
              },
              {
                title: `${requiredSkills[0] || 'Core'} Best Practices`,
                type: 'book',
                url: 'https://www.oreilly.com',
                provider: 'O\'Reilly',
                duration: '20 hours',
                difficulty: 'intermediate',
                completed: true
              }
            ],
            milestones: [`Complete ${requiredSkills[0] || 'core'} training`, 'Build foundation project'],
            practiceProjects: [`${targetRole} starter project`]
          },
          {
            month: 2,
            title: `${requiredSkills[1] || 'Intermediate'} Deep Dive`,
            focus: `Develop expertise in ${requiredSkills[1] || 'advanced concepts'}`,
            skills: [requiredSkills[1] || 'Advanced Skills', requiredSkills[2] || 'Related Skills'],
            status: 'in_progress',
            progress: 60,
            resources: [
              {
                title: `${requiredSkills[1] || 'Advanced'} Mastery Course`,
                type: 'course',
                url: 'https://www.educative.io',
                provider: 'Educative',
                duration: '12 hours',
                difficulty: 'intermediate',
                completed: true
              },
              {
                title: `Applied ${requiredSkills[1] || 'Advanced'} Design`,
                type: 'book',
                url: 'https://dataintensive.net',
                provider: 'O\'Reilly',
                duration: '25 hours',
                difficulty: 'advanced',
                completed: false
              }
            ],
            milestones: [`Design a ${requiredSkills[1] || 'advanced'} solution`, 'Complete practice problems'],
            practiceProjects: [`${targetRole} intermediate project`]
          },
          {
            month: 3,
            title: `${requiredSkills[2] || 'Specialized'} & Integration`,
            focus: `Master ${requiredSkills[2] || 'specialized techniques'} and real-world application`,
            skills: [requiredSkills[2] || 'Specialized Skills', requiredSkills[3] || 'Integration'],
            status: 'planned',
            progress: 0,
            resources: [
              {
                title: `${requiredSkills[2] || 'Specialized'} Best Practices`,
                type: 'book',
                url: 'https://www.oreilly.com',
                provider: 'O\'Reilly',
                duration: '15 hours',
                difficulty: 'intermediate',
                completed: false
              },
              {
                title: `Advanced ${requiredSkills[2] || 'Specialized'} Course`,
                type: 'course',
                url: 'https://pluralsight.com',
                provider: 'Pluralsight',
                duration: '6 hours',
                difficulty: 'intermediate',
                completed: false
              }
            ],
            milestones: [`Lead ${requiredSkills[2] || 'specialized'} initiatives`, `Build ${targetRole} portfolio`],
            practiceProjects: [`${targetRole} capstone project`]
          }
        ],
        keyMilestones: [
          `Master ${requiredSkills[0] || 'core'} concepts`,
          `Complete ${requiredSkills[1] || 'intermediate'} fundamentals`,
          `Develop ${requiredSkills[2] || 'specialized'} expertise`,
          `Build portfolio of ${targetRole}-level projects`
        ],
        estimatedOutcome: `Ready for ${targetRole} role with strong technical and leadership skills`
      })

      // If roadmap already exists in DB (via progress context), show it
      if (contextRoadmap) {
        setRoadmap(contextRoadmap)
        setLoading(false)
        return
      }

      // Try AI call first (with 15s timeout)
      try {
        const token = await getAuthToken()
        const response = await aiAPI.generateRoadmap({
          targetRole,
          requiredSkills,
          timeframe: 6,
          hoursPerWeek: 10,
          currentSkills: userProfile?.skills || ['JavaScript', 'React']
        }, { timeout: 15000 })
        if (response.data?.success && response.data?.data?.roadmap) {
          setRoadmap(response.data.data.roadmap)
          fetchUserProgress() // refresh context so next visit finds saved roadmap
          setLoading(false)
          return
        }
      } catch (e) {
        console.warn('AI roadmap unavailable, using mock data:', e.message)
      }

      // Fallback to mock
      setRoadmap(buildMockRoadmap())
    } catch (error) {
      console.error('Failed to fetch roadmap:', error)
      toast.error('Failed to load roadmap')
    } finally {
      setLoading(false)
    }
  }

  const handleCompleteResource = async (monthIndex, resourceIndex) => {
    try {
      setCompletingResource(`${monthIndex}-${resourceIndex}`)
      
      // Update local state
      const updatedRoadmap = { ...roadmap }
      updatedRoadmap.monthlyPlans[monthIndex].resources[resourceIndex].completed = true
      
      // Calculate new progress for the month
      const month = updatedRoadmap.monthlyPlans[monthIndex]
      const completedResources = month.resources.filter(r => r.completed).length
      const totalResources = month.resources.length
      month.progress = Math.round((completedResources / totalResources) * 100)
      
      // Update overall progress
      const totalMonthProgress = updatedRoadmap.monthlyPlans.reduce((sum, m) => sum + m.progress, 0)
      updatedRoadmap.overallProgress = Math.round(totalMonthProgress / updatedRoadmap.monthlyPlans.length)
      
      // Save to backend
      try {
        await progressAPI.completeResource({
          roadmapId: roadmap._id,
          monthIndex,
          resourceIndex,
          hoursSpent: 1
        })
      } catch (e) {
        console.warn('Failed to persist resource completion:', e.message)
      }

      setRoadmap(updatedRoadmap)
      
      // Track activity
      await addActivity(
        'resource_completed',
        `Completed ${updatedRoadmap.monthlyPlans[monthIndex].resources[resourceIndex].title}`,
        { 
          resourceTitle: updatedRoadmap.monthlyPlans[monthIndex].resources[resourceIndex].title,
          monthTitle: updatedRoadmap.monthlyPlans[monthIndex].title
        }
      )
      
      toast.success('Resource completed! 🎯')
    } catch (error) {
      console.error('Failed to complete resource:', error)
      toast.error('Failed to update progress')
    } finally {
      setCompletingResource(null)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'planned': return 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-200'
      default: return 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-200'
    }
  }

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'course': return <GraduationCap className="w-4 h-4 text-blue-500" />
      case 'video': return <Video className="w-4 h-4 text-red-500" />
      case 'article': return <FileText className="w-4 h-4 text-green-500" />
      case 'book': return <BookOpen className="w-4 h-4 text-amber-600" />
      case 'tutorial': return <Play className="w-4 h-4 text-purple-500" />
      case 'practice': return <Target className="w-4 h-4 text-orange-500" />
      case 'project': return <Calendar className="w-4 h-4 text-cyan-500" />
      case 'certification': return <Award className="w-4 h-4 text-yellow-500" />
      case 'workshop': return <Users className="w-4 h-4 text-indigo-500" />
      case 'bootcamp': return <Flame className="w-4 h-4 text-red-600" />
      case 'documentation': return <FileText className="w-4 h-4 text-surface-500" />
      case 'guide': return <BookOpen className="w-4 h-4 text-teal-500" />
      default: return <BookOpen className="w-4 h-4 text-surface-400" />
    }
  }

  const getCostBadge = (resource) => {
    if (resource.cost?.amount) {
      return (
        <Badge variant="secondary" size="xs" className="flex items-center gap-0.5">
          <DollarSign size={10} />
          {resource.cost.amount}
        </Badge>
      )
    }
    if (resource.cost?.amount === 0 || resource.free) {
      return (
        <Badge variant="outline" size="xs" className="text-green-600 border-green-300">
          <Sparkles size={10} className="mr-0.5" />Free
        </Badge>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-surface-50 dark:bg-surface-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-surface-600 dark:text-surface-400">Loading your roadmap...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="flex h-screen bg-surface-50 dark:bg-surface-950">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Target className="w-16 h-16 text-surface-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
                No Roadmap Yet
              </h3>
              <p className="text-surface-600 dark:text-surface-400 mb-6">
                Generate a personalized learning roadmap to start your career growth journey.
              </p>
              <Button onClick={() => window.location.href = '/career-path'}>
                Create Roadmap
              </Button>
            </div>
          </main>
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
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-surface-900 dark:text-white mb-2">
                    {roadmap.title || `Path to ${roadmap.targetRole}`}
                  </h1>
                  <p className="text-surface-600 dark:text-surface-400">
                    Your personalized {roadmap.duration?.months || 6}-month learning journey to {roadmap.targetRole}
                  </p>
                </div>

                {roadmaps?.length > 1 && (
                  <div className="relative">
                    <button
                      onClick={() => setShowRoadmapPicker(!showRoadmapPicker)}
                      disabled={switchingRoadmap}
                      className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-sm text-surface-700 dark:text-surface-300 transition-all disabled:opacity-50"
                    >
                      {switchingRoadmap ? (
                        <>
                          <div className="w-4 h-4 border-2 border-surface-400 border-t-transparent rounded-full animate-spin" />
                          <span>Switching...</span>
                        </>
                      ) : (
                        <>
                          <span>Switch Roadmap</span>
                          <ChevronDown size={16} className={`transition-transform ${showRoadmapPicker ? 'rotate-180' : ''}`} />
                        </>
                      )}
                    </button>
                    {showRoadmapPicker && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowRoadmapPicker(false)} />
                        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 z-20 py-2 max-h-80 overflow-y-auto">
                          {roadmaps.filter(r => r.status !== 'abandoned').map(r => (
                            <button
                              key={r._id}
                              onClick={() => {
                                setSwitchingRoadmap(true)
                                router.push(`/roadmap?id=${r._id}`, { scroll: false })
                                switchRoadmap(r._id)
                                setShowRoadmapPicker(false)
                              }}
                              className={`w-full text-left px-4 py-3 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-all ${
                                r._id === roadmap._id ? 'bg-emerald-50 dark:bg-emerald-900/20 border-l-2 border-emerald-500' : ''
                              }`}
                            >
                              <div className="text-sm font-medium text-surface-900 dark:text-white">{r.title}</div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-xs text-surface-500 dark:text-surface-400">{r.targetRole}</span>
                                <span className={`text-xs px-1.5 py-0.5 rounded ${
                                  r.status === 'active' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                                  r.status === 'paused' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                  'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400'
                                }`}>{r.status}</span>
                              </div>
                              <div className="mt-1.5 h-1 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${r.overallProgress || 0}%` }} />
                              </div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </motion.div>

            {/* Progress Overview */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Overall Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-emerald-600 mb-1">
                        {roadmap.overallProgress ?? 0}%
                      </div>
                      <p className="text-sm text-surface-600 dark:text-surface-400">Complete</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-surface-900 dark:text-white mb-1">
                        {roadmap.duration?.months ?? 6}
                      </div>
                      <p className="text-sm text-surface-600 dark:text-surface-400">Months</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-surface-900 dark:text-white mb-1">
                        {roadmap.duration?.hoursPerWeek ?? 10}
                      </div>
                      <p className="text-sm text-surface-600 dark:text-surface-400">Hours/Week</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-surface-900 dark:text-white mb-1">
                        {roadmap.duration?.totalHours ?? 240}
                      </div>
                      <p className="text-sm text-surface-600 dark:text-surface-400">Total Hours</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Progress value={roadmap.overallProgress ?? 0} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Monthly Plans */}
            <div className="space-y-6">
              {(roadmap.monthlyPlans || []).map((month, index) => (
                <motion.div
                  key={month.month}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                >
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                            <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                              {month.month ?? index + 1}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-xl">{month.title}</CardTitle>
                            <p className="text-surface-600 dark:text-surface-400 text-sm mt-1">
                              {month.focus}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(month.status)} size="sm">
                            {month.status.replace('_', ' ')}
                          </Badge>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-surface-900 dark:text-white">
                              {month.progress ?? 0}%
                            </div>
                            <div className="text-xs text-surface-500">Complete</div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Resources */}
                        <div className="lg:col-span-2">
                          <h4 className="font-semibold text-surface-900 dark:text-white mb-4 flex items-center">
                            <BookOpen className="w-5 h-5 mr-2 text-emerald-600" />
                            Learning Resources
                          </h4>
                          <div className="space-y-3">
                            {(month.resources || []).map((resource, resourceIndex) => (
                              <div
                                key={resourceIndex}
                                className={`p-4 rounded-lg border transition-all duration-200 ${
                                  resource.completed
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'glass-card border-surface-200 dark:border-surface-700/50 hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      {getResourceTypeIcon(resource.type)}
                                      <h5 className="font-medium text-surface-900 dark:text-white">
                                        {resource.title}
                                      </h5>
                                      {resource.url && (
                                        <a
                                          href={resource.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-emerald-600 hover:text-emerald-700"
                                        >
                                          <ExternalLink size={16} />
                                        </a>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-surface-600 dark:text-surface-400">
                                      <span>{resource.provider}</span>
                                      <span>•</span>
                                      <span>{resource.duration}</span>
                                      <span>•</span>
                                      <Badge variant="outline" size="xs">
                                        {resource.difficulty}
                                      </Badge>
                                      {getCostBadge(resource)}
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    {resource.completed ? (
                                      <CheckCircle className="w-6 h-6 text-green-600" />
                                    ) : (
                                      <Button
                                        size="sm"
                                        variant="ghost"
                                        onClick={() => handleCompleteResource(index, resourceIndex)}
                                        loading={completingResource === `${index}-${resourceIndex}`}
                                      >
                                        <Circle className="w-4 h-4" />
                                      </Button>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Skills & Milestones */}
                        <div>
                          <div className="mb-6">
                            <h4 className="font-semibold text-surface-900 dark:text-white mb-3 flex items-center">
                              <TrendingUp className="w-5 h-5 mr-2 text-emerald-600" />
                              Skills Focus
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {(month.skills || []).map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="outline" size="sm">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-surface-900 dark:text-white mb-3 flex items-center">
                              <Award className="w-5 h-5 mr-2 text-emerald-600" />
                              Milestones
                            </h4>
                            <div className="space-y-2">
                              {(month.milestones || []).map((milestone, milestoneIndex) => (
                                <div key={milestoneIndex} className="flex items-start space-x-2">
                                  <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-sm text-surface-600 dark:text-surface-400">
                                    {milestone}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="mt-6">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                            Month {month.month} Progress
                          </span>
                          <span className="text-sm text-surface-500 dark:text-surface-400">
                            {month.progress ?? 0}%
                          </span>
                        </div>
                        <Progress value={month.progress ?? 0} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {/* Key Milestones */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Award className="w-6 h-6 mr-2 text-emerald-600" />
                    Key Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(roadmap.keyMilestones || []).map((milestone, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                        <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900 rounded-full flex items-center justify-center">
                          <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-surface-700 dark:text-surface-300">
                          {milestone}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                    <p className="text-emerald-800 dark:text-emerald-200">
                      <strong>Expected Outcome:</strong> {roadmap.estimatedOutcome}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function RoadmapPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen bg-surface-50 dark:bg-surface-950 items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <RoadmapContent />
    </Suspense>
  )
}
