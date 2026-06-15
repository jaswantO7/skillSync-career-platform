'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Check, Star, Sparkles, Quote, Search, Route, BookOpen, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'

/* ── Inline SVG illustrations ── */

const HeroIllustration = () => (
  <svg viewBox="0 0 520 400" fill="none" className="w-full max-w-lg" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="20" width="480" height="360" rx="20" className="fill-white/70 dark:fill-surface-800/50 stroke-surface-200/50 dark:stroke-surface-700/30" stroke="currentColor" strokeWidth="0.5" />
    <rect x="40" y="40" width="440" height="36" rx="10" className="fill-surface-50 dark:fill-surface-800" />
    <circle cx="60" cy="58" r="6" className="fill-red-400" />
    <circle cx="80" cy="58" r="6" className="fill-amber-400" />
    <circle cx="100" cy="58" r="6" className="fill-emerald-400" />
    <text x="440" y="63" fontSize="11" className="fill-surface-400 font-mono">Dashboard</text>

    {/* Skill bar */}
    <rect x="40" y="100" width="200" height="16" rx="8" className="fill-surface-100 dark:fill-surface-700" />
    <rect x="40" y="100" width="160" height="16" rx="8" className="fill-emerald-500" />
    <text x="250" y="113" fontSize="12" className="fill-surface-500">Skill Score 82%</text>

    <rect x="40" y="128" width="200" height="16" rx="8" className="fill-surface-100 dark:fill-surface-700" />
    <rect x="40" y="128" width="120" height="16" rx="8" className="fill-violet-500" />
    <text x="250" y="141" fontSize="12" className="fill-surface-500">Experience 6yr</text>

    {/* Skill tags */}
    <rect x="40" y="168" width="70" height="28" rx="8" className="fill-white dark:fill-surface-700 stroke-surface-200 dark:stroke-surface-600" stroke="currentColor" strokeWidth="0.5" />
    <text x="50" y="186" fontSize="12" className="fill-surface-700 dark:fill-surface-300">React</text>
    <rect x="118" y="168" width="70" height="28" rx="8" className="fill-white dark:fill-surface-700 stroke-surface-200 dark:stroke-surface-600" stroke="currentColor" strokeWidth="0.5" />
    <text x="128" y="186" fontSize="12" className="fill-surface-700 dark:fill-surface-300">Python</text>
    <rect x="196" y="168" width="60" height="28" rx="8" className="fill-white dark:fill-surface-700 stroke-surface-200 dark:stroke-surface-600" stroke="currentColor" strokeWidth="0.5" />
    <text x="204" y="186" fontSize="12" className="fill-surface-700 dark:fill-surface-300">Docker</text>

    {/* Path card */}
    <rect x="40" y="216" width="440" height="56" rx="12" className="fill-emerald-50 dark:fill-emerald-900/20 stroke-emerald-200 dark:stroke-emerald-800" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="64" cy="244" r="12" className="fill-emerald-500" />
    <path d="M59 244l4 4 6-8" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <text x="86" y="240" fontSize="13" className="fill-emerald-800 dark:fill-emerald-200 font-medium">Career path recommendation</text>
    <text x="86" y="258" fontSize="11" className="fill-emerald-600 dark:fill-emerald-400">Senior Software Engineer · 12 months</text>

    {/* Bottom row items */}
    <rect x="40" y="292" width="130" height="60" rx="10" className="fill-emerald-50 dark:fill-emerald-900/10" />
    <text x="55" y="318" fontSize="18" className="fill-emerald-600 font-semibold">87</text>
    <text x="55" y="338" fontSize="10" className="fill-surface-400">Skill Score</text>

    <rect x="190" y="292" width="130" height="60" rx="10" className="fill-violet-50 dark:fill-violet-900/10" />
    <text x="205" y="318" fontSize="18" className="fill-violet-600 font-semibold">6</text>
    <text x="205" y="338" fontSize="10" className="fill-surface-400">Years Exp</text>

    <rect x="340" y="292" width="140" height="60" rx="10" className="fill-surface-50 dark:fill-surface-800" />
    <text x="355" y="318" fontSize="18" className="fill-surface-700 dark:fill-surface-300 font-semibold">5</text>
    <text x="355" y="338" fontSize="10" className="fill-surface-400">Roadmaps</text>

    {/* Mentor chat bubble */}
    <rect x="40" y="370" width="260" height="32" rx="16" className="fill-surface-100 dark:fill-surface-700" />
    <circle cx="60" cy="386" r="8" className="fill-emerald-500" />
    <text x="76" y="390" fontSize="11" className="fill-surface-500">AI Mentor: Focus on system design...</text>
  </svg>
)

