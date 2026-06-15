'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const Progress = ({ 
  value = 0, 
  max = 100, 
  className,
  showLabel = false,
  label,
  size = 'md',
  color = 'primary',
  ...props 
}) => {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100)
  
  const sizes = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  }
  
  const colors = {
    primary: 'bg-emerald-600',
    secondary: 'bg-violet-600',
    success: 'bg-green-600',
    warning: 'bg-yellow-600',
    danger: 'bg-red-600',
  }

  return (
    <div className="w-full">
      {(showLabel || label) && (
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
            {label}
          </span>
          {showLabel && (
            <span className="text-sm text-surface-500 dark:text-surface-400">
              {Math.round(percentage)}%
            </span>
          )}
        </div>
      )}
      
      <div
        className={cn(
          'w-full bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden',
          sizes[size],
          className
        )}
        {...props}
      >
        <motion.div
          className={cn('h-full rounded-full', colors[color])}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

export default Progress