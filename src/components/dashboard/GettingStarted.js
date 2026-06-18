'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { Upload, Target, Map, Folder, MessageCircle, CheckCircle, Circle, ChevronRight, ChevronDown } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import Link from 'next/link'

const STEPS = [
  { id: 'resume', label: 'Upload your resume for skill analysis', href: '/skill-audit', icon: Upload },
  { id: 'career', label: 'Explore career path recommendations', href: '/career-path', icon: Target },
  { id: 'roadmap', label: 'Generate a learning roadmap', href: '/career-path', icon: Map },
  { id: 'projects', label: 'Start a portfolio project', href: '/projects', icon: Folder },
  { id: 'mentor', label: 'Chat with your AI mentor', href: '/mentor', icon: MessageCircle },
]

export default function GettingStarted({ onToggle, visible, roadmaps, projects, usage, hasAnalysis }) {
  const checked = {
    resume: hasAnalysis,
    career: roadmaps?.length > 0,
    roadmap: roadmaps?.length > 0,
    projects: projects?.length > 0,
    mentor: (usage?.mentorChats || 0) > 0,
  }

  const doneCount = Object.values(checked).filter(Boolean).length
  const allDone = doneCount === STEPS.length

  return (
    <div className="mb-6">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-3 rounded-2xl bg-surface-100 dark:bg-surface-800/80 hover:bg-surface-200 dark:hover:bg-surface-700/80 border border-surface-200 dark:border-surface-700/50 transition-all group"
      >
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg flex items-center justify-center">
            <CheckCircle size={18} className="text-emerald-600" />
          </div>
          <div className="text-left">
            <span className="font-medium text-surface-900 dark:text-white text-sm">Getting Started</span>
            {!visible && (
              <span className="text-xs text-surface-500 ml-2">{doneCount}/{STEPS.length} steps done</span>
            )}
          </div>
        </div>
        <ChevronDown size={20} className={`text-surface-400 transition-transform duration-200 ${visible ? 'rotate-180' : ''}`} />
      </button>

      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-emerald-200 dark:border-emerald-800/50 rounded-t-none border-t-0">
              <CardContent className="p-5 pt-4">
                <p className="text-xs text-surface-500 dark:text-surface-400 mb-3">
                  Complete these steps to get the most out of SkillSync
                </p>

                <div className="flex items-center space-x-2 mb-4">
                  <div className="flex-1 h-1.5 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${(doneCount / STEPS.length) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-surface-500 font-medium">{doneCount}/{STEPS.length}</span>
                </div>

                <div className="space-y-1.5">
                  {STEPS.map((step) => {
                    const Icon = step.icon
                    const isChecked = checked[step.id]
                    return (
                      <Link
                        key={step.id}
                        href={step.href}
                        className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl transition-all ${
                          isChecked
                            ? 'bg-emerald-50 dark:bg-emerald-900/10 opacity-60'
                            : 'hover:bg-surface-50 dark:hover:bg-surface-800/50'
                        }`}
                      >
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                          isChecked ? 'text-emerald-600' : 'text-surface-400'
                        }`}>
                          {isChecked ? <CheckCircle size={20} /> : <Circle size={20} />}
                        </div>
                        <div className="flex-1 flex items-center space-x-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                            isChecked
                              ? 'bg-emerald-100 dark:bg-emerald-900/30'
                              : 'bg-surface-100 dark:bg-surface-800'
                          }`}>
                            <Icon size={16} className={isChecked ? 'text-emerald-600' : 'text-surface-500'} />
                          </div>
                          <span className={`text-sm font-medium ${
                            isChecked
                              ? 'text-surface-400 dark:text-surface-500 line-through'
                              : 'text-surface-700 dark:text-surface-300'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                        {!isChecked && <ChevronRight size={16} className="text-surface-400 shrink-0" />}
                      </Link>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