const AnalyzeIllustration = () => (
  <svg viewBox="0 0 280 240" fill="none" className="w-full max-w-sm" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="260" height="220" rx="16" className="fill-white/50 dark:fill-surface-800/30 stroke-surface-200 dark:stroke-surface-700/50" stroke="currentColor" strokeWidth="0.5" />
    <circle cx="44" cy="44" r="20" className="fill-emerald-100 dark:fill-emerald-900/20" />
    <path d="M37 44l5 5 10-10" className="stroke-emerald-600" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
    <text x="78" y="40" fontSize="14" className="fill-surface-700 dark:fill-surface-300 font-medium">Resume uploaded</text>
    <text x="78" y="58" fontSize="11" className="fill-surface-400">Skills extracted: 12</text>
    
    <rect x="28" y="80" width="224" height="8" rx="4" className="fill-surface-100 dark:fill-surface-700" />
    <rect x="28" y="80" width="190" height="8" rx="4" className="fill-emerald-500" />
    <rect x="28" y="98" width="224" height="8" rx="4" className="fill-surface-100 dark:fill-surface-700" />
    <rect x="28" y="98" width="140" height="8" rx="4" className="fill-violet-500" />
    <rect x="28" y="116" width="224" height="8" rx="4" className="fill-surface-100 dark:fill-surface-700" />
    <rect x="28" y="116" width="100" height="8" rx="4" className="fill-emerald-500" />

    <rect x="28" y="144" width="100" height="28" rx="8" className="fill-surface-100 dark:fill-surface-700" />
    <circle cx="44" cy="158" r="6" className="fill-emerald-500" />
    <text x="56" y="162" fontSize="11" className="fill-surface-600 dark:fill-surface-400">Frontend</text>
    <rect x="138" y="144" width="90" height="28" rx="8" className="fill-surface-100 dark:fill-surface-700" />
    <circle cx="154" cy="158" r="6" className="fill-violet-500" />
    <text x="166" y="162" fontSize="11" className="fill-surface-600 dark:fill-surface-400">Backend</text>

    <rect x="28" y="186" width="224" height="32" rx="8" className="fill-emerald-50 dark:fill-emerald-900/10" />
    <text x="40" y="206" fontSize="11" className="fill-surface-500">Gap: System Design · 3 courses recommended</text>
  </svg>
)

const RoadmapIllustration = () => (
  <svg viewBox="0 0 280 240" fill="none" className="w-full max-w-sm" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="260" height="220" rx="16" className="fill-white/50 dark:fill-surface-800/30 stroke-surface-200 dark:stroke-surface-700/50" stroke="currentColor" strokeWidth="0.5" />
    
    {/* Vertical timeline */}
    <line x1="44" y1="40" x2="44" y2="210" className="stroke-surface-200 dark:stroke-surface-700" strokeWidth="2" strokeDasharray="4 4" />
    
    <circle cx="44" cy="58" r="8" className="fill-emerald-500" />
    <rect x="64" y="46" width="180" height="24" rx="6" className="fill-surface-100 dark:fill-surface-700" />
    <text x="74" y="62" fontSize="11" className="fill-surface-700 dark:fill-surface-300">Month 1: JavaScript fundamentals</text>

    <circle cx="44" cy="106" r="8" className="fill-violet-500" />
    <rect x="64" y="94" width="180" height="24" rx="6" className="fill-surface-100 dark:fill-surface-700" />
    <text x="74" y="110" fontSize="11" className="fill-surface-700 dark:fill-surface-300">Month 2: React + TypeScript</text>

    <circle cx="44" cy="154" r="8" className="fill-emerald-500" />
    <rect x="64" y="142" width="180" height="24" rx="6" className="fill-surface-100 dark:fill-surface-700" />
    <text x="74" y="158" fontSize="11" className="fill-surface-700 dark:fill-surface-300">Month 3: Backend + APIs</text>

    <circle cx="44" cy="202" r="8" className="fill-amber-500" />
    <rect x="64" y="190" width="180" height="24" rx="6" className="fill-amber-50 dark:fill-amber-900/10" />
    <text x="74" y="206" fontSize="11" className="fill-amber-700 dark:fill-amber-300">Month 4: Portfolio project</text>
  </svg>
)

