'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Bell, User, LogOut, Settings, Sun, Moon } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import { generateAvatar } from '@/lib/utils'

const DashboardHeader = () => {
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const { user, userProfile, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const notifRef = useRef(null)
  const userMenuRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const notifications = [
    {
      id: 1,
      title: 'New skill recommendation',
      message: 'Based on your progress, we recommend learning TypeScript',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 2,
      title: 'Weekly goal achieved!',
      message: 'Congratulations! You completed 10 hours of learning this week',
      time: '1 day ago',
      unread: false
    },
    {
      id: 3,
      title: 'New project suggestion',
      message: 'Check out this React portfolio project that matches your skills',
      time: '2 days ago',
      unread: false
    }
  ]

  const handleLogout = async () => {
    await logout()
    setShowUserMenu(false)
  }

  return (
    <header className="glass-nav px-3 sm:px-6 py-2 sm:py-3 relative z-40">
      <div className="flex items-center justify-end sm:justify-between">
        <div className="flex-1 max-w-md hidden sm:block">
          <Input
            placeholder="Search skills, projects, or resources..."
            icon={<Search size={20} />}
            className="w-full"
          />
        </div>

        <div className="flex items-center space-x-1 sm:space-x-3 ml-1 sm:ml-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
            icon={theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          />

          <div className="relative" ref={notifRef}>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 relative"
            >
              <Bell size={20} />
              {notifications.some(n => n.unread) && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
              )}
            </Button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div
                  className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-surface-800/95 backdrop-blur-xl rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 py-2 z-[60]"
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.2 }}
                  style={{ transformOrigin: 'top right' }}
                >
                  <div className="px-4 py-2 border-b border-surface-200 dark:border-surface-700">
                    <h3 className="font-medium text-surface-900 dark:text-white">Notifications</h3>
                  </div>
                  <div className="max-h-80 overflow-y-auto">
                    {notifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={`px-4 py-3 hover:bg-surface-50 dark:hover:bg-white/10 cursor-pointer ${
                          notification.unread ? 'bg-stitch-primary/5 dark:bg-stitch-primary/10' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-surface-900 dark:text-white">
                              {notification.title}
                            </p>
                            <p className="text-sm text-surface-500 dark:text-surface-400 mt-1">
                              {notification.message}
                            </p>
                            <p className="text-xs text-surface-400 dark:text-surface-500 mt-1">
                              {notification.time}
                            </p>
                          </div>
                          {notification.unread && (
                            <div className="w-2 h-2 bg-stitch-primary rounded-full ml-2 mt-1"></div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-4 py-2 border-t border-surface-200 dark:border-surface-700">
                    <button className="text-sm text-stitch-primary hover:text-stitch-primary/80 dark:text-stitch-primary-fixed font-medium">
                      View all notifications
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="relative" ref={userMenuRef}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center space-x-3 p-1.5 pr-3 rounded-xl hover:bg-surface-100 dark:hover:bg-white/10 transition-all"
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stitch-primary to-stitch-secondary flex items-center justify-center shadow-sm">
                <span className="text-white text-xs font-semibold">
                  {userProfile?.name?.charAt(0) || user?.email?.charAt(0)?.toUpperCase() || 'U'}
                </span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-surface-900 dark:text-white">
                  {userProfile?.name || user?.displayName || 'User'}
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400">
                  {userProfile?.currentRole || 'Professional'}
                </p>
              </div>
            </button>

            <AnimatePresence>
              {showUserMenu && (
                <motion.div
              className="absolute right-0 mt-2 w-56 max-w-[calc(100vw-1.5rem)] bg-white dark:bg-surface-800/95 backdrop-blur-xl rounded-xl shadow-xl border border-surface-200 dark:border-surface-700 py-2 z-[60]"
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              style={{ transformOrigin: 'top right' }}
            >
              <div className="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                <p className="font-medium text-surface-900 dark:text-white">
                  {userProfile?.name || user?.displayName || 'User'}
                </p>
                <p className="text-sm text-surface-500 dark:text-surface-400">
                  {user?.email}
                </p>
              </div>
              
              <div className="py-2">
                <Link
                  href="/settings?tab=profile"
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700/50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <User size={16} />
                  <span>Profile Settings</span>
                </Link>
                
                <Link
                  href="/settings?tab=account"
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700/50"
                  onClick={() => setShowUserMenu(false)}
                >
                  <Settings size={16} />
                  <span>Account Settings</span>
                </Link>
              </div>
              
              <div className="border-t border-surface-200 dark:border-surface-700 pt-2">
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-3 w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-surface-50 dark:hover:bg-surface-700/50"
                >
                  <LogOut size={16} />
                  <span>Sign Out</span>
                </button>
              </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </header>
  )
}

export default DashboardHeader