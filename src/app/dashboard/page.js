'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Target, 
  TrendingUp, 
  BookOpen, 
  Trophy, 
  Calendar,
  ArrowRight,
  Plus,
  Clock,
  Star
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/context/ProgressContext'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import ProgressCard from '@/components/dashboard/ProgressCard'
import CareerSummary from '@/components/dashboard/CareerSummary'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Progress from '@/components/ui/Progress'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'

const Dashboard = () => {
  const { user, userProfile } = useAuth()
  const { progress, roadmap, projects, stats, loading } = useProgress()
  const [recentActivity, setRecentActivity] = useState([])

  useEffect(() => {
    if (progress?.recentActivity) {
      setRecentActivity(progress.recentActivity.slice(0, 5))
    }
  }, [progress])

  const quickActions = [
    {
      title: 'Upload Resume',
      description: 'Get AI-powered skill analysis',
      href: '/skill-audit',
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'View Roadmap',
      description: 'Check your learning progress',
      href: '/roadmap',
      icon: Target,
      color: 'bg-green-500'
    },
    {
      title: 'Browse Projects',
      description: 'Find portfolio projects',
      href: '/projects',
      icon: Trophy,
      color: 'bg-purple-500'
    },
    {
      title: 'Chat with Mentor',
      description: 'Get career guidance',
      href: '/mentor',
      icon: Star,
      color: 'bg-yellow-500'
    }
  ]

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading dashboard...</p>
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
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Welcome Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                  Welcome back, {userProfile?.name || user?.displayName || 'there'}! 👋
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Here's your career growth overview and recent progress.
                </p>
              </div>
            </motion.div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
              >
                <ProgressCard
                  title="Total Points"
                  value={stats.totalPoints}
                  icon={Trophy}
                  color="text-yellow-600"
                  bgColor="bg-yellow-100"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
              >
                <ProgressCard
                  title="Current Level"
                  value={stats.level}
                  icon={TrendingUp}
                  color="text-blue-600"
                  bgColor="bg-blue-100"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
              >
                <ProgressCard
                  title="Current Streak"
                  value={`${stats.streak?.current || 0} days`}
                  icon={Calendar}
                  color="text-green-600"
                  bgColor="bg-green-100"
                />
              </motion.div>
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <ProgressCard
                  title="Weekly Hours"
                  value={`${stats.weeklyProgress?.hoursCompleted || 0}/${stats.weeklyProgress?.hoursTarget || 10}`}
                  icon={Clock}
                  color="text-purple-600"
                  bgColor="bg-purple-100"
                />
              </motion.div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column */}
              <div className="lg:col-span-2 space-y-6">
                {/* Career Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                >
                  <CareerSummary roadmap={roadmap} userProfile={userProfile} />
                </motion.div>

                {/* Weekly Progress */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Learning Hours
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {stats.weeklyProgress?.hoursCompleted || 0} / {stats.weeklyProgress?.hoursTarget || 10} hours
                            </span>
                          </div>
                          <Progress 
                            value={stats.weeklyProgress?.hoursCompleted || 0} 
                            max={stats.weeklyProgress?.hoursTarget || 10}
                            color="primary"
                          />
                        </div>
                        
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Tasks Completed
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {stats.weeklyProgress?.tasksCompleted || 0} / {stats.weeklyProgress?.tasksTarget || 5} tasks
                            </span>
                          </div>
                          <Progress 
                            value={stats.weeklyProgress?.tasksCompleted || 0} 
                            max={stats.weeklyProgress?.tasksTarget || 5}
                            color="success"
                          />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Active Projects */}
                {projects && projects.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                  >
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Active Projects</CardTitle>
                          <Link href="/projects">
                            <Button variant="ghost" size="sm">
                              View All
                              <ArrowRight size={16} className="ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {projects.slice(0, 3).map((project) => (
                            <div key={project._id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                              <div className="flex-1">
                                <h4 className="font-medium text-gray-900 dark:text-white">
                                  {project.title}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                  {project.description}
                                </p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline" size="xs">
                                    {project.difficulty}
                                  </Badge>
                                  <span className="text-xs text-gray-500">
                                    {project.progress}% complete
                                  </span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <Progress 
                                  value={project.progress} 
                                  size="sm" 
                                  className="w-20"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              {/* Right Column */}
              <div className="space-y-6">
                {/* Quick Actions */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.8 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {quickActions.map((action) => {
                          const Icon = action.icon
                          return (
                            <Link key={action.title} href={action.href}>
                              <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                                <div className={`w-10 h-10 ${action.color} rounded-lg flex items-center justify-center mr-3`}>
                                  <Icon size={20} className="text-white" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-gray-900 dark:text-white text-sm">
                                    {action.title}
                                  </h4>
                                  <p className="text-xs text-gray-600 dark:text-gray-400">
                                    {action.description}
                                  </p>
                                </div>
                                <ArrowRight size={16} className="text-gray-400" />
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.9 }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentActivity.length > 0 ? (
                        <div className="space-y-3">
                          {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <p className="text-sm text-gray-900 dark:text-white">
                                  {activity.description}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                  {new Date(activity.timestamp).toLocaleDateString()}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-gray-500 dark:text-gray-400 text-sm">
                            No recent activity yet. Start learning to see your progress here!
                          </p>
                          <Link href="/skill-audit">
                            <Button variant="primary" size="sm" className="mt-3">
                              Get Started
                            </Button>
                          </Link>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default Dashboard