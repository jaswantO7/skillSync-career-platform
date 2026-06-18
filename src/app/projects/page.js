'use client'

import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { 
  FolderOpen, 
  Plus, 
  ExternalLink, 
  Github, 
  Clock, 
  CheckCircle,
  Circle,
  Star,
  Code,
  Palette,
  Database,
  Globe,
  Filter,
  ChevronDown,
  Map
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/context/ProgressContext'
import Sidebar from '@/components/dashboard/Sidebar'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Progress from '@/components/ui/Progress'
import Badge from '@/components/ui/Badge'
import { Modal, ModalHeader, ModalTitle } from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { aiAPI, projectAPI } from '@/lib/api'
import toast from 'react-hot-toast'

const ProjectsPage = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, suggested, active, completed
  const [selectedProject, setSelectedProject] = useState(null)
  const [showDeliverableModal, setShowDeliverableModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [deliverableForm, setDeliverableForm] = useState({ url: '', notes: '' })
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false)
  const [showRoadmapPicker, setShowRoadmapPicker] = useState(false)
  const [selectedRoadmapId, setSelectedRoadmapId] = useState(null)
  const { user, userProfile, getAuthToken, loading: authLoading } = useAuth()
  const { completeDeliverable, addActivity, roadmap, roadmaps } = useProgress()
  const fetchedRef = useRef(false)

  const projectRoadmap = selectedRoadmapId
    ? roadmaps.find(r => r._id === selectedRoadmapId)
    : roadmap
  const roadmapSkills = projectRoadmap?.monthlyPlans?.flatMap(p => p.skills).filter(Boolean) || []
  const projectTargetRole = projectRoadmap?.targetRole || userProfile?.selectedCareerPath?.targetRole || userProfile?.currentRole || 'Software Engineer'

  useEffect(() => {
    if (authLoading || !user || fetchedRef.current) return
    fetchedRef.current = true
    fetchProjects()
  }, [user, authLoading])

  const getRoadmapForPick = (pickId) => {
    return pickId ? roadmaps.find(r => r._id === pickId) : roadmap
  }

  const fetchProjects = async (pickerRoadmapId) => {
    try {
      setLoading(true)

      const effectiveRoadmap = pickerRoadmapId !== undefined
        ? getRoadmapForPick(pickerRoadmapId)
        : projectRoadmap
      const effectiveSkills = effectiveRoadmap?.monthlyPlans?.flatMap(p => p.skills).filter(Boolean) || []
      const effectiveTargetRole = effectiveRoadmap?.targetRole || userProfile?.selectedCareerPath?.targetRole || userProfile?.currentRole || 'Software Engineer'

      // 1. Fetch saved started projects from DB
      let savedProjects = []
      try {
        const savedRes = await projectAPI.getUserProjects()
        if (savedRes.data?.success) {
          savedProjects = savedRes.data.data.projects || []
        }
      } catch (e) {
        console.warn('Failed to fetch saved projects:', e.message)
      }

      // 2. Get AI suggestions (not saved to DB)
      let suggestions = []
      try {
        const token = await getAuthToken()
        const response = await aiAPI.suggestProjects({
          targetRole: effectiveTargetRole,
          skills: [...new Set([...(userProfile?.skills || []), ...effectiveSkills])],
          difficultyLevel: 'intermediate'
        })
        if (response.data?.success && response.data?.data?.projects?.length) {
          suggestions = response.data.data.projects.map((p, i) => ({
            ...p,
            _id: `suggestion-${i}`,
            status: 'suggested',
            progress: 0,
          }))
        }
      } catch (e) {
        console.warn('AI projects unavailable:', e.message)
      }

      // 3. Combine: saved started projects + new suggestions (exclude duplicates)
      const startedTitles = new Set(savedProjects.map(p => p.title.toLowerCase()))
      const freshSuggestions = suggestions.filter(s => !startedTitles.has(s.title.toLowerCase()))
      setProjects([...savedProjects, ...freshSuggestions])
    } catch (error) {
      console.error('Failed to fetch projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    if (filter === 'all') return true
    return project.status === filter
  })

  const handleStartProject = async (projectId) => {
    try {
      const project = projects.find(p => p._id === projectId)
      if (!project) return

      // Save to DB
      const res = await projectAPI.startProject({
        title: project.title,
        description: project.description,
        objective: project.objective,
        difficulty: project.difficulty,
        estimatedDuration: project.estimatedDuration,
        skillsUsed: project.skillsUsed,
        technologies: project.technologies,
        deliverables: project.deliverables,
        learningObjectives: project.learningObjectives,
        portfolioValue: project.portfolioValue,
        realWorldApplication: project.realWorldApplication,
        targetRole: projectTargetRole,
        roadmapId: projectRoadmap?._id,
      })

      // Replace suggestion with saved project
      const updatedProjects = projects.map(p =>
        p._id === projectId ? { ...res.data.data.project, _id: res.data.data.project._id } : p
      )
      setProjects(updatedProjects)
      
      await addActivity(
        'project_started',
        `Started working on ${project.title}`,
        { projectId: res.data.data.project._id }
      )
      
      toast.success('Project started! Good luck! 🚀')
    } catch (error) {
      console.error('Failed to start project:', error)
      toast.error('Failed to start project')
    }
  }

  const handleRequestNewProject = async () => {
    try {
      const token = await getAuthToken()
      const response = await aiAPI.suggestProjects({
        targetRole: projectTargetRole,
        skills: [...new Set([...(userProfile?.skills || []), ...roadmapSkills])],
        difficultyLevel: 'intermediate',
        _refresh: Date.now() // bust cache
      })
      if (response.data?.success && response.data?.data?.projects?.length) {
        const existingTitles = new Set(projects.map(p => p.title.toLowerCase()))
        const newProjects = response.data.data.projects
          .filter(p => !existingTitles.has(p.title.toLowerCase()))
          .map((p, i) => ({
          ...p,
          _id: `suggestion-${Date.now()}-${i}`,
          status: 'suggested',
          progress: 0,
        }))
        if (newProjects.length === 0) {
          toast.error('No new project suggestions available')
          return
        }
        setProjects(prev => [...prev, ...newProjects])
        toast.success('New project suggested!')
        return
      }
      toast.error('AI couldn\'t suggest a project right now')
    } catch (error) {
      console.error('Failed to request new project:', error)
      toast.error('Failed to suggest project')
    }
  }

  const handleSubmitDeliverable = async (e) => {
    e.preventDefault()
    
    if (!selectedProject || !deliverableForm.url.trim()) {
      toast.error('Please provide a URL for your deliverable')
      return
    }

    try {
      setSubmittingDeliverable(true)
      
      // Find the first incomplete deliverable
      const incompleteDeliverableIndex = selectedProject.deliverables.findIndex(d => !d.completed)
      
      if (incompleteDeliverableIndex === -1) {
        toast.error('All deliverables are already completed')
        return
      }

      // Update the deliverable
      const updatedProjects = projects.map(project => {
        if (project._id === selectedProject._id) {
          const updatedDeliverables = [...project.deliverables]
          updatedDeliverables[incompleteDeliverableIndex] = {
            ...updatedDeliverables[incompleteDeliverableIndex],
            completed: true,
            url: deliverableForm.url,
            notes: deliverableForm.notes
          }
          
          // Calculate new progress
          const completedCount = updatedDeliverables.filter(d => d.completed).length
          const newProgress = Math.round((completedCount / updatedDeliverables.length) * 100)
          
          return {
            ...project,
            deliverables: updatedDeliverables,
            progress: newProgress,
            status: newProgress === 100 ? 'completed' : 'in_progress'
          }
        }
        return project
      })
      
      setProjects(updatedProjects)
      setSelectedProject(updatedProjects.find(p => p._id === selectedProject._id))

      // Persist to DB
      try {
        await projectAPI.completeDeliverable({
          projectId: selectedProject._id,
          deliverableIndex: incompleteDeliverableIndex,
          url: deliverableForm.url,
          notes: deliverableForm.notes
        })
      } catch (e) {
        console.warn('Failed to persist deliverable:', e.message)
      }
      
      await addActivity(
        'deliverable_completed',
        `Completed ${selectedProject.deliverables[incompleteDeliverableIndex].title}`,
        { 
          projectTitle: selectedProject.title,
          deliverableTitle: selectedProject.deliverables[incompleteDeliverableIndex].title
        }
      )
      
      setShowDeliverableModal(false)
      setDeliverableForm({ url: '', notes: '' })
      toast.success('Deliverable submitted! 🎯')
    } catch (error) {
      console.error('Failed to submit deliverable:', error)
      toast.error('Failed to submit deliverable')
    } finally {
      setSubmittingDeliverable(false)
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      case 'in_progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'suggested': return 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-200'
      default: return 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-200'
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

  const getProjectIcon = (technologies = []) => {
    const techs = technologies.map(t => t.toLowerCase())
    if (techs.some(t => ['react', 'vue', 'angular', 'svelte', 'next.js', 'nextjs', 'frontend'].includes(t))) {
      return <Code className="w-6 h-6 text-blue-600" />
    }
    if (techs.some(t => ['figma', 'photoshop', 'design', 'ui', 'ux', 'tailwind', 'css', 'scss'].includes(t))) {
      return <Palette className="w-6 h-6 text-purple-600" />
    }
    if (techs.some(t => ['mongodb', 'postgresql', 'mysql', 'database', 'sql', 'redis', 'dynamodb'].includes(t))) {
      return <Database className="w-6 h-6 text-green-600" />
    }
    if (techs.some(t => ['node.js', 'nodejs', 'express', 'django', 'flask', 'api', 'graphql', 'backend'].includes(t))) {
      return <Globe className="w-6 h-6 text-orange-600" />
    }
    if (techs.some(t => ['python', 'java', 'golang', 'rust', 'c++', 'typescript', 'javascript', 'backend'].includes(t))) {
      return <Code className="w-6 h-6 text-yellow-600" />
    }
    return <Code className="w-6 h-6 text-emerald-600" />
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-surface-50 dark:bg-surface-950">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-surface-600 dark:text-surface-400">Loading projects...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-surface-50 dark:bg-surface-950">
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <main className="flex-1 overflow-y-auto p-3 sm:p-4 lg:p-6 pt-16 lg:pt-0">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-surface-900 dark:text-white mb-2">
                    Portfolio Projects
                  </h1>
                  <p className="text-sm sm:text-base text-surface-600 dark:text-surface-400">
                    AI-suggested projects to build your portfolio and demonstrate your skills
                  </p>
                </div>
                <Button onClick={handleRequestNewProject}>
                  <Plus size={20} className="mr-2" />
                  Request New Project
                </Button>
              </div>
            </motion.div>

            {/* Filters */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="mb-6"
            >
              <div className="flex items-center space-x-4">
                <Filter className="w-5 h-5 text-surface-500" />
                <div className="flex space-x-2">
                  {[
                    { key: 'all', label: 'All Projects' },
                    { key: 'suggested', label: 'Suggested' },
                    { key: 'in_progress', label: 'In Progress' },
                    { key: 'completed', label: 'Completed' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === key
                          ? 'bg-emerald-600 text-white'
                          : 'bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 hover:bg-surface-200 dark:hover:bg-surface-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Roadmap selector */}
            {roadmaps?.length > 1 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.12 }}
                className="mb-6"
              >
                <div className="flex items-center space-x-3">
                  <Map className="w-5 h-5 text-surface-500" />
                  <span className="text-sm text-surface-600 dark:text-surface-400">Base projects on:</span>
                  <div className="relative">
                    <button
                      onClick={() => setShowRoadmapPicker(!showRoadmapPicker)}
                      className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-sm text-surface-700 dark:text-surface-300 transition-all"
                    >
                      <span>{projectRoadmap?.title || 'Default (Active Roadmap)'}</span>
                      <ChevronDown size={14} className={`transition-transform ${showRoadmapPicker ? 'rotate-180' : ''}`} />
                    </button>
                    {showRoadmapPicker && (
                      <>
                        <div className="fixed inset-0 z-10" onClick={() => setShowRoadmapPicker(false)} />
                        <div className="absolute left-0 mt-1 w-64 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 z-20 py-1">
                          <button
                            onClick={() => { setSelectedRoadmapId(null); setShowRoadmapPicker(false); fetchProjects(null) }}
                            className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700/50 ${!selectedRoadmapId ? 'bg-emerald-50 dark:bg-emerald-900/20 font-medium' : ''}`}
                          >
                            Default (Active Roadmap)
                          </button>
                          {roadmaps.filter(r => r.status !== 'abandoned').map(r => (
                            <button
                              key={r._id}
                              onClick={() => { setSelectedRoadmapId(r._id); setShowRoadmapPicker(false); fetchProjects(r._id) }}
                              className={`w-full text-left px-3 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700/50 ${selectedRoadmapId === r._id ? 'bg-emerald-50 dark:bg-emerald-900/20 font-medium' : ''}`}
                            >
                              <div className="text-surface-900 dark:text-white">{r.title}</div>
                              <div className="text-xs text-surface-500 dark:text-surface-400">{r.targetRole}</div>
                            </button>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                >
                  <Card className="h-full flex flex-col hover:shadow-lg transition-all duration-200">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          {getProjectIcon(project.technologies)}
                          <div>
                            <CardTitle className="text-lg">{project.title}</CardTitle>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge className={getStatusColor(project.status)} size="sm">
                                {project.status}
                              </Badge>
                              <Badge className={getDifficultyColor(project.difficulty)} size="sm">
                                {project.difficulty}
                              </Badge>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm text-surface-500 dark:text-surface-400">
                            <Clock size={16} className="inline mr-1" />
                            {project.estimatedHours || project.estimatedDuration?.value || 'N/A'}{project.estimatedHours ? 'h' : (project.estimatedDuration?.unit || 'h')}
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent className="flex-1 flex flex-col">
                      <p className="text-surface-600 dark:text-surface-400 text-sm mb-4 line-clamp-3">
                        {project.description || 'No description available'}
                      </p>

                      {/* Technologies */}
                      {(project.technologies || []).length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-surface-900 dark:text-white mb-2">
                          Technologies:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(project.technologies || []).map((tech, techIndex) => (
                            <Badge key={techIndex} variant="outline" size="xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      )}

                      {/* Skills */}
                      {(project.skillsUsed || []).length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-medium text-surface-900 dark:text-white mb-2">
                          Skills:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {(project.skillsUsed || []).map((skill, skillIndex) => (
                            <Badge key={skillIndex} variant="outline" size="xs">
                              {skill}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      )}

                      {/* Progress */}
                      {project.status !== 'suggested' && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                              Progress
                            </span>
                            <span className="text-sm text-surface-500 dark:text-surface-400">
                              {project.progress ?? 0}%
                            </span>
                          </div>
                          <Progress value={project.progress ?? 0} />
                        </div>
                      )}

                      {/* Deliverables */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-surface-900 dark:text-white mb-2">
                          Deliverables ({(project.deliverables || []).filter(d => d.completed).length}/{(project.deliverables || []).length}):
                        </p>
                        <div className="space-y-1">
                          {(project.deliverables || []).slice(0, 3).map((deliverable, delIndex) => (
                            <div key={delIndex} className="flex items-center space-x-2">
                              {deliverable.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-surface-400" />
                              )}
                              <span className="text-xs text-surface-600 dark:text-surface-400 truncate">
                                {deliverable.title}
                              </span>
                              {deliverable.url && (
                                <a
                                  href={deliverable.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-emerald-600 hover:text-emerald-700"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          ))}
                          {(project.deliverables || []).length > 3 && (
                            <p className="text-xs text-surface-500">
                              +{(project.deliverables || []).length - 3} more deliverables
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Spacer */}
                      <div className="flex-1" />

                      {/* Actions */}
                      <div className="flex space-x-2">
                        {project.status === 'suggested' && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => handleStartProject(project._id)}
                          >
                            Start Project
                          </Button>
                        )}
                        
                        {project.status === 'in_progress' && (
                          <Button
                            size="sm"
                            className="flex-1"
                            onClick={() => {
                              setSelectedProject(project)
                              setShowDeliverableModal(true)
                            }}
                          >
                            Submit Work
                          </Button>
                        )}
                        
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project)
                            setShowDetailsModal(true)
                          }}
                        >
                          View Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>

            {filteredProjects.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="text-center py-12"
              >
                <FolderOpen className="w-16 h-16 text-surface-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
                  No {filter !== 'all' ? filter : ''} projects found
                </h3>
                <p className="text-surface-600 dark:text-surface-400 mb-6">
                  {filter === 'all' 
                    ? 'Get started by requesting AI-suggested projects for your skill level.'
                    : `You don't have any ${filter} projects yet.`
                  }
                </p>
                <Button>
                  <Plus size={20} className="mr-2" />
                  Request Projects
                </Button>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      {/* Project Details Modal */}
      <Modal
        isOpen={showDetailsModal}
        onClose={() => setShowDetailsModal(false)}
        title={selectedProject?.title || 'Project Details'}
        size="lg"
      >
        {selectedProject && (
          <div className="space-y-6">
            {/* Status + Badges */}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                selectedProject.status === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                selectedProject.status === 'in_progress' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' :
                selectedProject.status === 'suggested' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' :
                'bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-300'
              }`}>{selectedProject.status.replace('_', ' ')}</span>
              {selectedProject.difficulty && (
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedProject.difficulty === 'beginner' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
                  selectedProject.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                }`}>{selectedProject.difficulty}</span>
              )}
              {selectedProject.progress !== undefined && (
                <span className="px-3 py-1 rounded-full text-xs font-medium bg-surface-100 text-surface-800 dark:bg-surface-700 dark:text-surface-300">{selectedProject.progress}% complete</span>
              )}
            </div>

            {/* Description */}
            <div>
              <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">Description</h4>
              <p className="text-surface-900 dark:text-white leading-relaxed">{selectedProject.description || 'No description'}</p>
            </div>

            {/* Objective */}
            {selectedProject.objective && (
            <div>
              <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">Objective</h4>
              <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">{selectedProject.objective}</p>
            </div>
            )}

            {/* Meta Info Grid */}
            <div className="grid grid-cols-2 gap-4">
              {selectedProject.difficulty && (
              <div>
                <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-1">Difficulty</h4>
                <p className="text-sm text-surface-700 dark:text-surface-300 capitalize">{selectedProject.difficulty}</p>
              </div>
              )}
              {selectedProject.estimatedDuration && (
              <div>
                <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-1">Duration</h4>
                <p className="text-sm text-surface-700 dark:text-surface-300">{selectedProject.estimatedDuration.value} {selectedProject.estimatedDuration.unit}</p>
              </div>
              )}
              {selectedProject.estimatedHours > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-1">Est. Hours</h4>
                <p className="text-sm text-surface-700 dark:text-surface-300">{selectedProject.estimatedHours}h</p>
              </div>
              )}
              {selectedProject.targetRole && (
              <div>
                <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-1">Target Role</h4>
                <p className="text-sm text-surface-700 dark:text-surface-300">{selectedProject.targetRole}</p>
              </div>
              )}
            </div>

            {/* Technologies */}
            {(selectedProject.technologies || []).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">Technologies</h4>
              <div className="flex flex-wrap gap-2">
                {(selectedProject.technologies || []).map((tech, i) => (
                  <span key={i} className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full text-sm">{tech}</span>
                ))}
              </div>
            </div>
            )}

            {/* Skills to Practice */}
            {(selectedProject.skillsToPractice || selectedProject.skillsUsed || []).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">Skills to Practice</h4>
              <div className="flex flex-wrap gap-2">
                {(selectedProject.skillsToPractice || selectedProject.skillsUsed || []).map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-surface-100 dark:bg-surface-700 rounded-full text-sm text-surface-700 dark:text-surface-300">{skill}</span>
                ))}
              </div>
            </div>
            )}

            {/* Deliverables */}
            <div>
              <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">Deliverables ({selectedProject.deliverables?.filter(d => d.completed).length || 0}/{selectedProject.deliverables?.length || 0})</h4>
              <div className="space-y-2">
                {(selectedProject.deliverables || []).map((d, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      {d.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-500 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-surface-400 shrink-0" />
                      )}
                      <div>
                        <p className="text-sm font-medium text-surface-900 dark:text-white">{d.title}</p>
                        {d.description && <p className="text-xs text-surface-500 dark:text-surface-400 mt-0.5">{d.description}</p>}
                        {d.type && <span className="inline-block mt-1 text-xs text-surface-400 dark:text-surface-500 capitalize bg-surface-200 dark:bg-surface-700 px-2 py-0.5 rounded">{d.type}</span>}
                      </div>
                    </div>
                    {d.url && (
                      <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:text-emerald-700 shrink-0 ml-2">
                        <ExternalLink size={16} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Learning Objectives */}
            {(selectedProject.learningObjectives || []).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">Learning Objectives</h4>
              <ul className="list-disc list-inside space-y-1">
                {(selectedProject.learningObjectives || []).map((obj, i) => (
                  <li key={i} className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">{obj}</li>
                ))}
              </ul>
            </div>
            )}

            {/* Portfolio Value */}
            {selectedProject.portfolioValue && (
            <div>
              <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">Portfolio Value</h4>
              <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">{selectedProject.portfolioValue}</p>
            </div>
            )}

            {/* Real-World Application */}
            {selectedProject.realWorldApplication && (
            <div>
              <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">Real-World Application</h4>
              <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed">{selectedProject.realWorldApplication}</p>
            </div>
            )}

            {/* Resources */}
            {(selectedProject.resources || []).length > 0 && (
            <div>
              <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">Resources</h4>
              <div className="space-y-2">
                {(selectedProject.resources || []).map((r, i) => (
                  <a key={i} href={r.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-surface-50 dark:bg-surface-800 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{r.title}</p>
                      {r.type && <span className="text-xs text-surface-400 dark:text-surface-500 capitalize">{r.type}</span>}
                    </div>
                    <ExternalLink size={16} className="text-surface-400 shrink-0 ml-2" />
                  </a>
                ))}
              </div>
            </div>
            )}

            {/* Links */}
            {(selectedProject.githubUrl || selectedProject.liveUrl) && (
            <div>
              <h4 className="text-xs font-semibold text-surface-400 dark:text-surface-500 uppercase tracking-wider mb-2">Links</h4>
              <div className="flex flex-wrap gap-3">
                {selectedProject.githubUrl && (
                  <a href={selectedProject.githubUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-sm text-emerald-600 hover:text-emerald-700">
                    <Github size={16} />
                    <span>View on GitHub</span>
                  </a>
                )}
                {selectedProject.liveUrl && (
                  <a href={selectedProject.liveUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center space-x-2 text-sm text-emerald-600 hover:text-emerald-700">
                    <ExternalLink size={16} />
                    <span>Live Demo</span>
                  </a>
                )}
              </div>
            </div>
            )}

            {/* Dates */}
            {(selectedProject.startDate || selectedProject.completedDate) && (
            <div className="grid grid-cols-2 gap-4 text-sm text-surface-500 dark:text-surface-400">
              {selectedProject.startDate && <p>Started: {new Date(selectedProject.startDate).toLocaleDateString()}</p>}
              {selectedProject.completedDate && <p>Completed: {new Date(selectedProject.completedDate).toLocaleDateString()}</p>}
            </div>
            )}

            <div className="flex justify-end pt-2">
              <Button variant="secondary" onClick={() => setShowDetailsModal(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Submit Deliverable Modal */}
      <Modal
        isOpen={showDeliverableModal}
        onClose={() => setShowDeliverableModal(false)}
        title="Submit Deliverable"
        size="md"
      >
        {selectedProject && (
          <form onSubmit={handleSubmitDeliverable} className="space-y-4">
            <div>
              <h3 className="font-medium text-surface-900 dark:text-white mb-2">
                Next Deliverable:
              </h3>
              {(() => {
                const nextDeliverable = selectedProject.deliverables.find(d => !d.completed)
                return nextDeliverable ? (
                  <div className="p-3 bg-surface-50 dark:bg-surface-800 rounded-lg">
                    <p className="font-medium text-surface-900 dark:text-white">
                      {nextDeliverable.title}
                    </p>
                    <p className="text-sm text-surface-600 dark:text-surface-400 mt-1">
                      {nextDeliverable.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-surface-600 dark:text-surface-400">All deliverables completed!</p>
                )
              })()}
            </div>

            <Input
              label="Project URL"
              type="url"
              value={deliverableForm.url}
              onChange={(e) => setDeliverableForm(prev => ({ ...prev, url: e.target.value }))}
              placeholder="https://github.com/username/project or https://project-demo.com"
              required
              disabled={submittingDeliverable}
            />

            <div>
              <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={deliverableForm.notes}
                onChange={(e) => setDeliverableForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about your implementation, challenges faced, or what you learned..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-600 glass-card text-surface-900 dark:text-surface-100 placeholder-surface-500 dark:placeholder-surface-400 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                disabled={submittingDeliverable}
              />
            </div>

            <div className="flex space-x-3">
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowDeliverableModal(false)}
                disabled={submittingDeliverable}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                loading={submittingDeliverable}
                className="flex-1"
              >
                Submit Deliverable
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  )
}

export default ProjectsPage