const MentorIllustration = () => (
  <svg viewBox="0 0 280 240" fill="none" className="w-full max-w-sm" xmlns="http://www.w3.org/2000/svg">
    <rect x="10" y="10" width="260" height="220" rx="16" className="fill-white/50 dark:fill-surface-800/30 stroke-surface-200 dark:stroke-surface-700/50" stroke="currentColor" strokeWidth="0.5" />
    
    {/* Bot message */}
    <rect x="28" y="30" width="190" height="52" rx="12" className="fill-emerald-50 dark:fill-emerald-900/20" />
    <circle cx="46" cy="46" r="8" className="fill-emerald-500" />
    <text x="62" y="50" fontSize="12" className="fill-emerald-800 dark:fill-emerald-200 font-medium">Alex (AI Mentor)</text>
    <text x="62" y="68" fontSize="11" className="fill-emerald-600 dark:fill-emerald-400">You have a 3-month gap in cloud skills.</text>

    {/* User message */}
    <rect x="86" y="96" width="166" height="40" rx="12" className="fill-violet-100 dark:fill-violet-900/20" />
    <text x="102" y="116" fontSize="11" className="fill-violet-700 dark:fill-violet-300">What courses do you recommend?</text>

    {/* Bot response */}
    <rect x="28" y="150" width="224" height="52" rx="12" className="fill-surface-100 dark:fill-surface-700" />
    <circle cx="46" cy="166" r="8" className="fill-emerald-500" />
    <text x="62" y="170" fontSize="11" className="fill-surface-700 dark:fill-surface-300">I recommend AWS Solutions Architect</text>
    <text x="62" y="186" fontSize="11" className="fill-surface-500">and a hands-on cloud migration project.</text>

    {/* Input */}
    <rect x="28" y="214" width="224" height="28" rx="14" className="fill-white dark:fill-surface-700 stroke-surface-200 dark:stroke-surface-600" stroke="currentColor" strokeWidth="0.5" />
    <text x="44" y="233" fontSize="11" className="fill-surface-400">Ask your mentor anything...</text>
  </svg>
)

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.5, delay },
})

