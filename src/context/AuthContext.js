'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  sendPasswordResetEmail,
  updateProfile
} from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { api, setAuthToken } from '@/lib/api'
import toast from 'react-hot-toast'
import Cookies from 'js-cookie'          // ✅ NEW

const AuthContext = createContext({})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [userProfile, setUserProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [authLoading, setAuthLoading] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          const token = await firebaseUser.getIdToken()

          // ✅ Always sync token cookie during state updates
          Cookies.set("auth-token", token, {
            expires: 7,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/"
          })

          setAuthToken(token)
          setUser(firebaseUser)   // set user immediately so navigation works even if profile fetch fails

          const response = await api.get("/user/me", {
            headers: { Authorization: `Bearer ${token}` },
          })
          setUserProfile(response.data.data.user)
        } else {
          Cookies.remove("auth-token")  // ✅ remove cookie on no user
          setUser(null)
          setUserProfile(null)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        toast.error('Failed to load user profile')
      } finally {
        setLoading(false)
      }
    })

    return unsubscribe
  }, [])

  const signUp = async (email, password, name) => {
    setAuthLoading(true)
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(result.user, { displayName: name })

      // ✅ Set token cookie after signup
      const token = await result.user.getIdToken()
      Cookies.set("auth-token", token, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
      })

      toast.success('Account created successfully!')
      return result
    } catch (error) {
      console.error('Sign up error:', error)
      toast.error(error.message || 'Failed to create account')
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  const signIn = async (email, password) => {
    setAuthLoading(true)
    try {
      const result = await signInWithEmailAndPassword(auth, email, password)

      // ✅ Store Firebase token in cookie for middleware
      const token = await result.user.getIdToken()
      Cookies.set("auth-token", token, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
      })

      toast.success('Welcome back!')
      return result
    } catch (error) {
      console.error('Sign in error:', error)
      toast.error(error.message || 'Failed to sign in')
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setAuthLoading(true)
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      // ✅ Set token cookie after OAuth login
      const token = await result.user.getIdToken()
      Cookies.set("auth-token", token, {
        expires: 7,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        path: "/"
      })

      toast.success('Welcome to SkillSync!')
      return result
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error(error.message || 'Failed to sign in with Google')
      throw error
    } finally {
      setAuthLoading(false)
    }
  }

  const logout = async () => {
    try {
      await signOut(auth)
      Cookies.remove("auth-token")   // ✅ Clear cookie at logout
      toast.success('Signed out successfully')
    } catch (error) {
      console.error('Sign out error:', error)
      toast.error('Failed to sign out')
    }
  }

  const resetPassword = async (email) => {
    try {
      await sendPasswordResetEmail(auth, email)
      toast.success('Password reset email sent!')
    } catch (error) {
      console.error('Password reset error:', error)
      toast.error(error.message || 'Failed to send reset email')
      throw error
    }
  }

  const updateUserProfile = async (updates) => {
    try {
      const token = await user.getIdToken()
      const response = await api.post('/user/update', updates, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUserProfile(response.data.data)
      toast.success('Profile updated successfully!')
      return response.data.data
    } catch (error) {
      console.error('Update profile error:', error)
      toast.error('Failed to update profile')
      throw error
    }
  }

  const completeOnboarding = async (onboardingData) => {
    try {
      const token = await user.getIdToken()
      const response = await api.post('/user/complete-onboarding', onboardingData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUserProfile(response.data.data)
      toast.success('Onboarding completed!')
      return response.data.data
    } catch (error) {
      console.error('Complete onboarding error:', error)
      toast.error('Failed to complete onboarding')
      throw error
    }
  }

  const getAuthToken = async () => {
    if (!user) return null
    return await user.getIdToken()
  }

  return (
    <AuthContext.Provider value={{
      user,
      userProfile,
      setUserProfile,
      loading,
      authLoading,
      signUp,
      signIn,
      signInWithGoogle,
      logout,
      resetPassword,
      updateUserProfile,
      completeOnboarding,
      getAuthToken,
    }}>
      {children}
    </AuthContext.Provider>
  )
}