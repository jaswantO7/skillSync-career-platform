'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { cn } from '@/lib/utils'

const ProgressCard = ({ 
  title, 
  value, 
  icon: Icon, 
  color = 'text-blue-600', 
  bgColor = 'bg-blue-100',
  change,
  changeType = 'positive'
}) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
    >
      <Card>
        <CardContent className="p-3 sm:p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-medium text-surface-600 dark:text-surface-400 mb-1 truncate">
                {title}
              </p>
              <p className="text-base sm:text-lg md:text-2xl font-bold text-surface-900 dark:text-white truncate">
                {value}
              </p>
              {change && (
                <p className={cn(
                  'text-xs sm:text-sm mt-1',
                  changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                )}>
                  {changeType === 'positive' ? '+' : ''}{change}
                </p>
              )}
            </div>
            
            {Icon && (
              <div className={cn(
                'w-8 h-8 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center shrink-0',
                bgColor
              )}>
                <Icon className={cn('w-4 h-4 sm:w-6 sm:h-6', color)} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ProgressCard