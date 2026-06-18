'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Sparkles, Check, Star, Quote, Brain, Route, Calendar, MessageCircle, Search, Map, GraduationCap, TrendingUp, ChevronLeft, ChevronRight, Rocket, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Navbar from '@/components/layout/Navbar'
import Footer from '@/components/layout/Footer'
import Button from '@/components/ui/Button'
import HeroShader from '@/components/landing/HeroShader'
import Roadmap3D from '@/components/landing/Roadmap3D'

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 30 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '-60px' },
  transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
})

const containerClass = 'max-w-[1280px] mx-auto px-2'

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-50 antialiased stitch-bg-soft">
      <Navbar />

      {/* ─── HERO ─── */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-surface-55 dark:bg-surface-950">
        <HeroShader />
        <div className={`${containerClass} grid lg:grid-cols-2 gap-16 items-center w-full relative z-10`}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="space-y-8"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-stitch-primary-container/10 border border-stitch-primary-container/20 rounded-full"
            >
              <Sparkles size={14} className="text-stitch-primary" />
              <span className="text-xs font-bold uppercase tracking-wider text-stitch-primary">AI-powered career platform</span>
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="font-display text-[44px] leading-[1.15] font-bold tracking-tight text-surface-900 dark:text-white"
            >
              Your AI Career<br />
              <span className="stitch-text-gradient">Growth Companion</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="text-base leading-relaxed text-surface-500 dark:text-surface-400 max-w-lg"
            >
              Transform your professional journey with AI-powered skill analysis, personalized learning roadmaps, and intelligent career guidance.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap gap-4"
            >
              <Link href="/skill-audit">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-2 bg-stitch-primary text-white px-6 py-3 rounded-full font-display text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  Get Free Skill Audit
                  <ArrowRight size={16} />
                </motion.button>
              </Link>
              <Link href="#how-it-works">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center border border-surface-300 dark:border-surface-600 px-6 py-3 rounded-full font-display text-sm font-semibold text-surface-900 dark:text-surface-200 hover:bg-surface-100 dark:hover:bg-surface-800/50 transition-all duration-300"
                >
                  See how it works
                </motion.button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.45 }}
              className="flex gap-12 pt-8 border-t border-surface-200 dark:border-surface-700"
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
                  <div className="font-display text-2xl font-semibold text-surface-900 dark:text-white">{val}</div>
                  <div className="text-xs font-semibold uppercase tracking-[0.1em] text-surface-500 dark:text-surface-400">{label}</div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, x: 30, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="relative"
          >
            <div
              className="bg-white/70 dark:bg-white/[0.08] backdrop-blur-xl rounded-2xl p-8 shadow-[0_10px_20px_rgba(20,27,43,0.04)] dark:shadow-[0_10px_20px_rgba(255,255,255,0.04)] border border-white/30 dark:border-white/20 [transform:rotate(2deg)] hover:[transform:rotate(0deg)] transition-transform duration-500 hover:shadow-2xl dark:hover:shadow-[0_20px_40px_rgba(255,255,255,0.07)]"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="font-display text-xl font-semibold text-surface-900 dark:text-white">Dashboard</span>
                <span className="bg-stitch-secondary-container/10 text-stitch-secondary px-3 py-1 rounded-full text-sm font-bold">Skill Score 82%</span>
              </div>
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="flex-1 h-3 bg-surface-100 dark:bg-white/10 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: '82%' }}
                      transition={{ duration: 1, delay: 0.8, ease: 'easeOut' }}
                      className="bg-stitch-primary h-full rounded-full"
                    />
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.1em] text-surface-500 dark:text-surface-400">Experience 6yr</span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  <div className="p-4 bg-surface-100/80 dark:bg-white/[0.06] backdrop-blur-sm rounded-xl border border-surface-200 dark:border-white/15 text-center hover:bg-stitch-primary/10 dark:hover:bg-white/15 transition-colors">
                    <div className="text-stitch-primary font-bold text-xl">87</div>
                    <div className="text-xs uppercase opacity-60 text-surface-500 dark:text-surface-400">Skill Score</div>
                  </div>
                  <div className="p-4 bg-surface-100/80 dark:bg-white/[0.06] backdrop-blur-sm rounded-xl border border-surface-200 dark:border-white/15 text-center hover:bg-stitch-secondary/10 dark:hover:bg-white/15 transition-colors">
                    <div className="text-stitch-secondary font-bold text-xl">6</div>
                    <div className="text-xs uppercase opacity-60 text-surface-500 dark:text-surface-400">Years Exp</div>
                  </div>
                  <div className="p-4 bg-surface-100/80 dark:bg-white/[0.06] backdrop-blur-sm rounded-xl border border-surface-200 dark:border-white/15 text-center hover:bg-stitch-secondary/10 dark:hover:bg-white/15 transition-colors">
                    <div className="text-stitch-secondary font-bold text-xl">5</div>
                    <div className="text-xs uppercase opacity-60 text-surface-500 dark:text-surface-400">Roadmaps</div>
                  </div>
                </div>
                <div className="p-4 bg-stitch-secondary/5 dark:bg-white/[0.06] backdrop-blur-sm border border-stitch-secondary/15 dark:border-white/15 rounded-xl flex items-center gap-3">
                  <MessageCircle size={20} className="text-stitch-secondary dark:text-stitch-secondary-fixed" />
                  <p className="text-sm font-medium text-surface-900 dark:text-white">AI Mentor: Focus on system design...</p>
                </div>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: -30, rotate: -2 }}
              animate={{ opacity: 1, x: 0, rotate: -2 }}
              transition={{ duration: 0.7, delay: 0.6 }}
              className="absolute -bottom-8 -left-8 bg-white/70 dark:bg-white/[0.08] backdrop-blur-xl p-6 rounded-2xl hidden md:block w-64 shadow-xl border border-white/30 dark:border-white/20 hover:[transform:rotate(0deg)] transition-all duration-500"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-full bg-stitch-primary-fixed dark:bg-stitch-primary/30 flex items-center justify-center">
                  <Check size={16} className="text-stitch-primary" />
                </div>
                <span className="font-semibold text-sm text-surface-900 dark:text-white">Resume Analyzed</span>
              </div>
              <div className="space-y-2">
                <div className="w-full h-2 bg-surface-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-stitch-primary/40 w-full animate-pulse rounded-full" />
                </div>
                <div className="w-3/4 h-2 bg-surface-100 dark:bg-white/10 rounded-full overflow-hidden">
                  <div className="h-full bg-stitch-primary/40 w-full animate-[pulse_2s_ease-in-out_infinite_0.5s] rounded-full" />
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── FEATURES (Bento Grid) ─── */}
      <section id="features" className="py-[120px] bg-surface-55 dark:bg-surface-900">
        <div className={`${containerClass}`}>
          <motion.div {...fadeUp()} className="text-center max-w-3xl mx-auto mb-20 space-y-4">
            <span className="inline-flex items-center gap-2 px-3 py-1 bg-stitch-secondary-container/10 border border-stitch-secondary-container/20 rounded-full">
              <Sparkles size={12} className="text-stitch-secondary" />
              <span className="text-xs font-bold uppercase tracking-wider text-stitch-secondary">Core features</span>
            </span>
            <h2 className="font-display text-[28px] leading-[1.25] font-semibold text-surface-900 dark:text-white">Everything you need to grow</h2>
            <p className="text-base text-surface-500 dark:text-surface-400">AI-driven tools that analyze, plan, teach, and mentor — all in one place.</p>
          </motion.div>

          <div className="grid lg:grid-cols-12 gap-4">
            {/* AI Skill Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-7 group"
            >
              <div className="bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl rounded-3xl p-5 h-full border-t-4 border-t-stitch-primary dark:border-t-stitch-primary flex flex-col justify-between shadow-[0_10px_20px_rgba(20,27,43,0.04)] dark:shadow-[0_10px_20px_rgba(255,255,255,0.04)] border border-white/30 dark:border-white/15 transition-all hover:translate-y-[-8px] hover:shadow-2xl dark:hover:shadow-[0_20px_40px_rgba(255,255,255,0.07)]">
                <div className="space-y-3">
                  <div className="w-10 h-10 bg-stitch-primary/10 dark:bg-stitch-primary/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                    <Brain size={24} className="text-stitch-primary dark:text-stitch-primary-fixed" />
                  </div>
                  <h3 className="font-display text-[22px] leading-[1.3] font-semibold text-surface-900 dark:text-white">AI Skill Analysis</h3>
                  <p className="text-base leading-relaxed text-surface-500 dark:text-white/60 max-w-md">
                    Upload your resume for instant AI-powered skill extraction, gap analysis, and market positioning. Know exactly where you stand.
                  </p>
                  <ul className="space-y-2">
                    {['AI-powered analysis', 'Personalized results', 'Industry benchmarking'].map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <Check size={20} className="text-stitch-primary dark:text-stitch-primary-fixed" />
                        <span className="font-medium text-surface-900 dark:text-white/80">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-2 bg-surface-100 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl p-3 border border-surface-200 dark:border-white/10">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-surface-900 dark:text-white">Resume uploaded</span>
                    <span className="text-xs text-surface-500 dark:text-white/50">Skills extracted: 12</span>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <span className="px-3 py-1 bg-stitch-primary-fixed/30 dark:bg-stitch-primary-fixed/20 backdrop-blur-sm text-stitch-primary dark:text-stitch-primary-fixed text-xs font-bold rounded">Frontend</span>
                      <span className="px-3 py-1 bg-stitch-secondary-fixed/30 dark:bg-stitch-secondary-fixed/20 backdrop-blur-sm text-stitch-secondary dark:text-stitch-secondary-fixed text-xs font-bold rounded">Backend</span>
                    </div>
                    <div className="bg-[#ffdad6]/10 dark:bg-white/[0.04] backdrop-blur-sm p-2 rounded-lg border border-[#ffdad6]/30 dark:border-white/10">
                      <p className="text-xs font-semibold text-[#ba1a1a] dark:text-red-300">Gap: System Design · 3 courses recommended</p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right column */}
            <div className="lg:col-span-5 flex flex-col gap-4">
              {/* Smart Career Paths */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="group flex-1"
              >
                <div className="bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl rounded-3xl p-5 h-full border-t-4 border-t-stitch-secondary dark:border-t-stitch-secondary flex flex-col shadow-[0_10px_20px_rgba(20,27,43,0.04)] dark:shadow-[0_10px_20px_rgba(255,255,255,0.04)] border border-white/30 dark:border-white/15 transition-all hover:translate-y-[-8px] hover:shadow-2xl dark:hover:shadow-[0_20px_40px_rgba(255,255,255,0.07)]">
                  <div className="w-10 h-10 bg-stitch-secondary/10 dark:bg-stitch-secondary/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
                    <Route size={20} className="text-stitch-secondary dark:text-stitch-secondary-fixed" />
                  </div>
                  <h3 className="font-display text-xl leading-[1.3] font-semibold text-surface-900 dark:text-white mb-2">Smart Career Paths</h3>
                  <p className="text-sm text-surface-500 dark:text-white/60 mb-3">Personalized career progression recommendations built from your unique skill profile.</p>
                  <Roadmap3D />
                  <div className="space-y-2 mt-3">
                    <div className="flex items-center gap-3 p-3 bg-surface-100 dark:bg-white/[0.04] backdrop-blur-sm rounded-xl border border-surface-200 dark:border-white/10 hover:border-stitch-primary transition-colors">
                      <div className="w-2 h-2 rounded-full bg-stitch-primary" />
                      <span className="text-xs font-semibold text-surface-900 dark:text-white/90">Month 1: JavaScript fundamentals</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-surface-100 dark:bg-white/[0.04] backdrop-blur-sm rounded-xl border border-surface-200 dark:border-white/10 opacity-70 hover:opacity-100 transition-opacity">
                      <div className="w-2 h-2 rounded-full bg-stitch-secondary" />
                      <span className="text-xs font-semibold text-surface-900 dark:text-white/90">Month 2: React + TypeScript</span>
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Monthly Roadmaps */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                className="group flex-1"
              >
                <div className="bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl rounded-3xl p-5 border-t-4 border-t-stitch-secondary dark:border-t-stitch-secondary shadow-[0_10px_20px_rgba(20,27,43,0.04)] dark:shadow-[0_10px_20px_rgba(255,255,255,0.04)] border border-white/30 dark:border-white/15 transition-all hover:translate-y-[-8px] hover:shadow-2xl dark:hover:shadow-[0_20px_40px_rgba(255,255,255,0.07)]">
                  <div className="w-10 h-10 bg-stitch-secondary/10 dark:bg-stitch-secondary/20 backdrop-blur-sm rounded-xl flex items-center justify-center mb-3">
                    <Calendar size={20} className="text-stitch-secondary dark:text-stitch-secondary-fixed" />
                  </div>
                  <h3 className="font-display text-xl leading-[1.3] font-semibold text-surface-900 dark:text-white mb-2">Monthly Roadmaps</h3>
                  <div className="p-3 bg-surface-100 dark:bg-white/[0.04] backdrop-blur-sm rounded-2xl border border-surface-200 dark:border-white/10 space-y-2">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-surface-200 dark:bg-white/10 backdrop-blur-sm flex-shrink-0" />
                      <div className="bg-surface-100 dark:bg-white/[0.04] backdrop-blur-sm p-2 rounded-lg text-[10px] text-surface-900 dark:text-white/80">
                        Alex (AI Mentor): You have a 3-month gap in cloud skills.
                      </div>
                    </div>
                    <div className="flex items-start gap-3 justify-end">
                      <div className="bg-stitch-primary/10 dark:bg-stitch-primary/20 backdrop-blur-sm p-2 rounded-lg text-[10px] text-surface-900 dark:text-white/80">
                        What courses do you recommend?
                      </div>
                      <div className="w-8 h-8 rounded-full bg-stitch-primary-fixed-dim dark:bg-white/10 backdrop-blur-sm flex-shrink-0" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section id="how-it-works" className="py-[120px] bg-surface-55 dark:bg-surface-900">
        <div className={`${containerClass}`}>
          <motion.div {...fadeUp()} className="text-center mb-16 space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-stitch-primary">How it works</span>
            <h2 className="font-display text-[28px] leading-[1.25] font-semibold text-surface-900 dark:text-white">Four steps to grow</h2>
            <p className="text-surface-500 dark:text-surface-400">From analysis to career advancement — we guide you every step.</p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-8 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-[2px] bg-surface-200 dark:bg-surface-700 -translate-y-1/2 z-0" />
            {[
              { num: '01', icon: Search, title: 'Analyze', desc: 'Upload your resume for AI skill extraction' },
              { num: '02', icon: Map, title: 'Plan', desc: 'Get personalized career paths and roadmaps' },
              { num: '03', icon: GraduationCap, title: 'Learn', desc: 'Follow curated resources and build projects' },
              { num: '04', icon: TrendingUp, title: 'Grow', desc: 'Chat with your AI mentor, advance your career' },
            ].map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                className="relative z-10 text-center space-y-6"
              >
                <div className="w-16 h-16 mx-auto bg-white dark:bg-white/10 backdrop-blur-sm rounded-full border-2 border-stitch-primary flex items-center justify-center text-stitch-primary dark:text-stitch-primary-fixed font-bold text-xl shadow-lg transition-transform hover:scale-110">
                  {step.num}
                </div>
                <div className="bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl p-6 rounded-2xl shadow-[0_10px_20px_rgba(20,27,43,0.04)] dark:shadow-[0_10px_20px_rgba(255,255,255,0.04)] border border-white/30 dark:border-white/15 stitch-hover-float">
                  <step.icon size={28} className="text-stitch-primary dark:text-stitch-primary-fixed mx-auto mb-3" />
                  <h4 className="font-semibold text-surface-900 dark:text-white mb-2">{step.title}</h4>
                  <p className="text-sm text-surface-500 dark:text-white/60">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="py-[120px] bg-surface-55 dark:bg-surface-900">
        <div className={`${containerClass}`}>
          <motion.div {...fadeUp()} className="flex justify-between items-end mb-16">
            <div className="space-y-4">
              <span className="text-xs font-bold uppercase tracking-[0.1em] text-stitch-secondary">Success stories</span>
              <h2 className="font-display text-[28px] leading-[1.25] font-semibold text-surface-900 dark:text-white">Real people, real results</h2>
            </div>
            <div className="hidden md:flex gap-4">
              <div className="w-12 h-12 rounded-full border border-surface-300 dark:border-surface-600 flex items-center justify-center text-surface-500 dark:text-surface-400 hover:bg-stitch-primary hover:text-white transition-all duration-300 cursor-pointer">
                <ChevronLeft size={20} />
              </div>
              <div className="w-12 h-12 rounded-full border border-surface-300 dark:border-surface-600 flex items-center justify-center text-surface-500 dark:text-surface-400 hover:bg-stitch-primary hover:text-white transition-all duration-300 cursor-pointer">
                <ChevronRight size={20} />
              </div>
            </div>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: 'Sarah Chen', role: 'Software Engineer → Senior Developer', content: 'SkillSync identified gaps I didn\'t know I had. The roadmap was so precise I got promoted in 8 months.', initials: 'SC', container: '#00855d', text: '#f5fff7' },
              { name: 'Marcus Rodriguez', role: 'Marketing → Growth Manager', content: 'The AI mentor feels like having a career coach in your pocket. It\'s uncanny how relevant the advice is.', initials: 'MR', container: '#8a4cfc', text: '#fffbff' },
              { name: 'Emily Watson', role: 'Data Analyst → ML Engineer', content: 'Built my entire portfolio around the project suggestions. Landed my dream role at a top AI startup.', initials: 'EW', container: '#316bf3', text: '#fefcff' },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                className="bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl p-8 rounded-3xl shadow-[0_10px_20px_rgba(20,27,43,0.04)] dark:shadow-[0_10px_20px_rgba(255,255,255,0.04)] border border-white/30 dark:border-white/15 space-y-8 flex flex-col justify-between stitch-hover-float"
              >
                <Quote size={24} className="text-surface-300 dark:text-white/30" />
                <p className="text-base leading-relaxed italic text-surface-900 dark:text-white/80 flex-1">
                  &ldquo;{t.content}&rdquo;
                </p>
                <div className="flex items-center gap-4">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-sm"
                    style={{ backgroundColor: t.container, color: t.text }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <div className="font-semibold text-surface-900 dark:text-white">{t.name}</div>
                    <div className="text-xs text-surface-500 dark:text-white/50">{t.role}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section id="pricing" className="py-[120px] bg-surface-900 dark:bg-surface-800 text-white rounded-t-[4rem]">
        <div className={`${containerClass}`}>
          <motion.div {...fadeUp()} className="text-center mb-20 space-y-4">
            <span className="text-xs font-bold uppercase tracking-[0.1em] text-stitch-primary-fixed">Pricing</span>
            <h2 className="font-display text-[28px] leading-[1.25] font-semibold text-white">Choose your plan</h2>
            <p className="text-[#dce2f7]">Start free, upgrade when you need more.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 items-start">
            {[
              {
                name: 'Free', price: '$0', period: 'forever', desc: 'Core features to get started',
                features: [['Resume & Skill Analysis', true], ['AI Career Paths', '1 path'], ['Learning Roadmaps', '1/mo'], ['AI Mentor Chat', '5/mo'], ['Portfolio Projects', 'Limited', true], ['Progress Analytics', false]],
                cta: 'Get Started Free', href: '/skill-audit', popular: false,
              },
              {
                name: 'Pro', price: '$29', period: 'month', desc: 'Full experience, no limits',
                features: [['Everything in Free', true], ['AI Career Paths', 'Unlimited'], ['Learning Roadmaps', 'Unlimited'], ['AI Mentor Chat', 'Unlimited'], ['Portfolio Projects', 'Unlimited'], ['Progress Analytics', true]],
                cta: 'Start Pro Trial', href: '/plans', popular: true,
              },
              {
                name: 'Enterprise', price: '$99', period: 'month', desc: 'For teams & organizations',
                features: [['Everything in Pro', true], ['Team management', true], ['Custom integrations', true], ['Advanced analytics', true], ['Dedicated support', true], ['Custom AI training', true]],
                cta: 'Contact Sales', href: '/plans', popular: false,
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.6, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -8 }}
                className={`relative rounded-[2rem] p-10 flex flex-col border transition-shadow duration-300 ${
                  plan.popular
                    ? 'bg-white/10 dark:bg-white/[0.06] backdrop-blur-xl border-2 border-stitch-primary md:scale-105 shadow-2xl dark:shadow-[0_0_40px_rgba(255,255,255,0.04)] z-10 hover:shadow-[0_20px_60px_rgba(0,105,72,0.3)] dark:hover:shadow-[0_20px_60px_rgba(0,170,110,0.15)]'
                    : 'bg-white/5 dark:bg-white/[0.04] backdrop-blur-xl border border-white/10 dark:border-white/10 hover:border-white/30 hover:shadow-2xl dark:hover:shadow-[0_20px_40px_rgba(255,255,255,0.07)]'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-stitch-primary px-6 py-1 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-1 shadow-lg">
                    <Star size={14} className="fill-white" />
                    Most popular
                  </div>
                )}
                <div className="mb-8">
                  <h3 className="font-display text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold">{plan.price}</span>
                    <span className="text-[#dce2f7]">/{plan.period}</span>
                  </div>
                  <p className="text-sm text-[#dce2f7] mt-4">{plan.desc}</p>
                </div>
                <ul className="space-y-4 mb-10 flex-1">
                  {plan.features.map(([label, value, disabled]) => (
                    <li key={label} className={`flex items-center gap-3 text-sm ${disabled ? 'opacity-50' : ''}`}>
                      {value === false ? (
                        <span className="flex items-center gap-3">
                          <div className="w-4 h-4 rounded-full border-2 border-white/30 shrink-0" />
                          <span className="text-white/50">{label}</span>
                        </span>
                      ) : (
                        <>
                          <CheckCircle size={18} className="text-stitch-primary-fixed shrink-0" />
                          <span className="flex items-center justify-between w-full">
                            <span>{label}</span>
                            {typeof value === 'string' && (
                              <span className={`ml-2 text-xs font-bold px-2 py-0.5 rounded ${
                                value === 'Unlimited' ? 'text-stitch-primary-fixed' : 'bg-white/10'
                              }`}>
                                {value}
                              </span>
                            )}
                          </span>
                        </>
                      )}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href}>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full py-4 rounded-xl font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-stitch-primary text-white shadow-lg shadow-stitch-primary/20'
                        : 'border border-white/20 hover:bg-white hover:text-surface-900'
                    }`}
                  >
                    {plan.cta}
                  </motion.button>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="relative py-[120px] overflow-hidden bg-surface-55 dark:bg-surface-900">
        <div className={`${containerClass} text-center relative z-10`}>
          <motion.div {...fadeUp()} className="max-w-3xl mx-auto space-y-8">
            <h2 className="font-display text-[44px] leading-[1.15] font-bold tracking-tight text-surface-900 dark:text-white">
              Ready to transform your career?
            </h2>
            <p className="text-base text-surface-500 dark:text-surface-400">
              Join thousands of professionals accelerating their growth with AI-powered career guidance.
            </p>
            <div className="pt-4">
              <Link href="/skill-audit">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="inline-flex items-center gap-3 bg-stitch-primary text-white px-8 py-4 rounded-full font-display text-sm font-semibold shadow-xl hover:shadow-2xl transition-all duration-300"
                >
                  Start Your Free Skill Audit
                  <Rocket size={18} />
                </motion.button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ─── TRUSTED BY ─── */}
      <section className="bg-surface-55 dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700">
        <div className={`${containerClass} py-12`}>
          <p className="text-xs font-medium uppercase tracking-[0.15em] text-surface-400 dark:text-surface-500 text-center mb-6">
            Trusted by professionals at
          </p>
          <div className="flex flex-wrap justify-center gap-x-10 gap-y-3">
            {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Spotify', 'Adobe'].map((name) => (
              <span key={name} className="font-display text-base font-medium text-surface-500 dark:text-surface-400">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

export default LandingPage
