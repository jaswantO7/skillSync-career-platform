const Joi = require('joi');

const validate = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
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
    name: Joi.string().min(2).max(50),
    role: Joi.string().max(100),
    preferences: Joi.object({
      industries: Joi.array().items(Joi.string()),
      careerGoals: Joi.array().items(Joi.string()),
      learningStyle: Joi.string().valid('visual', 'auditory', 'kinesthetic', 'reading'),
      availableHoursPerWeek: Joi.number().min(1).max(168)
    }),
    profile: Joi.object({
      bio: Joi.string().max(500),
      location: Joi.string().max(100),
      linkedinUrl: Joi.string().uri(),
      githubUrl: Joi.string().uri(),
      portfolioUrl: Joi.string().uri()
    })
  }),

  recommendPath: Joi.object({
    currentSkills: Joi.array().items(Joi.string()).required(),
    roles: Joi.array().items(Joi.string()),
    goals: Joi.array().items(Joi.string()).required(),
    experienceYears: Joi.number().min(0).max(50),
    industries: Joi.array().items(Joi.string())
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
    type: Joi.string().valid('skill_added', 'resource_completed', 'project_started', 'project_completed', 'milestone_reached', 'roadmap_updated').required(),
    description: Joi.string().required(),
    metadata: Joi.object({
      skillName: Joi.string(),
      resourceTitle: Joi.string(),
      projectTitle: Joi.string(),
      milestoneTitle: Joi.string(),
      pointsEarned: Joi.number(),
      hoursSpent: Joi.number()
    })
  })
};

module.exports = { validate, schemas };