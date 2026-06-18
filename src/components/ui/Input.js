'use client'

import { forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Input = forwardRef(({
  className,
  type = 'text',
  label,
  error,
  helper,
  icon,
  iconPosition = 'left',
  ...props
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-2">
          {label}{props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
            <span className="text-surface-500 dark:text-white/50">{icon}</span>
          </div>
        )}
        
        <input
          type={type}
          className={cn(
            'input-field',
            icon && iconPosition === 'left' && 'pl-10',
            icon && iconPosition === 'right' && 'pr-10',
            error && 'border-red-300 focus:ring-red-500',
            className
          )}
          ref={ref}
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none z-10">
            <span className="text-surface-500 dark:text-white/50">{icon}</span>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
      
      {helper && !error && (
        <p className="mt-1 text-sm text-surface-500">{helper}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input