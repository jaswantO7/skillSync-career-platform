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
    primary: 'bg-stitch-primary hover:bg-stitch-primary/90 text-white font-semibold shadow-lg hover:shadow-xl shadow-stitch-primary/20 hover:shadow-stitch-primary/30 dark:shadow-[0_4px_20px_rgba(0,170,110,0.15)] dark:hover:shadow-[0_4px_20px_rgba(0,170,110,0.25)]',
    secondary: 'bg-white/70 dark:bg-white/[0.06] backdrop-blur-xl hover:bg-white dark:hover:bg-white/[0.10] text-surface-900 dark:text-white/80 border border-surface-200 dark:border-white/15 shadow-md hover:shadow-lg dark:shadow-[0_4px_20px_rgba(255,255,255,0.04)] dark:hover:shadow-[0_4px_20px_rgba(255,255,255,0.07)]',
    ghost: 'bg-transparent hover:bg-surface-100 dark:hover:bg-white/10 text-surface-700 dark:text-white/70',
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