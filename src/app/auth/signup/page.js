'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Eye, EyeOff, Mail, Lock, User, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import toast from 'react-hot-toast'

const SignUpPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [errors, setErrors] = useState({})
  const [acceptTerms, setAcceptTerms] = useState(false)
  const { signUp, signInWithGoogle, authLoading } = useAuth()
  const router = useRouter()

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters'
    }

    if (!formData.email) {
      newErrors.email = 'Email is required'
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Password must contain uppercase, lowercase, and number'
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password'
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!acceptTerms) {
      newErrors.terms = 'You must accept the terms and conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) return

    try {
      await signUp(formData.email, formData.password, formData.name)
      toast.success('Account created successfully!')
      router.push('/onboarding')
    } catch (error) {
      console.error('Sign up error:', error)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      await signInWithGoogle()
      router.push('/onboarding')
    } catch (error) {
      console.error('Google sign up error:', error)
    }
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stitch-primary/5 via-white to-stitch-secondary/5 dark:from-surface-950 dark:via-surface-950 dark:to-surface-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-2 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-stitch-primary to-stitch-secondary rounded-lg flex items-center justify-center shadow-lg shadow-stitch-primary/20">
              <span className="text-white font-bold">S</span>
            </div>
            <span className="font-display font-bold text-xl text-surface-900 dark:text-white">
              SkillSync
            </span>
          </Link>
          
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white mb-1">
            Create Account
          </h1>
          <p className="text-sm text-surface-500 dark:text-surface-400">
            Start your AI-powered career growth journey
          </p>
        </div>

        <Card className="bg-white border-surface-200 shadow-lg shadow-black/5 dark:bg-white/[0.06] dark:border-white/15 dark:shadow-[0_10px_20px_rgba(255,255,255,0.04)]">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                icon={<User size={20} />}
                error={errors.name}
                disabled={authLoading}
              />

              <Input
                label="Email Address"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter your email"
                icon={<Mail size={20} />}
                error={errors.email}
                disabled={authLoading}
              />

              <div className="relative">
                <Input
                  label="Password"
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create a strong password"
                  icon={<Lock size={20} />}
                  error={errors.password}
                  disabled={authLoading}
                  helper="Must be 8+ characters with uppercase, lowercase, and number"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-9 text-surface-500 hover:text-surface-700 dark:text-white/50 dark:hover:text-white"
                  disabled={authLoading}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="relative">
                <Input
                  label="Confirm Password"
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  placeholder="Confirm your password"
                  icon={<Lock size={20} />}
                  error={errors.confirmPassword}
                  disabled={authLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-9 text-surface-500 hover:text-surface-700 dark:text-white/50 dark:hover:text-white"
                  disabled={authLoading}
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="terms"
                    type="checkbox"
                    checked={acceptTerms}
                    onChange={(e) => {
                      setAcceptTerms(e.target.checked)
                      if (errors.terms) {
                        setErrors(prev => ({ ...prev, terms: '' }))
                      }
                    }}
                    className="h-4 w-4 text-stitch-primary focus:ring-stitch-primary/30 border-surface-300 rounded"
                    disabled={authLoading}
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="terms" className="text-surface-700 dark:text-surface-300">
                    I agree to the{' '}
                    <Link href="/terms" className="text-stitch-primary hover:text-stitch-primary/80">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-stitch-primary hover:text-stitch-primary/80">
                      Privacy Policy
                    </Link>
                  </label>
                  {errors.terms && (
                    <p className="text-red-600 text-xs mt-1">{errors.terms}</p>
                  )}
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={authLoading}
                icon={<ArrowRight size={20} />}
                iconPosition="right"
              >
                Create Account
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-surface-300 dark:border-surface-600" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white dark:bg-surface-800 text-surface-500">
                    Or continue with
                  </span>
                </div>
              </div>

              <Button
                variant="secondary"
                className="w-full mt-4"
                onClick={handleGoogleSignUp}
                disabled={authLoading}
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-surface-500 dark:text-surface-400 mt-6">
          Already have an account?{' '}
          <Link
            href="/auth/signin"
            className="font-medium text-stitch-primary hover:text-stitch-primary/80 dark:text-stitch-primary-fixed"
          >
            Sign in here
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default SignUpPage