'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Sun, Moon, User, LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import Button from '@/components/ui/Button'
import { cn } from '@/lib/utils'

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, userProfile, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

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

  const navigation = [
    { name: 'Features', href: '#features' },
    { name: 'How it Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'About', href: '#about' },
  ]

  const handleLogout = async () => {
    await logout()
    setShowUserMenu(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 dark:bg-surface-950/70 backdrop-blur-2xl border-b border-surface-200/10 dark:border-surface-700/10 shadow-lg shadow-surface-900/10 dark:shadow-white/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2.5 group">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-violet-600 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/30 transition-shadow">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-display font-bold text-xl text-surface-900 dark:text-white">
              SkillSync
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-surface-600 dark:text-surface-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium text-sm transition-colors duration-200"
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-3">
            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>

            {user ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2.5 p-1.5 pr-3 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
                >
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${avatarGradients[userProfile?.profile?.avatar] || 'from-emerald-500 to-violet-600'} flex items-center justify-center shadow-sm`}>
                    <span className="text-white text-xs font-semibold">
                      {userProfile?.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                    {userProfile?.name || user.displayName || 'User'}
                  </span>
                </button>

                <AnimatePresence>
                  {showUserMenu && (
                    <motion.div
                      className="absolute right-0 mt-2 w-48 bg-white dark:bg-surface-800 rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 py-1.5"
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-2 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700/50"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <User size={15} />
                        <span>Dashboard</span>
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center space-x-2 w-full px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-700/50"
                      >
                        <LogOut size={15} />
                        <span>Sign Out</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
            >
              {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-surface-500 hover:text-surface-900 dark:hover:text-surface-100 hover:bg-surface-100 dark:hover:bg-surface-800 transition-all"
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden bg-white dark:bg-surface-900 border-t border-surface-200 dark:border-surface-700"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="px-4 py-6 space-y-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block text-surface-700 dark:text-surface-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-medium py-2 transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              <div className="pt-4 border-t border-surface-200 dark:border-surface-700">
                {user ? (
                  <div className="space-y-3">
                    <Link href="/dashboard" onClick={() => setIsOpen(false)}>
                      <Button variant="secondary" className="w-full">
                        Dashboard
                      </Button>
                    </Link>
                    <Button 
                      variant="ghost" 
                      className="w-full" 
                      onClick={() => {
                        handleLogout()
                        setIsOpen(false)
                      }}
                    >
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <Link href="/auth/signin" onClick={() => setIsOpen(false)}>
                      <Button variant="ghost" className="w-full">
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                      <Button variant="primary" className="w-full">
                        Get Started
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}

export default Navbar