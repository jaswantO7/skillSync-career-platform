'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'

const ResetPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { resetPassword } = useAuth()

  const validateEmail = (email) => {
    return /\S+@\S+\.\S+/.test(email)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!email) {
      setError('Email is required')
      return
    }
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    setLoading(true)
    setError('')

    try {
      await resetPassword(email)
      setIsSubmitted(true)
    } catch (error) {
      console.error('Password reset error:', error)
      setError('Failed to send reset email. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e) => {
    setEmail(e.target.value)
    if (error) {
      setError('')
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50 dark:from-surface-950 dark:via-surface-950 dark:to-surface-900 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          <Card>
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600" />
              </div>
              
              <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
                Check Your Email
              </h1>
              
              <p className="text-surface-500 dark:text-surface-400 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              
              <div className="space-y-4">
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                
                <div className="flex flex-col space-y-3">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setIsSubmitted(false)
                      setEmail('')
                    }}
                    className="w-full"
                  >
                    Try Different Email
                  </Button>
                  
                  <Link href="/auth/signin">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft size={16} className="mr-2" />
                      Back to Sign In
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-violet-50 dark:from-surface-950 dark:via-surface-950 dark:to-surface-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-display font-bold text-2xl text-surface-900 dark:text-white">
              SkillSync
            </span>
          </Link>
          
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-2">
            Reset Password
          </h1>
          <p className="text-surface-500 dark:text-surface-400">
            Enter your email address and we'll send you a link to reset your password
          </p>
        </div>

        <Card>
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Email Address"
                type="email"
                value={email}
                onChange={handleInputChange}
                placeholder="Enter your email address"
                icon={<Mail size={20} />}
                error={error}
                disabled={loading}
              />

              <Button
                type="submit"
                className="w-full"
                loading={loading}
              >
                Send Reset Link
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                href="/auth/signin"
                className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
              >
                <ArrowLeft size={16} className="mr-1" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Remember your password?{' '}
            <Link
              href="/auth/signin"
              className="font-medium text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
            >
              Sign in here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default ResetPasswordPage