'use client'

import { motion } from 'framer-motion'
import { ArrowRight, Target, MapPin, Calendar } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Progress from '@/components/ui/Progress'
import Badge from '@/components/ui/Badge'
import Link from 'next/link'

const CareerSummary = ({ roadmap, userProfile }) => {
  if (!roadmap) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Career Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="w-16 h-16 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-surface-900 dark:text-white mb-2">
              Ready to Start Your Journey?
            </h3>
            <p className="text-surface-600 dark:text-surface-400 mb-6">
              Upload your resume to get personalized career recommendations and learning roadmaps.
            </p>
            <Link href="/skill-audit">
              <Button>
                Get Started
                <ArrowRight size={16} className="ml-2" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentMonth = roadmap.monthlyPlans?.find(plan => 
    plan.status === 'in_progress'
  ) || roadmap.monthlyPlans?.[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Career Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Current Path */}
          <div className="flex items-center justify-between p-4 bg-gradient-to-r from-emerald-50 to-violet-50 dark:from-emerald-900/20 dark:to-violet-900/20 rounded-lg">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-emerald-600 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-sm text-surface-600 dark:text-surface-400">Current Role</p>
                <p className="font-semibold text-surface-900 dark:text-white">
                  {roadmap.currentRole || userProfile?.role || 'Professional'}
                </p>
              </div>
            </div>
            
            <ArrowRight className="w-6 h-6 text-surface-400" />
            
            <div className="flex items-center space-x-4">
              <div>
                <p className="text-sm text-surface-600 dark:text-surface-400">Target Role</p>
                <p className="font-semibold text-surface-900 dark:text-white">
                  {roadmap.targetRole}
                </p>
              </div>
              <div className="w-12 h-12 bg-violet-600 rounded-full flex items-center justify-center">
                <Target className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Overall Progress
              </span>
              <span className="text-sm text-surface-500 dark:text-surface-400">
                {Math.round(roadmap.overallProgress || 0)}%
              </span>
            </div>
            <Progress 
              value={roadmap.overallProgress || 0} 
              className="mb-4"
            />
          </div>

          {/* Current Focus */}
          {currentMonth && (
            <div className="p-4 bg-surface-50 dark:bg-surface-800 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-surface-900 dark:text-white">
                  Current Focus: {currentMonth.title}
                </h4>
                <Badge variant="primary" size="sm">
                  Month {currentMonth.month}
                </Badge>
              </div>
              <p className="text-sm text-surface-600 dark:text-surface-400 mb-3">
                {currentMonth.focus}
              </p>
              <div className="flex flex-wrap gap-2">
                {currentMonth.skills?.slice(0, 3).map((skill, index) => (
                  <Badge key={index} variant="outline" size="xs">
                    {skill}
                  </Badge>
                ))}
                {currentMonth.skills?.length > 3 && (
                  <Badge variant="outline" size="xs">
                    +{currentMonth.skills.length - 3} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Action Button */}
          <Link href="/roadmap">
            <Button variant="secondary" className="w-full">
              View Full Roadmap
              <ArrowRight size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}

export default CareerSummary