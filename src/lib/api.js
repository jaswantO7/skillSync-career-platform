import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
})

// Auth interceptor — attach Firebase ID token (auto-refreshed by Firebase)
api.interceptors.request.use(
  async (config) => {
    if (!config.headers.Authorization && typeof window !== 'undefined') {
      try {
        const { auth } = await import('@/lib/firebase')
        if (auth.currentUser) {
          const token = await auth.currentUser.getIdToken()
          config.headers.Authorization = `Bearer ${token}`
        }
      } catch {
        // Firebase not available
      }
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred'
    
    // Handle specific error cases
    if (error.response?.status === 401) {
      // Don't redirect — components handle auth errors per-context
    } else if (error.response?.status === 403) {
      toast.error('Access denied')
    } else if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.')
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.')
    }
    
    return Promise.reject(error)
  }
)

// API service functions
export const authAPI = {
  getProfile: () => api.get('/user/me'),
  updateProfile: (data) => api.post('/user/update', data),
  completeOnboarding: (data) => api.post('/user/complete-onboarding', data),
  getStats: () => api.get('/user/stats'),
  getUsage: () => api.get('/user/usage'),
  deleteAccount: () => api.delete('/user/account'),
  updatePlan: (plan) => api.post('/user/plan', { plan }),
}

export const aiAPI = {
  parseResume: (formData) => api.post('/ai/parseResume', formData, {
    timeout: 60000, // 60 seconds for file upload
  }),
  recommendPath: (data) => api.post('/ai/recommendPath', data),
  generateRoadmap: (data, config) => api.post('/ai/generateRoadmap', data, config),
  suggestProjects: (data) => api.post('/ai/suggestProjects', data),
  mentorChat: (data) => api.post('/ai/mentorChat', data),
  getChatHistory: () => api.get('/ai/mentorChat/history'),
  getHistory: () => api.get('/ai/history'),
  getAnalyses: () => api.get('/ai/analyses'),
  updateAnalysis: (id, data) => api.put(`/ai/analyses/${id}`, data),
  deleteAnalysis: (id) => api.delete(`/ai/analyses/${id}`),
}

export const progressAPI = {
  getProgress: (userId) => api.get(`/progress/${userId || ''}`),
  updateProgress: (data) => api.post('/progress/update', data),
  completeResource: (data) => api.post('/progress/complete-resource', data),
  completeDeliverable: (data) => api.post('/progress/complete-deliverable', data),
  getAnalytics: (timeframe) => api.get(`/progress/analytics/${timeframe}`),
  updateWeeklyGoals: (data) => api.post('/progress/weekly-goals', data),
}

export const projectAPI = {
  getUserProjects: () => api.get('/projects'),
  startProject: (data) => api.post('/projects/start', data),
  completeDeliverable: (data) => api.post('/projects/deliverable', data),
  removeProject: (id) => api.delete(`/projects/${id}`),
}

export const stripeAPI = {
  createCheckout: (plan) => api.post('/stripe/create-checkout', { plan }),
  getPortalLink: () => api.get('/stripe/portal'),
}

export const careerPathAPI = {
  save: (data) => api.post('/user/career-path', data),
}

// Utility functions
export const setAuthToken = (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
  } else {
    delete api.defaults.headers.common['Authorization']
  }
}

export const handleApiError = (error) => {
  console.error('API Error:', error)
  
  if (error.response?.data?.errors) {
    // Handle validation errors
    const errors = error.response.data.errors
    errors.forEach(err => toast.error(err))
  } else {
    const message = error.response?.data?.message || error.message || 'An error occurred'
    toast.error(message)
  }
  
  return error
}

// File upload helper
export const uploadFile = async (file, endpoint, onProgress) => {
  const formData = new FormData()
  formData.append('file', file)
  
  return api.post(endpoint, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (progressEvent) => {
      if (onProgress) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        )
        onProgress(percentCompleted)
      }
    },
  })
}

export default api