'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Briefcase, Clock, Code, Target, ChevronRight, ChevronLeft, Check, Sparkles, X } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { Card, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Badge from '@/components/ui/Badge'
import toast from 'react-hot-toast'

const COMMON_SKILLS = [
  'JavaScript', 'TypeScript', 'Python', 'Java', 'C#', 'Go', 'Rust', 'C++',
  'React', 'Vue', 'Angular', 'Next.js', 'Node.js', 'Express', 'Django', 'Flask',
  'HTML', 'CSS', 'Tailwind', 'Sass', 'SQL', 'PostgreSQL', 'MongoDB', 'Redis',
  'AWS', 'Azure', 'GCP', 'Docker', 'Kubernetes', 'Git', 'CI/CD', 'Linux',
  'REST APIs', 'GraphQL', 'System Design', 'Agile', 'Scrum', 'DevOps',
  'Machine Learning', 'Data Science', 'UI/UX Design', 'Figma',
  'Project Management', 'Leadership', 'Communication', 'Problem Solving',
  'React Native', 'Flutter', 'Swift', 'Kotlin', 'Firebase'
]

const STEPS = [
  { id: 1, title: 'Role', icon: Briefcase },
  { id: 2, title: 'Experience', icon: Clock },
  { id: 3, title: 'Skills', icon: Code },
  { id: 4, title: 'Goal', icon: Target },
]

