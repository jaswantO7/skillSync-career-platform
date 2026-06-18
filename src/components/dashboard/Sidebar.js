'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FileText,
  Target,
  Map,
  FolderOpen,
  MessageCircle,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
  AlertTriangle,
  Sun,
  Moon,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { api } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'

const avatarGradients = {
  sunset: 'from-orange-500 to-pink-500',
  ocean: 'from-cyan-500 to-blue-500',
  forest: 'from-green-500 to-emerald-500',
  lavender: 'from-purple-500 to-indigo-500',
  ruby: 'from-red-500 to-rose-500',
  amber: 'from-yellow-500 to-orange-500',
  teal: 'from-teal-500 to-cyan-500',
  violet: 'from-violet-500 to-purple-500',
}

const Sidebar = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [aiStatus, setAiStatus] = useState({ mode: 'checking', label: 'Checking...' })
  const { user, userProfile, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const pathname = usePathname()

  useEffect(() => {
    setMobileOpen(false)
  }, [pathname])

  useEffect(() => {
    const checkAI = async () => {
      try {
        const res = await api.get('/health')
        const data = res.data
        if (data.aiMode === 'grok') {
          setAiStatus({ mode: 'full', label: 'AI: Groq' })
        } else if (data.aiMode === 'openai') {
          setAiStatus({ mode: 'full', label: 'AI: OpenAI' })
        } else {
          setAiStatus({ mode: 'limited', label: 'AI: Unavailable' })
        }
      } catch {
        setAiStatus({ mode: 'unknown', label: 'AI: Unknown' })
      }
    }
    checkAI()
  }, [])

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Skill Audit', href: '/skill-audit', icon: FileText },
    { name: 'Career Path', href: '/career-path', icon: Target },
    { name: 'Roadmap', href: '/roadmap', icon: Map },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
    { name: 'Mentor Chat', href: '/mentor', icon: MessageCircle },
    { name: 'Settings', href: '/settings', icon: Settings },
  ]

  const profile = {
    name: userProfile?.name || user?.displayName || 'User',
    role: userProfile?.currentRole || '',
    avatar: userProfile?.profile?.avatar || 'sunset',
    gradient: avatarGradients[userProfile?.profile?.avatar] || avatarGradients.sunset,
    initial: (userProfile?.name || user?.displayName || 'U').charAt(0).toUpperCase(),
  }

  const sidebarContent = (
    <>
      {/* Company branding */}
      <div className="p-4 border-b border-surface-200/50 dark:border-surface-700/30">
        <Link href="/" className="flex items-center space-x-3" onClick={() => setMobileOpen(false)}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-600 to-violet-600 flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-white text-sm font-bold">S</span>
          </div>
          {!collapsed && (
            <span className="font-display text-lg font-semibold text-surface-900 dark:text-white">SkillSync</span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative',
                    isActive
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 shadow-sm'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700/50 hover:text-surface-900 dark:hover:text-surface-100'
                  )}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {!collapsed && <span className="ml-3">{item.name}</span>}

                  {isActive && (
                    <motion.div
                      className="absolute left-0 top-1 bottom-1 w-0.5 bg-emerald-500 rounded-r-full"
                      layoutId="activeIndicator"
                    />
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-surface-200/50 dark:border-surface-700/30 p-3 space-y-2">
        {/* AI status */}
        <div className="flex items-center space-x-2 px-3 py-1.5">
          <div className={`w-1.5 h-1.5 rounded-full ${
            aiStatus.mode === 'checking' ? 'bg-surface-400 animate-pulse' :
            aiStatus.mode === 'full' ? 'bg-emerald-500' :
            'bg-red-500'
          }`} />
          <span className="text-xs text-surface-500 dark:text-surface-400">{aiStatus.label}</span>
          {aiStatus.mode !== 'full' && aiStatus.mode !== 'checking' && (
            <AlertTriangle size={10} className="text-amber-500" />
          )}
        </div>

        {/* Upgrade card */}
        {!collapsed && (
          <div className="bg-gradient-to-br from-emerald-600 to-violet-600 rounded-xl p-3 text-white shadow-lg">
            <p className="font-semibold text-xs mb-1">Upgrade to Pro</p>
            <p className="text-emerald-100/80 text-[10px] mb-2 leading-relaxed">
              Unlock unlimited AI chats and advanced features
            </p>
            <Link href="/plans" className="inline-block bg-white/20 hover:bg-white/30 text-white text-[10px] font-medium px-2.5 py-1 rounded-lg backdrop-blur-sm transition-all" onClick={() => setMobileOpen(false)}>
              Learn More
            </Link>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="flex items-center space-x-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700/50 hover:text-surface-900 dark:hover:text-surface-100 transition-all"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          {!collapsed && <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>}
        </button>

        {/* User + Sign out */}
        <Link href="/settings" className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700/50 transition-all group" onClick={() => setMobileOpen(false)}>
          <div className="flex items-center space-x-3 min-w-0">
            <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${profile.gradient} flex items-center justify-center shrink-0`}>
              <span className="text-white text-[10px] font-semibold">{profile.initial}</span>
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-surface-900 dark:text-white truncate">{profile.name}</p>
              </div>
            )}
          </div>
          <button
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); logout(); setMobileOpen(false) }}
            className="shrink-0 p-1 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
            title="Sign out"
          >
            <LogOut size={14} />
          </button>
        </Link>
      </div>
    </>
  )

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <div className="fixed inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
            <motion.div
              className="fixed left-0 top-0 bottom-0 w-64 bg-white/95 dark:bg-surface-900/95 backdrop-blur-xl border-r border-surface-200/50 dark:border-surface-700/30 flex flex-col shadow-2xl"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              {sidebarContent}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.div
        className={cn(
          'hidden lg:flex bg-white/80 dark:bg-surface-900/80 backdrop-blur-xl border-r border-surface-200/50 dark:border-surface-700/30 flex-col transition-all duration-300',
          collapsed ? 'w-16' : 'w-64'
        )}
        animate={{ width: collapsed ? 64 : 256 }}
      >
        {sidebarContent}
      </motion.div>

      {/* Floating hamburger for mobile */}
      <button
        onClick={() => setMobileOpen(true)}
        className={`fixed top-4 left-4 z-50 lg:hidden w-9 h-9 rounded-lg bg-white/90 dark:bg-surface-800/90 backdrop-blur-sm border border-surface-200 dark:border-surface-700 flex items-center justify-center text-surface-600 dark:text-surface-400 shadow-lg ${mobileOpen ? 'hidden' : ''}`}
        aria-label="Open sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
    </>
  )
}

export default Sidebar
