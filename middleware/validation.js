const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    // Strip empty strings from optional fields so Joi .uri() etc don't reject them
    const stripEmpty = (obj) => {
      if (!obj || typeof obj !== 'object') return
      Object.keys(obj).forEach(key => {
        if (obj[key] === '' || obj[key] === null || obj[key] === undefined) {
          delete obj[key]
        } else if (Array.isArray(obj[key])) {
          obj[key] = obj[key].filter(v => v !== '' && v !== null && v !== undefined)
        } else if (typeof obj[key] === 'object') {
          stripEmpty(obj[key])
        }
      })
    }
    stripEmpty(req.body)
    const { error } = schema.validate(req.body, { abortEarly: false });
    
    if (error) {
      const errors = error.details.map(detail => detail.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors
      });
    }
    
    next();
  };
};

// Validation schemas
const schemas = {
  updateUser: Joi.object({
    name: Joi.string().min(2).max(50).required(),
    currentRole: Joi.string().max(100).allow(''),
    role: Joi.string().max(100),
    selectedCareerPath: Joi.object({
      targetRole: Joi.string(),
      requiredSkills: Joi.array().items(Joi.string()),
      currentRole: Joi.string(),
      timeToAchieve: Joi.string(),
      difficulty: Joi.string()
    }),
    preferences: Joi.object({
      industries: Joi.array().items(Joi.string()),
      careerGoals: Joi.array().items(Joi.string()),
      learningStyle: Joi.string().valid('visual', 'auditory', 'kinesthetic', 'reading'),
      availableHoursPerWeek: Joi.number().min(1).max(168)
    }),
    profile: Joi.object({
      avatar: Joi.string(),
      banner: Joi.string(),
      bio: Joi.string().max(500),
      location: Joi.string().max(100),
      linkedinUrl: Joi.string().uri(),
      githubUrl: Joi.string().uri(),
      portfolioUrl: Joi.string().uri()
    }),
    notifications: Joi.object({
      weeklyProgress: Joi.boolean(),
      achievementAlerts: Joi.boolean(),
      resourceRecommendations: Joi.boolean(),
      careerMilestones: Joi.boolean()
    })
  }),

  recommendPath: Joi.object({
    currentSkills: Joi.array().items(Joi.string()).required(),
    roles: Joi.array().items(Joi.string()),
    goals: Joi.array().items(Joi.string()).required(),
    experienceYears: Joi.number().min(0).max(50),
    industries: Joi.array().items(Joi.string()),
    targetRole: Joi.string()
  }),

  generateRoadmap: Joi.object({
    targetRole: Joi.string().required(),
    requiredSkills: Joi.array().items(Joi.string()).required(),
    currentSkills: Joi.array().items(Joi.string()),
    timeframe: Joi.number().min(1).max(24).default(6), // months
    hoursPerWeek: Joi.number().min(1).max(40).default(10)
  }),

  suggestProjects: Joi.object({
    targetRole: Joi.string().required(),
    skillsToPractice: Joi.array().items(Joi.string()).required(),
    difficulty: Joi.string().valid('beginner', 'intermediate', 'advanced'),
    timeAvailable: Joi.string().valid('1-2 weeks', '2-4 weeks', '1-2 months', '2-3 months')
  }),

  mentorChat: Joi.object({
    message: Joi.string().required().max(1000),
    context: Joi.object({
      currentTopic: Joi.string(),
      roadmapId: Joi.string(),
      projectId: Joi.string()
    })
  }),

  updateProgress: Joi.object({
    type: Joi.string().valid('skill_added', 'resource_completed', 'project_started', 'project_completed', 'milestone_reached', 'roadmap_updated', 'roadmap_generated').required(),
    description: Joi.string().required(),
    metadata: Joi.object({
      skillName: Joi.string(),
      resourceTitle: Joi.string(),
      projectTitle: Joi.string(),
      milestoneTitle: Joi.string(),
      pointsEarned: Joi.number(),
      hoursSpent: Joi.number(),
      targetRole: Joi.string(),
      deliverableTitle: Joi.string()
    }).unknown(true)
  })
};

module.exports = { validate, schemas };