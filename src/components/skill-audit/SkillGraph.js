'use client'

import { motion } from 'framer-motion'
import { RadialBarChart, RadialBar, ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'
import { Brain, Code, Wrench, Building, GraduationCap, Award } from 'lucide-react'

const SkillGraph = ({ data }) => {
  if (!data) return null

  // Prepare data for charts
  const skillsData = data.skills?.slice(0, 8).map((skill, index) => ({
    name: skill,
    value: Math.floor(Math.random() * 40) + 60, // Mock proficiency 60-100%
    fill: `hsl(${(index * 45) % 360}, 70%, 50%)`
  })) || []

  const categoryData = [
    { name: 'Technical Skills', value: data.skills?.length || 0, color: '#3b82f6' },
    { name: 'Tools & Software', value: data.tools?.length || 0, color: '#10b981' },
    { name: 'Industries', value: data.industries?.length || 0, color: '#f59e0b' },
    { name: 'Education', value: data.education?.length || 0, color: '#8b5cf6' }
  ]

  const sections = [
    {
      title: 'Technical Skills',
      icon: Code,
      items: data.skills || [],
      color: 'text-blue-600',
      bgColor: 'bg-blue-100'
    },
    {
      title: 'Tools & Software',
      icon: Wrench,
      items: data.tools || [],
      color: 'text-green-600',
      bgColor: 'bg-green-100'
    },
    {
      title: 'Industries',
      icon: Building,
      items: data.industries || [],
      color: 'text-orange-600',
      bgColor: 'bg-orange-100'
    },
    {
      title: 'Education',
      icon: GraduationCap,
      items: data.education || [],
      color: 'text-purple-600',
      bgColor: 'bg-purple-100'
    },
    {
      title: 'Certifications',
      icon: Award,
      items: data.certifications || [],
      color: 'text-pink-600',
      bgColor: 'bg-pink-100'
    },
    {
      title: 'Previous Roles',
      icon: Brain,
      items: data.roles || [],
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <Code className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.skills?.length || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Skills</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <Wrench className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.tools?.length || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Tools</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <Building className="w-6 h-6 text-orange-600 dark:text-orange-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.experienceYears || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Years Exp</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mx-auto mb-2">
                <GraduationCap className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.industries?.length || 0}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-400">Industries</p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Proficiency Chart */}
        {skillsData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Top Skills Proficiency</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="80%" data={skillsData}>
                      <RadialBar
                        dataKey="value"
                        cornerRadius={10}
                        fill="#8884d8"
                      />
                      <Tooltip 
                        formatter={(value, name) => [`${value}%`, 'Proficiency']}
                        labelFormatter={(label) => `Skill: ${label}`}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Category Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Skill Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Detailed Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sections.map((section, index) => {
          const Icon = section.icon
          if (!section.items || section.items.length === 0) return null
          
          return (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 + index * 0.1 }}
            >
              <Card className="h-full">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 ${section.bgColor} rounded-lg flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${section.color}`} />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {section.items.slice(0, 6).map((item, itemIndex) => (
                      <Badge key={itemIndex} variant="outline" size="sm">
                        {item}
                      </Badge>
                    ))}
                    {section.items.length > 6 && (
                      <Badge variant="secondary" size="sm">
                        +{section.items.length - 6} more
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

export default SkillGraph