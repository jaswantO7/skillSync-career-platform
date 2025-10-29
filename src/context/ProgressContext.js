'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { useAuth } from './AuthContext'
import { api } from '@/lib/api'
import toast from 'react-hot-toast'

const ProgressContext = createContext({})

export const useProgress = () => {
  const context = useContext(ProgressContext)
  if (!context) {
    throw new Error('useProgress must be used within a ProgressProvider')
  }
  return context
}

export const ProgressProvider = ({ children }) => {
  const { user, getAuthToken } = useAuth()
  const [progress, setProgress] = useState(null)
  const [roadmap, setRoadmap] = useState(null)
  const [projects, setProjects] = useState([])
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState({
    totalPoints: 0,
    level: 1,
    streak: { current: 0, longest: 0 },
    weeklyProgress: { hoursCompleted: 0, hoursTarget: 10 }
  })

  useEffect(() => {
    if (user) {
      fetchUserProgress()
      fetchUserStats()
    }
  }, [user])

  const fetchUserProgress = async () => {
    try {
      setLoading(true)
      const token = await getAuthToken()
      const response = await api.get('/progress', {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      const data = response.data.data
      setProgress(data.progress)
      setRoadmap(data.activeRoadmap)
      setProjects(data.activeProjects || [])
    } catch (error) {
      console.error('Fetch progress error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserStats = async () => {
    try {
      const token = await getAuthToken()
      const response = await api.get('/user/stats', {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(response.data.data)
    } catch (error) {
      console.error('Fetch stats error:', error)
    }
  }

  const updateProgress = async (activityData) => {
    try {
      const token = await getAuthToken()
      const response = await api.post('/progress/update', activityData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setProgress(response.data.data)
      await fetchUserStats() // Refresh stats
      
      // Show achievement notification if level increased
      if (response.data.data.level > stats.level) {
        toast.success(`🎉 Level up! You're now level ${response.data.data.level}!`, {
          duration: 6000,
        })
      }
      
      return response.data.data
    } catch (error) {
      console.error('Update progress error:', error)
      toast.error('Failed to update progress')
      throw error
    }
  }

  const completeResource = async (roadmapId, monthIndex, resourceIndex, hoursSpent = 1) => {
    try {
      const token = await getAuthToken()
      const response = await api.post('/progress/complete-resource', {
        roadmapId,
        monthIndex,
        resourceIndex,
        hoursSpent
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setRoadmap(response.data.data.roadmap)
      await fetchUserProgress()
      toast.success('Resource completed! 🎯')
      
      return response.data.data
    } catch (error) {
      console.error('Complete resource error:', error)
      toast.error('Failed to complete resource')
      throw error
    }
  }

  const completeDeliverable = async (projectId, deliverableIndex, url, notes) => {
    try {
      const token = await getAuthToken()
      const response = await api.post('/progress/complete-deliverable', {
        projectId,
        deliverableIndex,
        url,
        notes
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      // Update projects list
      setProjects(prev => prev.map(project => 
        project._id === projectId ? response.data.data.project : project
      ))
      
      await fetchUserProgress()
      
      if (response.data.data.isProjectComplete) {
        toast.success('🚀 Project completed! Great work!')
      } else {
        toast.success('Deliverable completed! ✅')
      }
      
      return response.data.data
    } catch (error) {
      console.error('Complete deliverable error:', error)
      toast.error('Failed to complete deliverable')
      throw error
    }
  }

  const updateWeeklyGoals = async (hoursTarget, tasksTarget) => {
    try {
      const token = await getAuthToken()
      const response = await api.post('/progress/weekly-goals', {
        hoursTarget,
        tasksTarget
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })
      
      setStats(prev => ({
        ...prev,
        weeklyProgress: response.data.data
      }))
      
      toast.success('Weekly goals updated!')
      return response.data.data
    } catch (error) {
      console.error('Update weekly goals error:', error)
      toast.error('Failed to update weekly goals')
      throw error
    }
  }

  const getProgressAnalytics = async (timeframe = 30) => {
    try {
      const token = await getAuthToken()
      const response = await api.get(`/progress/analytics/${timeframe}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      return response.data.data
    } catch (error) {
      console.error('Get analytics error:', error)
      throw error
    }
  }

  const addActivity = async (type, description, metadata = {}) => {
    return await updateProgress({
      type,
      description,
      metadata
    })
  }

  const value = {
    progress,
    roadmap,
    projects,
    stats,
    loading,
    fetchUserProgress,
    fetchUserStats,
    updateProgress,
    completeResource,
    completeDeliverable,
    updateWeeklyGoals,
    getProgressAnalytics,
    addActivity,
  }

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  )
}