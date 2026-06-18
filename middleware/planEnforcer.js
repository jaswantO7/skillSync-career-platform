const Usage = require('../models/Usage')

const PLAN_LIMITS = {
  free: {
    label: 'Free',
    maxMentorChatsPerMonth: 5,
    maxCareerRecommendations: 1,
    maxRoadmaps: 1,
    maxProjects: 3,
    features: [
      'skill_audit',
      'basic_progress',
      'career_path_basic',
      'roadmap_basic',
      'projects_basic',
      'mentor_chat',
    ],
  },
  pro: {
    label: 'Pro',
    maxMentorChatsPerMonth: Infinity,
    maxCareerRecommendations: Infinity,
    maxRoadmaps: Infinity,
    maxProjects: Infinity,
    features: [
      'skill_audit',
      'basic_progress',
      'career_paths',
      'career_path_basic',
      'roadmaps',
      'roadmap_basic',
      'projects',
      'projects_basic',
      'mentor_chat',
      'analytics',
    ],
  },
  enterprise: {
    label: 'Enterprise',
    maxMentorChatsPerMonth: Infinity,
    maxCareerRecommendations: Infinity,
    maxRoadmaps: Infinity,
    maxProjects: Infinity,
    features: ['all'],
  },
}

const hasFeature = (plan, feature) => {
  const limits = PLAN_LIMITS[plan] || PLAN_LIMITS.free
  return limits.features.includes('all') || limits.features.includes(feature)
}

const checkFeatureAccess = (feature) => {
  return (req, res, next) => {
    const plan = req.user?.subscriptionPlan || 'free'
    if (!hasFeature(plan, feature)) {
      return res.status(403).json({
        success: false,
        message: `Your ${PLAN_LIMITS[plan]?.label || 'Free'} plan does not include this feature. Upgrade to unlock.`,
      })
    }
    next()
  }
}

const USAGE_FIELD_MAP = {
  mentorChats: 'maxMentorChatsPerMonth',
  careerPathsGenerated: 'maxCareerRecommendations',
  roadmapsGenerated: 'maxRoadmaps',
  projectsStarted: 'maxProjects',
}

const Roadmap = require('../models/Roadmap')

const checkUsageLimit = (usageField) => {
  return async (req, res, next) => {
    try {
      const plan = req.user?.subscriptionPlan || 'free'
      const limitKey = USAGE_FIELD_MAP[usageField]
      if (!limitKey) return next()

      const limit = PLAN_LIMITS[plan]?.[limitKey]
      if (limit === Infinity || limit === undefined) return next()

      // Allow free users to replace their existing roadmap (deactivate old, create new)
      if (usageField === 'roadmapsGenerated') {
        const existingActiveRoadmap = await Roadmap.findOne({ userId: req.user._id, status: 'active' })
        if (!existingActiveRoadmap) {
          // No existing roadmap — enforce the limit
          const usage = await Usage.getUsage(req.user._id)
          const current = usage[usageField] || 0
          if (current >= limit) {
            return res.status(403).json({
              success: false,
              message: `Free plan limited to ${limit} per month. Upgrade to Pro for unlimited access.`,
              usage: { current, limit },
            })
          }
        }
        // Has existing roadmap — allow replacement
        return next()
      }

      const usage = await Usage.getUsage(req.user._id)
      const current = usage[usageField] || 0

      if (current >= limit) {
        return res.status(403).json({
          success: false,
          message: `Free plan limited to ${limit} per month. Upgrade to Pro for unlimited access.`,
          usage: { current, limit },
        })
      }

      next()
    } catch (error) {
      console.error('Usage check error:', error)
      next()
    }
  }
}

module.exports = { PLAN_LIMITS, hasFeature, checkFeatureAccess, checkUsageLimit }
