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
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                {title}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {value}
              </p>
              {change && (
                <p className={cn(
                  'text-sm mt-1',
                  changeType === 'positive' ? 'text-green-600' : 'text-red-600'
                )}>
                  {changeType === 'positive' ? '+' : ''}{change}
                </p>
              )}
            </div>
            
            {Icon && (
              <div className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                bgColor
              )}>
                <Icon className={cn('w-6 h-6', color)} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default ProgressCard