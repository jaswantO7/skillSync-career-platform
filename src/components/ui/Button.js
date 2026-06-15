'use client'

import { forwardRef } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const Button = forwardRef(({
  children,
  className,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  onClick,
  type = 'button',
  ...props
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-xl transition-all duration-200 focus-ring disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg hover:shadow-xl shadow-emerald-500/20 hover:shadow-emerald-500/30',
    secondary: 'bg-white dark:bg-surface-800/80 hover:bg-surface-50 dark:hover:bg-surface-700/80 text-surface-900 dark:text-surface-100 border border-surface-200 dark:border-surface-600/50 shadow-md hover:shadow-lg',
    ghost: 'bg-transparent hover:bg-surface-100 dark:hover:bg-surface-800 text-surface-700 dark:text-surface-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl',
    success: 'bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl',
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  }

  const handleClick = (e) => {
    if (disabled || loading) return
    onClick?.(e)
  }

  return (
    <motion.button
      ref={ref}
      type={type}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      onClick={handleClick}
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
      {...props}
    >
      {loading && (
        <div className="spinner mr-2" />
      )}
      
      {icon && iconPosition === 'left' && !loading && (
        <span className="mr-2">{icon}</span>
      )}
      
      {children}
      
      {icon && iconPosition === 'right' && !loading && (
        <span className="ml-2">{icon}</span>
      )}
    </motion.button>
  )
})

Button.displayName = 'Button'

export default Button