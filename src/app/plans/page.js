'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Star, Shield, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import { useAuth } from '@/context/AuthContext'
import { authAPI } from '@/lib/api'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

const PlansPage = () => {
  const { userProfile, setUserProfile } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(null)

  const currentPlan = userProfile?.subscriptionPlan || 'free'

  const tiers = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      desc: 'Get started with core features',
      accent: 'from-surface-400 to-surface-500',
      btnClass: 'bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white hover:bg-surface-50 dark:hover:bg-surface-700',
      features: [
        ['Resume & Skill Analysis', true],
        ['AI Career Paths', '1 path'],
        ['Learning Roadmaps', '1 roadmap'],
        ['AI Mentor Chat', '5/mo'],
        ['Portfolio Projects', 'Limited'],
        ['Progress Analytics', false],
      ],
      cta: 'Current',
      disabled: currentPlan === 'free',
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$29',
      period: 'month',
      desc: 'Unlock the full experience',
      accent: 'from-emerald-500 to-violet-500',
      popular: true,
      btnClass: 'bg-gradient-to-r from-emerald-600 to-violet-600 text-white hover:shadow-lg hover:shadow-emerald-600/25',
      features: [
        ['Resume & Skill Analysis', true],
        ['AI Career Paths', 'Unlimited'],
        ['Learning Roadmaps', 'Unlimited'],
        ['AI Mentor Chat', 'Unlimited'],
        ['Portfolio Projects', 'Unlimited'],
        ['Progress Analytics', true],
      ],
      cta: currentPlan === 'pro' ? 'Current' : 'Upgrade to Pro',
      disabled: currentPlan === 'pro',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: '$99',
      period: 'month',
      desc: 'For teams & organizations',
      accent: 'from-violet-500 to-indigo-600',
      btnClass: 'bg-white dark:bg-surface-800 border-2 border-surface-200 dark:border-surface-700 text-surface-900 dark:text-white hover:bg-surface-50 dark:hover:bg-surface-700',
      features: [
        ['Everything in Pro', true],
        ['Team management', true],
        ['Custom integrations', true],
        ['Advanced analytics', true],
        ['Dedicated support', true],
        ['Custom AI training', true],
      ],
      cta: currentPlan === 'enterprise' ? 'Current' : 'Contact Sales',
      disabled: currentPlan === 'enterprise',
    },
  ]

  const handlePlanChange = async (planId) => {
    if (planId === currentPlan) return
    try {
      setLoading(planId)
      const res = await authAPI.updatePlan(planId)
      if (res.data?.success) {
        setUserProfile(prev => ({ ...prev, subscriptionPlan: planId }))
        toast.success(`Plan changed to ${planId.charAt(0).toUpperCase() + planId.slice(1)}`)
        router.refresh()
      }
    } catch (error) {
      toast.error('Failed to update plan')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 grain-overlay">
      <Navbar />
      <div className="pt-24 pb-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-12"
          >
            <h1 className="text-4xl font-bold text-surface-900 dark:text-white mb-3">
              Choose your plan
            </h1>
            <p className="text-lg text-surface-500 dark:text-surface-400">
              Start free, upgrade when you need more.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {tiers.map((tier, i) => {
              const isPro = tier.popular
              return (
                <motion.div
                  key={tier.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                  className={`relative flex flex-col rounded-2xl ${
                    isPro
                      ? 'glass-card ring-2 ring-emerald-500/50 shadow-2xl shadow-emerald-500/10 scale-105 z-10'
                      : 'glass-card'
                  }`}
                >
                  {isPro && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center space-x-1 bg-gradient-to-r from-emerald-600 to-violet-600 text-white text-xs font-semibold px-3.5 py-1 rounded-full shadow-lg">
                        <Star size={12} className="fill-white" />
                        <span>Most popular</span>
                      </span>
                    </div>
                  )}

                  <div className="p-6 pb-0">
                    <div className={`h-1.5 rounded-full bg-gradient-to-r ${tier.accent} mb-5`} />

                    <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                      {tier.name}
                    </h3>

                    <div className="mt-3 flex items-baseline space-x-1">
                      <span className="text-4xl font-bold text-surface-900 dark:text-white">{tier.price}</span>
                      <span className="text-sm text-surface-400">/{tier.period}</span>
                    </div>

                    <p className="mt-1.5 text-sm text-surface-500 dark:text-surface-400">{tier.desc}</p>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <ul className="space-y-3 flex-1">
                      {tier.features.map(([label, value]) => (
                        <li key={label} className="flex items-center space-x-3">
                          {value === true ? (
                            <Check size={16} className="text-emerald-500 shrink-0" />
                          ) : value ? (
                            <Check size={16} className="text-emerald-500 shrink-0" />
                          ) : (
                            <div className="w-4 h-4 rounded-full border-2 border-surface-200 dark:border-surface-600 shrink-0" />
                          )}
                          <span className={`text-sm ${value === false ? 'text-surface-300 dark:text-surface-600' : 'text-surface-700 dark:text-surface-300'}`}>
                            {label}
                          </span>
                          {typeof value === 'string' && (
                            <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${
                              value === 'Unlimited'
                                ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                                : 'bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400'
                            }`}>
                              {value}
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handlePlanChange(tier.id)}
                      disabled={tier.disabled}
                      className={`mt-6 w-full py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed ${tier.btnClass}`}
                    >
                      {loading === tier.id ? (
                        <span className="flex items-center justify-center space-x-2">
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          <span>Updating...</span>
                        </span>
                      ) : (
                        tier.cta
                      )}
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex flex-col items-center mt-12 space-y-3 text-sm text-surface-400"
          >
            <div className="flex items-center space-x-1.5">
              <Shield size={14} />
              <span>Your data is encrypted and never shared</span>
            </div>
            <p>
              Questions?{' '}
              <Link href="/" className="text-emerald-600 hover:text-emerald-700 font-medium">Contact us</Link>
            </p>
          </motion.div>
        </div>
      </div>
      <Footer />
    </div>
  )
}

export default PlansPage