export default function OnboardingPage() {
  const { user, userProfile, completeOnboarding, loading: authLoading } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [form, setForm] = useState({
    currentRole: '',
    experienceYears: '0',
    skills: [] ,
    careerGoal: '',
  })
  const [skillInput, setSkillInput] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  useEffect(() => {
    if (authLoading) return
    if (!user) { router.push('/auth/signin'); return }
    if (userProfile?.onboardingCompleted) { router.push('/dashboard'); return }
    if (userProfile?.currentRole) {
      setForm(prev => ({ ...prev, currentRole: userProfile.currentRole }))
    }
  }, [user, userProfile, authLoading])

  const addSkill = (skill) => {
    const s = skill.trim()
    if (!s || form.skills.includes(s)) return
    setForm(prev => ({ ...prev, skills: [...prev.skills, s] }))
    setSkillInput('')
    setShowSuggestions(false)
  }

  const removeSkill = (skill) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }))
  }

  const filteredSuggestions = COMMON_SKILLS.filter(
    s => s.toLowerCase().includes(skillInput.toLowerCase()) && !form.skills.includes(s)
  ).slice(0, 8)

  const canProceed = () => {
    switch (step) {
      case 1: return form.currentRole.trim().length >= 2
      case 2: return parseInt(form.experienceYears) >= 0
      case 3: return form.skills.length > 0
      case 4: return form.careerGoal.trim().length >= 2
      default: return false
    }
  }

  const handleNext = () => {
    if (!canProceed()) return
    setStep(prev => Math.min(prev + 1, 4))
  }

  const handleBack = () => setStep(prev => Math.max(prev - 1, 1))

  const handleSubmit = async () => {
    if (!canProceed()) return
    setSubmitting(true)
    try {
      await completeOnboarding({
        name: user?.displayName || form.currentRole.split(' ')[0] || 'User',
        currentRole: form.currentRole,
        skills: form.skills,
        experienceYears: parseInt(form.experienceYears),
        preferences: {
          careerGoals: [form.careerGoal],
          availableHoursPerWeek: 10,
        },
      })
      toast.success('Welcome to SkillSync!')
      router.push('/dashboard')
    } catch (error) {
      toast.error('Failed to save profile')
    } finally {
      setSubmitting(false)
    }
  }

  const variants = {
    enter: { x: 60, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -60, opacity: 0 },
  }

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-stitch-primary/10 rounded-2xl flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-stitch-primary" />
              </div>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">What's your current role?</h2>
              <p className="text-surface-500 dark:text-surface-400 mt-2">Tell us your job title so we can tailor recommendations</p>
            </div>
            <Input
              label="Current Job Title"
              placeholder="e.g. Junior Developer, Data Analyst, Designer"
              value={form.currentRole}
              onChange={(e) => setForm(prev => ({ ...prev, currentRole: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleNext()}
              icon={<Briefcase size={18} />}
              required
              autoFocus
            />
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-stitch-primary/10 rounded-2xl flex items-center justify-center">
                <Clock className="w-8 h-8 text-stitch-primary" />
              </div>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">Years of experience</h2>
              <p className="text-surface-500 dark:text-surface-400 mt-2">How long have you been working in your field?</p>
            </div>
            <div className="max-w-xs mx-auto">
              <Input
                label="Years of Experience"
                type="number"
                min="0"
                max="50"
                placeholder="e.g. 3"
                value={form.experienceYears}
                onChange={(e) => setForm(prev => ({ ...prev, experienceYears: e.target.value }))}
                onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                icon={<Clock size={18} />}
                required
                autoFocus
              />
            </div>
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-stitch-primary/10 rounded-2xl flex items-center justify-center">
                <Code className="w-8 h-8 text-stitch-primary" />
              </div>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">What are your skills?</h2>
              <p className="text-surface-500 dark:text-surface-400 mt-2">Add at least one skill to get started</p>
            </div>

            <div className="relative">
              <Input
                label="Add Skills"
                placeholder="Type a skill and press Enter..."
                value={skillInput}
                onChange={(e) => { setSkillInput(e.target.value); setShowSuggestions(true) }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput) }
                }}
                onFocus={() => setShowSuggestions(true)}
                icon={<Code size={18} />}
                autoFocus
              />
              {showSuggestions && skillInput && filteredSuggestions.length > 0 && (
                <div className="absolute z-20 mt-1 w-full bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 max-h-48 overflow-y-auto">
                  {filteredSuggestions.map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => addSkill(s)}
                      className="w-full text-left px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {form.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.skills.map(s => (
                  <Badge key={s} variant="primary" size="md" className="cursor-pointer group" onClick={() => removeSkill(s)}>
                    {s}
                    <X size={14} className="ml-1.5 opacity-60 group-hover:opacity-100" />
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-stitch-primary/10 rounded-2xl flex items-center justify-center">
                <Target className="w-8 h-8 text-stitch-primary" />
              </div>
              <h2 className="text-2xl font-bold text-surface-900 dark:text-white">What's your career goal?</h2>
              <p className="text-surface-500 dark:text-surface-400 mt-2">What role do you want to grow into?</p>
            </div>
            <Input
              label="Target Role"
              placeholder="e.g. Senior Developer, Engineering Manager, Data Scientist"
              value={form.careerGoal}
              onChange={(e) => setForm(prev => ({ ...prev, careerGoal: e.target.value }))}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              icon={<Target size={18} />}
              required
              autoFocus
            />
            <div className="bg-surface-50 dark:bg-surface-800/50 rounded-xl p-4 border border-surface-200 dark:border-surface-700/50">
              <div className="flex items-center space-x-2 text-sm text-surface-500 dark:text-surface-400 mb-2">
                <Sparkles size={16} className="text-stitch-primary" />
                <span>Here's what we'll use to personalize your experience:</span>
              </div>
              <ul className="space-y-1.5 text-sm text-surface-700 dark:text-surface-300">
                <li className="flex items-center space-x-2"><Check size={14} className="text-emerald-500 shrink-0" /><span>Current Role: <strong>{form.currentRole}</strong></span></li>
                <li className="flex items-center space-x-2"><Check size={14} className="text-emerald-500 shrink-0" /><span>Experience: <strong>{form.experienceYears} years</strong></span></li>
                <li className="flex items-center space-x-2"><Check size={14} className="text-emerald-500 shrink-0" /><span>Skills: <strong>{form.skills.length} skills</strong></span></li>
                <li className="flex items-center space-x-2"><Check size={14} className="text-emerald-500 shrink-0" /><span>Goal: <strong>{form.careerGoal}</strong></span></li>
              </ul>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-stitch-primary/5 via-white to-stitch-secondary/5 dark:from-surface-950 dark:via-surface-950 dark:to-surface-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        <Card className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-surface-900 dark:text-white">Welcome to SkillSync</h1>
            <p className="text-surface-500 dark:text-surface-400 mt-1">Let's set up your profile in a few steps</p>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center mb-8 space-x-2">
            {STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center">
                <div className={`flex items-center justify-center w-9 h-9 rounded-full text-sm font-medium transition-all ${
                  step > i + 1
                    ? 'bg-emerald-500 text-white'
                    : step === i + 1
                    ? 'bg-stitch-primary text-white ring-2 ring-stitch-primary/30'
                    : 'bg-surface-100 dark:bg-surface-800 text-surface-400 dark:text-surface-500'
                }`}>
                  {step > i + 1 ? <Check size={16} /> : <s.icon size={16} />}
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`w-8 h-0.5 mx-1 rounded ${
                    step > i + 1 ? 'bg-emerald-500' : 'bg-surface-200 dark:bg-surface-700'
                  }`} />
                )}
              </div>
            ))}
          </div>

          {/* Step labels */}
          <div className="flex justify-center space-x-6 mb-8">
            {STEPS.map((s, i) => (
              <span key={s.id} className={`text-xs font-medium ${
                step === i + 1 ? 'text-stitch-primary' : 'text-surface-400 dark:text-surface-500'
              }`}>
                {s.title}
              </span>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            >
              {renderStep()}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-8">
            <Button
              variant="secondary"
              onClick={handleBack}
              disabled={step === 1}
            >
              <ChevronLeft size={18} className="mr-1" />
              Back
            </Button>

            {step < 4 ? (
              <Button onClick={handleNext} disabled={!canProceed()}>
                Next
                <ChevronRight size={18} className="ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} loading={submitting} disabled={!canProceed()}>
                <Sparkles size={18} className="mr-1" />
                Get Started
              </Button>
            )}
          </div>
          {/* Reserved: Mentor toggle will go here in future update */}
        </Card>
      </motion.div>
    </div>
  )
}
