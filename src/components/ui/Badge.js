'use client'

import { cn } from '@/lib/utils'

const Badge = ({ 
  children, 
  variant = 'default',
  size = 'sm',
  className,
  ...props 
}) => {
  const variants = {
    default: 'bg-surface-100 text-surface-800 dark:bg-surface-800 dark:text-surface-200',
    primary: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    secondary: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
    success: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    outline: 'border border-surface-200 text-surface-800 dark:border-surface-700 dark:text-surface-200',
  }
  
  const sizes = {
    xs: 'px-2 py-0.5 text-xs',
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  }

  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}

export default Badge