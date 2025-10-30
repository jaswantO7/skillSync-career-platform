'use client'

import { useState, useEffect } from 'react'
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
  Filter
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useProgress } from '@/context/ProgressContext'
import Sidebar from '@/components/dashboard/Sidebar'
import DashboardHeader from '@/components/dashboard/DashboardHeader'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Progress from '@/components/ui/Progress'
import Badge from '@/components/ui/Badge'
import { Modal, ModalHeader, ModalTitle } from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import toast from 'react-hot-toast'

const ProjectsPage = () => {
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all') // all, suggested, active, completed
  const [selectedProject, setSelectedProject] = useState(null)
  const [showDeliverableModal, setShowDeliverableModal] = useState(false)
  const [deliverableForm, setDeliverableForm] = useState({ url: '', notes: '' })
  const [submittingDeliverable, setSubmittingDeliverable] = useState(false)
  const { user, getAuthToken } = useAuth()
  const { completeDeliverable, addActivity } = useProgress()

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setLoading(true)
      
      // Mock projects data - replace with actual API call
      const mockProjects = [
        {
          _id: '1',
          title: 'E-commerce Dashboard',
          description: 'Build a comprehensive admin dashboard for an e-commerce platform with real-time analytics, inventory management, and order tracking.',
          difficulty: 'intermediate',
          estimatedHours: 40,
          skillsUsed: ['React', 'TypeScript', 'Chart.js', 'REST API'],
          technologies: ['React', 'TypeScript', 'Tailwind CSS', 'Chart.js'],
          status: 'active',
          progress: 65,
          deliverables: [
            {
              title: 'Dashboard Layout',
              description: 'Create responsive dashboard layout with navigation',
              type: 'code',
              completed: true,
              url: 'https://github.com/user/ecommerce-dashboard'
            },
            {
              title: 'Analytics Charts',
              description: 'Implement interactive charts for sales and user data',
              type: 'code',
              completed: true,
              url: 'https://github.com/user/ecommerce-dashboard'
            },
            {
              title: 'Inventory Management',
              description: 'Build inventory CRUD operations with search and filters',
              type: 'code',
              completed: false
            },
            {
              title: 'Live Demo',
              description: 'Deploy project and create live demo',
              type: 'deployment',
              completed: false
            }
          ],
          learningObjectives: ['Master React hooks', 'Learn data visualization', 'Practice API integration'],
          portfolioValue: 'Demonstrates full-stack development skills and modern UI/UX design',
          realWorldApplication: 'Similar to dashboards used by companies like Shopify, Amazon Seller Central'
        },
        {
          _id: '2',
          title: 'Task Management API',
          description: 'Design and build a RESTful API for a task management system with user authentication, team collaboration, and real-time notifications.',
          difficulty: 'advanced',
          estimatedHours: 60,
          skillsUsed: ['Node.js', 'Express', 'MongoDB', 'Socket.io', 'JWT'],
          technologies: ['Node.js', 'Express', 'MongoDB', 'Socket.io'],
          status: 'suggested',
          progress: 0,
          deliverables: [
            {
              title: 'API Design Document',
              description: 'Create comprehensive API documentation with endpoints',
              type: 'documentation',
              completed: false
            },
            {
              title: 'Authentication System',
              description: 'Implement JWT-based authentication and authorization',
              type: 'code',
              completed: false
            },
            {
              title: 'Core CRUD Operations',
              description: 'Build task and project management endpoints',
              type: 'code',
              completed: false
            },
            {
              title: 'Real-time Features',
              description: 'Add WebSocket support for live updates',
              type: 'code',
              completed: false
            }
          ],
          learningObjectives: ['Master backend development', 'Learn API design', 'Practice database modeling'],
          portfolioValue: 'Shows backend expertise and system design skills',
          realWorldApplication: 'Backend architecture similar to Asana, Trello, or Monday.com'
        },
        {
          _id: '3',
          title: 'Personal Portfolio Website',
          description: 'Create a stunning personal portfolio website showcasing your projects, skills, and experience with modern animations and responsive design.',
          difficulty: 'beginner',
          estimatedHours: 25,
          skillsUsed: ['HTML', 'CSS', 'JavaScript', 'Responsive Design'],
          technologies: ['Next.js', 'Tailwind CSS', 'Framer Motion'],
          status: 'completed',
          progress: 100,
          deliverables: [
            {
              title: 'Homepage Design',
              description: 'Create hero section and navigation',
              type: 'design',
              completed: true,
              url: 'https://myportfolio.dev'
            },
            {
              title: 'Projects Showcase',
              description: 'Build interactive projects gallery',
              type: 'code',
              completed: true,
              url: 'https://myportfolio.dev/projects'
            },
            {
              title: 'Contact Form',
              description: 'Implement working contact form with validation',
              type: 'code',
              completed: true,
              url: 'https://myportfolio.dev/contact'
            },
            {
              title: 'SEO Optimization',
              description: 'Optimize for search engines and performance',
              type: 'deployment',
              completed: true,
              url: 'https://myportfolio.dev'
            }
          ],
          learningObjectives: ['Learn modern CSS', 'Practice responsive design', 'Master animations'],
          portfolioValue: 'Essential for job applications and personal branding',
          realWorldApplication: 'Professional online presence for career opportunities'
        }
      ]
      
      setProjects(mockProjects)
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
      // Update project status to active
      const updatedProjects = projects.map(project => 
        project._id === projectId 
          ? { ...project, status: 'active' }
          : project
      )
      setProjects(updatedProjects)
      
      await addActivity(
        'project_started',
        `Started working on ${projects.find(p => p._id === projectId)?.title}`,
        { projectId }
      )
      
      toast.success('Project started! Good luck! 🚀')
    } catch (error) {
      console.error('Failed to start project:', error)
      toast.error('Failed to start project')
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
            status: newProgress === 100 ? 'completed' : 'active'
          }
        }
        return project
      })
      
      setProjects(updatedProjects)
      setSelectedProject(updatedProjects.find(p => p._id === selectedProject._id))
      
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
      case 'active': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
      case 'suggested': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
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

  const getProjectIcon = (technologies) => {
    if (technologies.some(tech => ['React', 'Vue', 'Angular'].includes(tech))) {
      return <Code className="w-6 h-6 text-blue-600" />
    }
    if (technologies.some(tech => ['Figma', 'Photoshop', 'Design'].includes(tech))) {
      return <Palette className="w-6 h-6 text-purple-600" />
    }
    if (technologies.some(tech => ['MongoDB', 'PostgreSQL', 'Database'].includes(tech))) {
      return <Database className="w-6 h-6 text-green-600" />
    }
    return <Globe className="w-6 h-6 text-primary-600" />
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="spinner w-8 h-8 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading projects...</p>
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
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Portfolio Projects
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    AI-suggested projects to build your portfolio and demonstrate your skills
                  </p>
                </div>
                <Button>
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
                <Filter className="w-5 h-5 text-gray-500" />
                <div className="flex space-x-2">
                  {[
                    { key: 'all', label: 'All Projects' },
                    { key: 'suggested', label: 'Suggested' },
                    { key: 'active', label: 'Active' },
                    { key: 'completed', label: 'Completed' }
                  ].map(({ key, label }) => (
                    <button
                      key={key}
                      onClick={() => setFilter(key)}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        filter === key
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Projects Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProjects.map((project, index) => (
                <motion.div
                  key={project._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                >
                  <Card className="h-full hover:shadow-lg transition-all duration-200">
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
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            <Clock size={16} className="inline mr-1" />
                            {project.estimatedHours}h
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                        {project.description}
                      </p>

                      {/* Technologies */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Technologies:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {project.technologies.map((tech, techIndex) => (
                            <Badge key={techIndex} variant="outline" size="xs">
                              {tech}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {/* Progress */}
                      {project.status !== 'suggested' && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Progress
                            </span>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {project.progress}%
                            </span>
                          </div>
                          <Progress value={project.progress} />
                        </div>
                      )}

                      {/* Deliverables */}
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                          Deliverables ({project.deliverables.filter(d => d.completed).length}/{project.deliverables.length}):
                        </p>
                        <div className="space-y-1">
                          {project.deliverables.slice(0, 3).map((deliverable, delIndex) => (
                            <div key={delIndex} className="flex items-center space-x-2">
                              {deliverable.completed ? (
                                <CheckCircle className="w-4 h-4 text-green-600" />
                              ) : (
                                <Circle className="w-4 h-4 text-gray-400" />
                              )}
                              <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                                {deliverable.title}
                              </span>
                              {deliverable.url && (
                                <a
                                  href={deliverable.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary-600 hover:text-primary-700"
                                >
                                  <ExternalLink size={12} />
                                </a>
                              )}
                            </div>
                          ))}
                          {project.deliverables.length > 3 && (
                            <p className="text-xs text-gray-500">
                              +{project.deliverables.length - 3} more deliverables
                            </p>
                          )}
                        </div>
                      </div>

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
                        
                        {project.status === 'active' && (
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
                          onClick={() => setSelectedProject(project)}
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
                <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No {filter !== 'all' ? filter : ''} projects found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
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
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                Next Deliverable:
              </h3>
              {(() => {
                const nextDeliverable = selectedProject.deliverables.find(d => !d.completed)
                return nextDeliverable ? (
                  <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <p className="font-medium text-gray-900 dark:text-white">
                      {nextDeliverable.title}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {nextDeliverable.description}
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-600 dark:text-gray-400">All deliverables completed!</p>
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={deliverableForm.notes}
                onChange={(e) => setDeliverableForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add any notes about your implementation, challenges faced, or what you learned..."
                rows={4}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
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