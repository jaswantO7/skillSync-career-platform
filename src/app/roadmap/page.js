'use client'

import { useState, useEffect } from 'react'
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
  Award
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/context/ProgressContext'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Progress from '@/components/ui/Progress'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'

const RoadmapPage = () => {
  const [roadmap, setRoadmap] = useState(null)
  const [loading, setLoading] = useState(true)
  const [completingResource, setCompletingResource] = useState(null)
  const { user, getAuthToken } = useAuth()
  const { completeResource, addActivity } = useProgress()

  useEffect(() => {
    fetchRoadmap()
  }, [])

  const fetchRoadmap = async () => {
    try {
      setLoading(true)
      
      // Mock roadmap data - replace with actual API call
      const mockRoadmap = {
        _id: '1',
        title: 'Path to Senior Software Engineer',
        targetRole: 'Senior Software Engineer',
        duration: {
          months: 6,
          hoursPerWeek: 10,
          totalHours: 240
        },
        overallProgress: 35,
        monthlyPlans: [
          {
            month: 1,
            title: 'Advanced JavaScript & ES6+',
            focus: 'Master modern JavaScript features and advanced concepts',
            skills: ['ES6+ Features', 'Async/Await', 'Promises', 'Modules'],
            status: 'completed',
            progress: 100,
            resources: [
              {
                title: 'JavaScript: The Advanced Parts',
                type: 'course',
                url: 'https://frontendmasters.com',
                provider: 'Frontend Masters',
                duration: '8 hours',
                difficulty: 'advanced',
                completed: true
              },
              {
                title: 'You Don\'t Know JS Book Series',
                type: 'book',
                url: 'https://github.com/getify/You-Dont-Know-JS',
                provider: 'GitHub',
                duration: '20 hours',
                difficulty: 'intermediate',
                completed: true
              }
            ],
            milestones: ['Complete advanced JS course', 'Build async data fetching project'],
            practiceProjects: ['Advanced Todo App with async operations']
          },
          {
            month: 2,
            title: 'System Design Fundamentals',
            focus: 'Learn system design principles and architectural patterns',
            skills: ['System Architecture', 'Database Design', 'Caching', 'Load Balancing'],
            status: 'in_progress',
            progress: 60,
            resources: [
              {
                title: 'System Design Interview Course',
                type: 'course',
                url: 'https://www.educative.io',
                provider: 'Educative',
                duration: '12 hours',
                difficulty: 'intermediate',
                completed: true
              },
              {
                title: 'Designing Data-Intensive Applications',
                type: 'book',
                url: 'https://dataintensive.net',
                provider: 'O\'Reilly',
                duration: '25 hours',
                difficulty: 'advanced',
                completed: false
              }
            ],
            milestones: ['Design a scalable web application', 'Complete system design problems'],
            practiceProjects: ['Design a chat application architecture']
          },
          {
            month: 3,
            title: 'Leadership & Code Review',
            focus: 'Develop leadership skills and code review expertise',
            skills: ['Code Review', 'Mentoring', 'Technical Leadership', 'Communication'],
            status: 'planned',
            progress: 0,
            resources: [
              {
                title: 'The Manager\'s Path',
                type: 'book',
                url: 'https://www.oreilly.com',
                provider: 'O\'Reilly',
                duration: '15 hours',
                difficulty: 'intermediate',
                completed: false
              },
              {
                title: 'Effective Code Reviews',
                type: 'course',
                url: 'https://pluralsight.com',
                provider: 'Pluralsight',
                duration: '6 hours',
                difficulty: 'intermediate',
                completed: false
              }
            ],
            milestones: ['Lead code review sessions', 'Mentor a junior developer'],
            practiceProjects: ['Create code review guidelines document']
          }
        ],
        keyMilestones: [
          'Master advanced JavaScript concepts',
          'Complete system design fundamentals',
          'Develop leadership and mentoring skills',
          'Build portfolio of senior-level projects'
        ],
        estimatedOutcome: 'Ready for Senior Software Engineer role with strong technical and leadership skills'
      }
      
      setRoadmap(mockRoadmap)
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
      case 'planned': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
    }
  }

  const getResourceTypeIcon = (type) => {
    switch (type) {
      case 'course': return <Play className="w-4 h-4" />
      case 'book': return <BookOpen className="w-4 h-4" />
      case 'tutorial': return <Play className="w-4 h-4" />
      case 'practice': return <Target className="w-4 h-4" />
      default: return <BookOpen className="w-4 h-4" />
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading your roadmap...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!roadmap) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <DashboardHeader />
          <main className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No Roadmap Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
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
                {roadmap.title}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Your personalized {roadmap.duration.months}-month learning journey to {roadmap.targetRole}
              </p>
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
                      <div className="text-3xl font-bold text-primary-600 mb-1">
                        {roadmap.overallProgress}%
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Complete</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {roadmap.duration.months}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Months</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {roadmap.duration.hoursPerWeek}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Hours/Week</p>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                        {roadmap.duration.totalHours}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Total Hours</p>
                    </div>
                  </div>
                  <div className="mt-6">
                    <Progress value={roadmap.overallProgress} className="h-3" />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Monthly Plans */}
            <div className="space-y-6">
              {roadmap.monthlyPlans.map((month, index) => (
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
                          <div className="w-12 h-12 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                            <span className="text-primary-600 dark:text-primary-400 font-bold">
                              {month.month}
                            </span>
                          </div>
                          <div>
                            <CardTitle className="text-xl">{month.title}</CardTitle>
                            <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                              {month.focus}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <Badge className={getStatusColor(month.status)} size="sm">
                            {month.status.replace('_', ' ')}
                          </Badge>
                          <div className="text-right">
                            <div className="text-lg font-semibold text-gray-900 dark:text-white">
                              {month.progress}%
                            </div>
                            <div className="text-xs text-gray-500">Complete</div>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Resources */}
                        <div className="lg:col-span-2">
                          <h4 className="font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                            <BookOpen className="w-5 h-5 mr-2 text-primary-600" />
                            Learning Resources
                          </h4>
                          <div className="space-y-3">
                            {month.resources.map((resource, resourceIndex) => (
                              <div
                                key={resourceIndex}
                                className={`p-4 rounded-lg border transition-all duration-200 ${
                                  resource.completed
                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                                    : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <div className="flex items-center space-x-2 mb-2">
                                      {getResourceTypeIcon(resource.type)}
                                      <h5 className="font-medium text-gray-900 dark:text-white">
                                        {resource.title}
                                      </h5>
                                      {resource.url && (
                                        <a
                                          href={resource.url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-primary-600 hover:text-primary-700"
                                        >
                                          <ExternalLink size={16} />
                                        </a>
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                                      <span>{resource.provider}</span>
                                      <span>•</span>
                                      <span>{resource.duration}</span>
                                      <span>•</span>
                                      <Badge variant="outline" size="xs">
                                        {resource.difficulty}
                                      </Badge>
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
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <TrendingUp className="w-5 h-5 mr-2 text-primary-600" />
                              Skills Focus
                            </h4>
                            <div className="flex flex-wrap gap-2">
                              {month.skills.map((skill, skillIndex) => (
                                <Badge key={skillIndex} variant="outline" size="sm">
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center">
                              <Award className="w-5 h-5 mr-2 text-primary-600" />
                              Milestones
                            </h4>
                            <div className="space-y-2">
                              {month.milestones.map((milestone, milestoneIndex) => (
                                <div key={milestoneIndex} className="flex items-start space-x-2">
                                  <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400">
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
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            Month {month.month} Progress
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            {month.progress}%
                          </span>
                        </div>
                        <Progress value={month.progress} />
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
                    <Award className="w-6 h-6 mr-2 text-primary-600" />
                    Key Milestones
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {roadmap.keyMilestones.map((milestone, index) => (
                      <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900 rounded-full flex items-center justify-center">
                          <span className="text-primary-600 dark:text-primary-400 text-sm font-medium">
                            {index + 1}
                          </span>
                        </div>
                        <p className="text-gray-700 dark:text-gray-300">
                          {milestone}
                        </p>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 p-4 bg-primary-50 dark:bg-primary-900/20 rounded-lg">
                    <p className="text-primary-800 dark:text-primary-200">
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

export default RoadmapPage