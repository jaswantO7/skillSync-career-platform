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
import { useRouter } from 'next/navigation'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import ProgressCard from '@/components/dashboard/ProgressCard'
import CareerSummary from '@/components/dashboard/CareerSummary'
import UsageBar from '@/components/plans/UsageBar'
import GettingStarted from '@/components/dashboard/GettingStarted'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Progress from '@/components/ui/Progress'
import Badge from '@/components/ui/Badge'
import { authAPI } from '@/lib/api'
import Link from 'next/link'
import { MessageCircle, Map, Folder } from 'lucide-react'

const PLAN_LIMITS = {
  free: { maxMentorChatsPerMonth: 5, maxCareerRecommendations: Infinity, maxRoadmaps: 1, maxProjects: 3 },
  pro: { maxMentorChatsPerMonth: Infinity, maxCareerRecommendations: Infinity, maxRoadmaps: Infinity, maxProjects: Infinity },
  enterprise: { maxMentorChatsPerMonth: Infinity, maxCareerRecommendations: Infinity, maxRoadmaps: Infinity, maxProjects: Infinity },
}

const Dashboard = () => {
  const { user, userProfile, loading: authLoading } = useAuth()
  const { progress, roadmap, roadmaps, projects, stats, loading } = useProgress()
  const router = useRouter()
  const [recentActivity, setRecentActivity] = useState([])
  const [usage, setUsage] = useState(null)
  const [showGettingStarted, setShowGettingStarted] = useState(true)

  useEffect(() => {
    try {
      const hidden = localStorage.getItem('gs_hidden')
      if (hidden === 'true') setShowGettingStarted(false)
    } catch {}
  }, [])

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/signin'); return }
    if (userProfile && !userProfile.onboardingCompleted) {
      router.push('/onboarding')
    }
  }, [user, userProfile, authLoading])

  useEffect(() => {
    if (progress?.recentActivity) {
      setRecentActivity(progress.recentActivity.slice(0, 5))
    }
  }, [progress])

  useEffect(() => {
    if (authLoading || !user) return
    const fetchUsage = async () => {
      try {
        const res = await authAPI.getUsage()
        if (res.data?.success) setUsage(res.data.data)
      } catch { /* non-critical */ }
    }
    fetchUsage()
  }, [user, authLoading])

  const quickActions = [
    { title: 'Upload Resume', description: 'Get AI-powered skill analysis', href: '/skill-audit', icon: BookOpen, gradient: 'from-emerald-500 to-emerald-600' },
    { title: 'View Roadmap', description: 'Check your learning progress', href: '/roadmap', icon: Target, gradient: 'from-emerald-500 to-violet-500' },
    { title: 'Browse Projects', description: 'Find portfolio projects', href: '/projects', icon: Trophy, gradient: 'from-violet-500 to-violet-600' },
    { title: 'Chat with Mentor', description: 'Get career guidance', href: '/mentor', icon: Star, gradient: 'from-violet-500 to-emerald-500' },
  ]

  if (loading) {
    return (
      <div className="flex h-screen bg-surface-50 dark:bg-surface-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-8 h-8 mx-auto mb-4 text-emerald-600"></div>
            <p className="text-surface-500 dark:text-surface-400">Loading dashboard...</p>
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
          <div className="max-w-7xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-8">
                <h1 className="text-2xl md:text-3xl font-bold text-surface-900 dark:text-white mb-2">
                  Welcome back, {userProfile?.name || user?.displayName || 'there'}!
                </h1>
                <p className="text-surface-500 dark:text-surface-400">
                  Here's your career growth overview and recent progress.
                </p>
              </div>
            </motion.div>

            <GettingStarted
              visible={showGettingStarted}
              roadmaps={roadmaps}
              projects={projects}
              usage={usage}
              hasAnalysis={(userProfile?.skills?.length || 0) > 0 || (stats?.totalSkills || 0) > 0}
              onToggle={() => {
                const next = !showGettingStarted
                setShowGettingStarted(next)
                localStorage.setItem('gs_hidden', String(!next))
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}>
                <ProgressCard title="Total Points" value={stats.totalPoints} icon={Trophy} color="text-emerald-600" bgColor="bg-emerald-100" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <ProgressCard title="Current Level" value={stats.level} icon={TrendingUp} color="text-violet-600" bgColor="bg-violet-100" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <ProgressCard title="Current Streak" value={`${stats.streak?.current || 0} days`} icon={Calendar} color="text-emerald-600" bgColor="bg-emerald-100" />
              </motion.div>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                <ProgressCard title="Weekly Hours" value={`${stats.weeklyProgress?.hoursCompleted || 0}/${stats.weeklyProgress?.hoursTarget || 10}`} icon={Clock} color="text-violet-600" bgColor="bg-violet-100" />
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                  <CareerSummary roadmap={roadmap} userProfile={userProfile} />
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.6 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                              Learning Hours
                            </span>
                            <span className="text-sm text-surface-500 dark:text-surface-400">
                              {stats.weeklyProgress?.hoursCompleted || 0} / {stats.weeklyProgress?.hoursTarget || 10} hours
                            </span>
                          </div>
                          <Progress value={stats.weeklyProgress?.hoursCompleted || 0} max={stats.weeklyProgress?.hoursTarget || 10} color="primary" />
                        </div>
                        <div>
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                              Tasks Completed
                            </span>
                            <span className="text-sm text-surface-500 dark:text-surface-400">
                              {stats.weeklyProgress?.tasksCompleted || 0} / {stats.weeklyProgress?.tasksTarget || 5} tasks
                            </span>
                          </div>
                          <Progress value={stats.weeklyProgress?.tasksCompleted || 0} max={stats.weeklyProgress?.tasksTarget || 5} color="success" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                {projects && projects.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.7 }}>
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Active Projects</CardTitle>
                          <Link href="/projects">
                            <Button variant="ghost" size="sm">
                              View All <ArrowRight size={16} className="ml-2" />
                            </Button>
                          </Link>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {projects.slice(0, 3).map((project) => (
                            <div key={project._id} className="flex items-center justify-between p-4 bg-surface-50 dark:bg-surface-800/50 rounded-xl">
                              <div className="flex-1">
                                <h4 className="font-medium text-surface-900 dark:text-white">{project.title}</h4>
                                <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">{project.description}</p>
                                <div className="flex items-center space-x-2 mt-2">
                                  <Badge variant="outline" size="xs">{project.difficulty}</Badge>
                                  <span className="text-xs text-surface-400">{project.progress}% complete</span>
                                </div>
                              </div>
                              <div className="ml-4">
                                <Progress value={project.progress} size="sm" className="w-20" />
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </div>

              <div className="space-y-6">
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.75 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Monthly Usage</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <UsageBar label="Mentor Chat" used={usage?.mentorChats || 0} limit={PLAN_LIMITS[userProfile?.subscriptionPlan || 'free'].maxMentorChatsPerMonth} icon={MessageCircle} />
                        <UsageBar label="Career Paths" used={usage?.careerPathsGenerated || 0} limit={PLAN_LIMITS[userProfile?.subscriptionPlan || 'free'].maxCareerRecommendations} icon={Target} />
                        <UsageBar label="Roadmaps" used={usage?.roadmapsGenerated || 0} limit={PLAN_LIMITS[userProfile?.subscriptionPlan || 'free'].maxRoadmaps} icon={Map} />
                        <UsageBar label="Projects" used={usage?.projectsStarted || 0} limit={PLAN_LIMITS[userProfile?.subscriptionPlan || 'free'].maxProjects} icon={Folder} />
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.8 }}>
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
                              <div className="flex items-center p-3 rounded-xl bg-surface-50 dark:bg-surface-800/50 hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-all cursor-pointer">
                                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.gradient} flex items-center justify-center mr-3 shadow-sm`}>
                                  <Icon size={20} className="text-white" />
                                </div>
                                <div className="flex-1">
                                  <h4 className="font-medium text-surface-900 dark:text-white text-sm">{action.title}</h4>
                                  <p className="text-xs text-surface-500 dark:text-surface-400">{action.description}</p>
                                </div>
                                <ArrowRight size={16} className="text-surface-400" />
                              </div>
                            </Link>
                          )
                        })}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.9 }}>
                  <Card>
                    <CardHeader>
                      <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                      {recentActivity.length > 0 ? (
                        <div className="space-y-3">
                          {recentActivity.map((activity, index) => (
                            <div key={index} className="flex items-start space-x-3">
                              <div className="w-2 h-2 bg-emerald-500 rounded-full mt-2 flex-shrink-0"></div>
                              <div className="flex-1">
                                <p className="text-sm text-surface-900 dark:text-white">{activity.description}</p>
                                <p className="text-xs text-surface-500 dark:text-surface-400">{new Date(activity.timestamp).toLocaleDateString()}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-6">
                          <p className="text-surface-500 dark:text-surface-400 text-sm">
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