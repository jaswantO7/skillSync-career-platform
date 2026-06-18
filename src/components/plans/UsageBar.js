'use client'

import { cn } from '@/lib/utils'

const UsageBar = ({ label, used, limit, icon: Icon }) => {
  if (limit === Infinity) {
    return (
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-xs text-surface-500 dark:text-surface-400 flex items-center space-x-1.5">
            {Icon && <Icon size={12} />}
            <span>{label}</span>
          </span>
          <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Unlimited</span>
        </div>
        <div className="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
          <div className="h-full w-full rounded-full bg-emerald-500" />
        </div>
      </div>
    )
  }

  const percentage = Math.min((used / limit) * 100, 100)
  const barColor = used >= limit ? 'bg-red-500' : used >= limit * 0.8 ? 'bg-amber-500' : 'bg-emerald-500'

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center">
        <span className="text-xs text-surface-500 dark:text-surface-400 flex items-center space-x-1.5">
          {Icon && <Icon size={12} />}
          <span>{label}</span>
        </span>
        <span className="text-xs font-medium text-surface-700 dark:text-surface-300">
          {used} / {limit}
        </span>
      </div>
      <div className="h-1.5 bg-surface-100 dark:bg-surface-800 rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all duration-500', barColor)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  )
}

export default UsageBar
