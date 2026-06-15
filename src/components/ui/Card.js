'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

const Card = ({ 
  children, 
  className, 
  hover = false, 
  onClick,
  ...props 
}) => {
  const Component = onClick ? motion.div : 'div'
  
  return (
    <motion.div
      className={cn(
        'card',
        hover && 'card-hover',
        className
      )}
      onClick={onClick}
      whileHover={hover ? { scale: 1.02, y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      {...props}
    >
      {children}
    </motion.div>
  )
}

const CardHeader = ({ children, className, ...props }) => (
  <div className={cn('mb-4', className)} {...props}>
    {children}
  </div>
)

const CardTitle = ({ children, className, ...props }) => (
  <h3 className={cn('text-lg font-semibold text-surface-900 dark:text-surface-50', className)} {...props}>
    {children}
  </h3>
)

const CardDescription = ({ children, className, ...props }) => (
  <p className={cn('text-sm text-surface-500 dark:text-surface-400 mt-1', className)} {...props}>
    {children}
  </p>
)

const CardContent = ({ children, className, ...props }) => (
  <div className={cn('', className)} {...props}>
    {children}
  </div>
)

const CardFooter = ({ children, className, ...props }) => (
  <div className={cn('mt-4 pt-4 border-t border-surface-200 dark:border-surface-700', className)} {...props}>
    {children}
  </div>
)

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter }