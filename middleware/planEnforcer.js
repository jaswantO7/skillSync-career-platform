const PLAN_LIMITS = {
  free: {
    label: 'Free',
    maxMentorChatsPerMonth: 5,
    maxCareerRecommendations: 1,
    maxRoadmaps: 1,
    features: [
      'skill_audit',
      'basic_progress',
      'career_path_basic',
      'roadmap_basic',
      'projects_basic',
    ],
  },
  pro: {
    label: 'Pro',
    maxMentorChatsPerMonth: Infinity,
    maxCareerRecommendations: Infinity,
    maxRoadmaps: Infinity,
    features: [
      'skill_audit',
      'career_paths',
      'roadmaps',
      'projects',
      'mentor_chat',
      'analytics',
    ],
  },
  enterprise: {
    label: 'Enterprise',
    maxMentorChatsPerMonth: Infinity,
    maxCareerRecommendations: Infinity,
    maxRoadmaps: Infinity,
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

module.exports = { PLAN_LIMITS, hasFeature, checkFeatureAccess }