const LandingPage = () => {
  const features = [
    {
      icon: null, title: 'AI Skill Analysis', desc: 'Upload your resume for instant AI-powered skill extraction, gap analysis, and market positioning. Know exactly where you stand.',
      illust: <AnalyzeIllustration />, reversed: false,
    },
    {
      icon: null, title: 'Smart Career Paths', desc: 'Personalized career progression recommendations built from your unique skill profile, industry demand data, and your specific goals.',
      illust: <RoadmapIllustration />, reversed: true,
    },
    {
      icon: null, title: 'Monthly Roadmaps', desc: 'Bite-sized monthly learning plans with curated resources, hands-on projects, and clear milestones to track your progress.',
      illust: <MentorIllustration />, reversed: false,
    },
  ]

  const testimonials = [
    { name: 'Sarah Chen', role: 'Software Engineer → Senior Developer', content: 'SkillSync identified gaps I didn\'t know I had. The roadmap was so precise I got promoted in 8 months.', initials: 'SC' },
    { name: 'Marcus Rodriguez', role: 'Marketing → Growth Manager', content: 'The AI mentor feels like having a career coach in your pocket. It\'s uncanny how relevant the advice is.', initials: 'MR' },
    { name: 'Emily Watson', role: 'Data Analyst → ML Engineer', content: 'Built my entire portfolio around the project suggestions. Landed my dream role at a top AI startup.', initials: 'EW' },
  ]

  const pricingPlans = [
    {
      id: 'free', name: 'Free', price: '$0', period: 'forever', desc: 'Core features to get started',
      features: [['Resume & Skill Analysis', true], ['AI Career Paths', '1 path'], ['Learning Roadmaps', '1/mo'], ['AI Mentor Chat', '5/mo'], ['Portfolio Projects', 'Limited'], ['Progress Analytics', false]],
      cta: 'Get Started Free', popular: false,
    },
    {
      id: 'pro', name: 'Pro', price: '$29', period: 'month', desc: 'Full experience, no limits',
      features: [['Everything in Free', true], ['AI Career Paths', 'Unlimited'], ['Learning Roadmaps', 'Unlimited'], ['AI Mentor Chat', 'Unlimited'], ['Portfolio Projects', 'Unlimited'], ['Progress Analytics', true]],
      cta: 'Start Pro Trial', popular: true,
    },
    {
      id: 'enterprise', name: 'Enterprise', price: '$99', period: 'month', desc: 'For teams & organizations',
      features: [['Everything in Pro', true], ['Team management', true], ['Custom integrations', true], ['Advanced analytics', true], ['Dedicated support', true], ['Custom AI training', true]],
      cta: 'Contact Sales', popular: false,
    },
  ]

  return (
    <div className="min-h-screen bg-white dark:bg-surface-950">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative overflow-hidden pt-24 lg:pt-28">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-white to-white dark:from-surface-900 dark:via-surface-950 dark:to-surface-950" />

        {/* Floating orbs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -left-20 w-[400px] h-[400px] rounded-full bg-gradient-to-br from-emerald-400/20 to-emerald-600/5 blur-3xl animate-float" />
          <div className="absolute top-1/3 -right-20 w-[300px] h-[300px] rounded-full bg-gradient-to-br from-violet-400/15 to-violet-600/5 blur-3xl animate-float-delayed" />
          <div className="absolute -bottom-32 left-1/4 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-emerald-300/8 to-violet-400/8 blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <motion.span
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/30 mb-5"
              >
                <Sparkles size={12} className="animate-pulse" />
                <span>AI-powered career platform</span>
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-display font-semibold tracking-tight text-surface-900 dark:text-white leading-[1.1]"
              >
                Your AI Career
                <span className="block mt-1 bg-gradient-to-r from-emerald-500 via-violet-500 to-emerald-500 bg-[length:200%_auto] animate-shimmer bg-clip-text text-transparent">Growth Companion</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.25 }}
                className="mt-4 text-base text-surface-500 dark:text-surface-400 leading-relaxed max-w-lg"
              >
                Transform your professional journey with AI-powered skill analysis, personalized learning roadmaps, and intelligent career guidance.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.35 }}
                className="mt-7 flex flex-wrap gap-3"
              >
                <Link href="/skill-audit">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-ring bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/25 hover:shadow-xl hover:shadow-emerald-500/30 text-sm px-6 py-3"
                  >
                    Get Free Skill Audit
                    <motion.span
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
                      className="ml-2 inline-flex"
                    >
                      <ArrowRight size={15} />
                    </motion.span>
                  </motion.button>
                </Link>
                <Link href="#features">
                  <Button variant="secondary" size="lg" className="text-sm px-6 py-3">
                    See how it works
                  </Button>
                </Link>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.45 }}
                className="mt-8 flex gap-8"
              >
                {[
                  ['10k+', 'Active users'],
                  ['50k+', 'Roadmaps'],
                  ['95%', 'Satisfaction'],
                ].map(([val, label], i) => (
                  <motion.div
                    key={label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                  >
                    <div className="text-xl font-semibold text-surface-900 dark:text-white">{val}</div>
                    <div className="text-xs text-surface-400 mt-0.5">{label}</div>
                  </motion.div>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="hidden lg:flex justify-center"
            >
              <motion.div
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <HeroIllustration />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Wave divider */}
        <div className="relative h-12 bg-white dark:bg-surface-950">
          <svg viewBox="0 0 1440 48" className="absolute -top-12 w-full h-12 fill-white dark:fill-surface-950" preserveAspectRatio="none">
            <path d="M0 48V24c120 16 240 24 360 24s240-8 360-24 240-24 360-24 240 8 360 24v24H0z" />
          </svg>
        </div>
      </section>

      {/* ─── LOGO MARQUEE ─── */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="bg-surface-50/50 dark:bg-surface-900/30 py-10 overflow-hidden"
      >
        <p className="text-center text-xs font-medium text-surface-400 mb-5 uppercase tracking-wider">Trusted by professionals at</p>
        <div className="flex space-x-12 animate-marquee whitespace-nowrap">
          {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Spotify', 'Adobe'].map((name) => (
            <span key={name} className="text-surface-300 dark:text-surface-600 text-lg font-semibold tracking-tight select-none">
              {name}
            </span>
          ))}
          {/* Duplicate for seamless loop */}
          {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Spotify', 'Adobe'].map((name) => (
            <span key={`${name}-2`} className="text-surface-300 dark:text-surface-600 text-lg font-semibold tracking-tight select-none">
              {name}
            </span>
          ))}
        </div>
      </motion.div>

      {/* ─── FEATURES (varied split layout) ─── */}
      <section id="features" className="bg-white dark:bg-surface-950 pb-20 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="max-w-xl mb-14">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 border border-violet-200/50 dark:border-violet-700/30 mb-4">
              <Sparkles size={12} />
              <span>Core features</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-surface-900 dark:text-white">
              Everything you need to grow
            </h2>
            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
              AI-driven tools that analyze, plan, teach, and mentor — all in one place.
            </p>
          </motion.div>

          <div className="space-y-16">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="grid md:grid-cols-2 gap-8 lg:gap-16 items-center"
              >
                <motion.div
                  initial={{ opacity: 0, x: f.reversed ? 20 : -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 + 0.1 }}
                  className={`${f.reversed ? 'md:order-2' : ''}`}
                >
                  <h3 className="text-xl font-semibold text-surface-900 dark:text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-surface-500 dark:text-surface-400 leading-relaxed">{f.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {[
                      ['AI-powered analysis', true],
                      ['Personalized results', true],
                      ['Industry benchmarking', true],
                    ].map(([label], li) => (
                      <motion.li
                        key={label}
                        initial={{ opacity: 0, x: -10 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 + 0.2 + li * 0.08 }}
                        className="flex items-center space-x-2 text-sm text-surface-600 dark:text-surface-400"
                      >
                        <Check size={14} className="text-emerald-500 shrink-0" />
                        <span>{label}</span>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
                <motion.div
                  initial={{ opacity: 0, x: f.reversed ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 + 0.15 }}
                  className={`flex justify-center ${f.reversed ? 'md:order-1' : ''}`}
                >
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    {f.illust}
                  </motion.div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS (dark section) ─── */}
      <section id="how-it-works" className="relative bg-surface-50 dark:bg-surface-800 py-20 lg:py-28 overflow-hidden">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="max-w-xl mb-14">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/30 mb-4">
              <Sparkles size={12} />
              <span>How it works</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-surface-900 dark:text-white">
              Four steps to grow
            </h2>
            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
              From analysis to career advancement — we guide you every step.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: '01', title: 'Analyze', desc: 'Upload your resume for AI skill extraction', icon: Search },
              { num: '02', title: 'Plan', desc: 'Get personalized career paths and roadmaps', icon: Route },
              { num: '03', title: 'Learn', desc: 'Follow curated resources and build projects', icon: BookOpen },
              { num: '04', title: 'Grow', desc: 'Chat with your AI mentor, advance your career', icon: TrendingUp },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                className="relative group"
              >
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-white dark:bg-surface-900/50 border border-surface-200 dark:border-surface-700/30 rounded-xl p-5 h-full shadow-sm group-hover:border-emerald-500/30 group-hover:shadow-lg group-hover:shadow-emerald-500/5 transition-all duration-300"
                >
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-surface-700/50 flex items-center justify-center mb-3 group-hover:bg-emerald-100 dark:group-hover:bg-emerald-600/20 transition-colors">
                    <step.icon size={18} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">{step.num}</div>
                  <h3 className="text-sm font-semibold text-surface-900 dark:text-white mb-1">{step.title}</h3>
                  <p className="text-xs text-surface-500 dark:text-surface-400">{step.desc}</p>
                </motion.div>
                {i < 3 && (
                  <motion.div
                    initial={{ scaleX: 0 }}
                    whileInView={{ scaleX: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 + 0.5 }}
                    className="hidden lg:block absolute top-1/2 -right-2.5 w-5 h-px bg-gradient-to-r from-emerald-500/50 to-violet-500/50 origin-left"
                  />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="bg-white dark:bg-surface-950 py-20 lg:py-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="max-w-xl mb-12">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 border border-amber-200/50 dark:border-amber-700/30 mb-4">
              <Star size={12} />
              <span>Success stories</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-surface-900 dark:text-white">
              Real people, real results
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
              >
                <motion.div
                  whileHover={{ y: -4, scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="bg-surface-50 dark:bg-surface-900/50 border border-surface-200 dark:border-surface-800 rounded-xl p-6 h-full flex flex-col group hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/5 transition-all duration-300"
                >
                  <Quote size={18} className="text-surface-300 dark:text-surface-600 mb-3 group-hover:text-emerald-400/50 transition-colors" />
                  <p className="text-sm text-surface-600 dark:text-surface-400 leading-relaxed flex-1">
                    &ldquo;{t.content}&rdquo;
                  </p>
                  <div className="mt-5 pt-4 border-t border-surface-200 dark:border-surface-800 flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-violet-600 flex items-center justify-center text-white text-xs font-semibold">
                      {t.initials}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-surface-900 dark:text-white">{t.name}</p>
                      <p className="text-xs text-surface-400">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING (light bg, subtle mesh) ─── */}
      <section id="pricing" className="relative py-20 lg:py-28 bg-surface-50 dark:bg-surface-900/50">
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div {...fadeUp()} className="max-w-xl mb-12">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 border border-emerald-200/50 dark:border-emerald-700/30 mb-4">
              <Sparkles size={12} />
              <span>Pricing</span>
            </span>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-surface-900 dark:text-white">
              Choose your plan
            </h2>
            <p className="mt-2 text-sm text-surface-500 dark:text-surface-400">
              Start free, upgrade when you need more.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {pricingPlans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                whileHover={{ y: -6, scale: 1.01 }}
                className={`relative flex flex-col rounded-xl bg-white dark:bg-surface-800/60 border transition-all duration-300 ${
                  plan.popular
                    ? 'border-emerald-500/50 shadow-lg shadow-emerald-500/10 scale-[1.02] z-10 hover:shadow-xl hover:shadow-emerald-500/15'
                    : 'border-surface-200 dark:border-surface-700/50 hover:border-surface-300 dark:hover:border-surface-600/50 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center space-x-1 bg-gradient-to-r from-emerald-600 to-violet-600 text-white text-xs font-medium px-3 py-1 rounded-full shadow-lg">
                      <Star size={10} className="fill-white" />
                      <span>Most popular</span>
                    </span>
                  </div>
                )}

                <div className="p-5 pb-0">
                  <h3 className="text-base font-semibold text-surface-900 dark:text-white">{plan.name}</h3>
                  <div className="mt-2 flex items-baseline space-x-1">
                    <span className="text-3xl font-bold text-surface-900 dark:text-white">{plan.price}</span>
                    <span className="text-xs text-surface-400">/{plan.period}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-surface-500">{plan.desc}</p>
                </div>

                <div className="p-5 flex-1 flex flex-col">
                  <ul className="space-y-2 flex-1">
                    {plan.features.map(([label, value]) => (
                      <li key={label} className="flex items-center gap-2">
                        {value === false ? (
                          <div className="w-3.5 h-3.5 rounded-full border-2 border-surface-200 dark:border-surface-600 shrink-0" />
                        ) : (
                          <Check size={13} className="text-emerald-500 shrink-0" />
                        )}
                        <span className={`text-xs ${value === false ? 'text-surface-300 dark:text-surface-600' : 'text-surface-700 dark:text-surface-300'}`}>
                          {label}
                        </span>
                        {typeof value === 'string' && (
                          <span className={`ml-auto text-[10px] font-medium px-1.5 py-0.5 rounded-full shrink-0 ${
                            value === 'Unlimited'
                              ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400'
                              : 'bg-surface-100 dark:bg-surface-700/50 text-surface-500 dark:text-surface-400'
                          }`}>
                            {value}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>

                  <Link href={plan.id === 'free' ? '/skill-audit' : '/plans'} className="mt-5 block">
                    <button className={`w-full py-2 rounded-lg text-xs font-semibold transition-all ${
                      plan.popular
                        ? 'bg-gradient-to-r from-emerald-600 to-violet-600 text-white hover:shadow-lg hover:shadow-emerald-600/25'
                        : 'bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-600 text-surface-900 dark:text-white hover:bg-surface-50 dark:hover:bg-surface-700'
                    }`}>
                      {plan.cta}
                    </button>
                  </Link>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative bg-gradient-to-br from-emerald-600 to-violet-700 dark:from-surface-800 dark:to-surface-900 py-20 lg:py-24 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-20 -right-20 w-[300px] h-[300px] rounded-full bg-white/10 blur-3xl animate-float" />
          <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] rounded-full bg-white/5 blur-3xl animate-float-delayed" />
        </div>
        <div className="relative max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div {...fadeUp()}>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-white mb-3">
              Ready to transform your career?
            </h2>
            <p className="text-sm text-emerald-100 dark:text-surface-400 mb-8 max-w-md mx-auto">
              Join thousands of professionals accelerating their growth with AI-powered career guidance.
            </p>
            <Link href="/skill-audit">
              <Button
                variant="secondary"
                size="lg"
                className="text-sm px-7 py-3 bg-white text-surface-900 hover:bg-emerald-50 border-0 shadow-xl"
              >
                Start Your Free Skill Audit
                <ArrowRight size={15} className="ml-2" />
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage