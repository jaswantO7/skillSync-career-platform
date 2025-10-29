const express = require("express");
const multer = require("multer");
const rateLimit = require("express-rate-limit");
const { body, validationResult } = require("express-validator");
const {authMiddleware,optionalAuth} = require("../middleware/authMiddleware");
const {
  parseResume,
  recommendCareerPaths,
  generateLearningRoadmap,
  suggestProjects,
  mentorChat,
  getServiceHealth,
} = require("../services/aiService");
const User = require("../models/User");
const SkillGraph = require("../models/SkillGraph");
const CareerPath = require("../models/CareerPath");
const Roadmap = require("../models/Roadmap");
const Project = require("../models/Project");

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "text/plain",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Invalid file type. Only PDF, DOC, DOCX, and TXT files are allowed."
        ),
        false
      );
    }
  },
});

// Rate limiting for AI endpoints
const aiRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Limit each IP to 20 requests per windowMs
  message: {
    success: false,
    message: "Too many AI requests from this IP, please try again later.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validation schemas
const validateRecommendPath = [
  body("currentSkills")
    .isArray()
    .withMessage("Current skills must be an array"),
  body("goals").isArray().withMessage("Goals must be an array"),
  body("experienceYears")
    .optional()
    .isInt({ min: 0 })
    .withMessage("Experience years must be a non-negative integer"),
  body("currentRole")
    .optional()
    .isString()
    .trim()
    .withMessage("Current role must be a string"),
];

const validateGenerateRoadmap = [
  body("targetRole")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Target role is required"),
  body("requiredSkills")
    .isArray()
    .withMessage("Required skills must be an array"),
  body("timeframe")
    .isInt({ min: 1, max: 24 })
    .withMessage("Timeframe must be between 1 and 24 months"),
  body("hoursPerWeek")
    .isInt({ min: 1, max: 40 })
    .withMessage("Hours per week must be between 1 and 40"),
  body("currentSkills")
    .optional()
    .isArray()
    .withMessage("Current skills must be an array"),
];

const validateSuggestProjects = [
  body("targetRole")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Target role is required"),
  body("skills").isArray().withMessage("Skills must be an array"),
  body("difficultyLevel")
    .optional()
    .isIn(["beginner", "intermediate", "advanced"])
    .withMessage("Invalid difficulty level"),
];

const validateMentorChat = [
  body("message")
    .isString()
    .trim()
    .notEmpty()
    .withMessage("Message is required"),
  body("context")
    .optional()
    .isObject()
    .withMessage("Context must be an object"),
];

// Helper function to handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: errors.array().map((error) => error.msg),
    });
  }
  next();
};

// Parse resume endpoint
router.post(
  "/parseResume",
  aiRateLimit,
  authMiddleware,
  upload.single("resume"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No resume file provided",
        });
      }

      // Parse resume using AI service
      const extractedData = await parseResume(
        req.file.buffer,
        req.file.originalname
      );

      // Save or update skill graph
      let skillGraph = await SkillGraph.findOne({ userId: req.user._id });

      if (!skillGraph) {
        skillGraph = new SkillGraph({
          userId: req.user._id,
          skills: extractedData.skills.map((skill) => ({
            name: skill,
            category: categorizeSkill(skill),
            proficiency: Math.floor(Math.random() * 3) + 3, // Random 3-5 for demo
            verified: false,
            source: "resume",
          })),
          currentRole: extractedData.roles[0] || "Professional",
          experienceYears: extractedData.experienceYears,
          industries: extractedData.industries,
          tools: extractedData.tools,
        });
      } else {
        // Update existing skill graph
        const newSkills = extractedData.skills.filter(
          (skill) =>
            !skillGraph.skills.some(
              (existing) => existing.name.toLowerCase() === skill.toLowerCase()
            )
        );

        newSkills.forEach((skill) => {
          skillGraph.skills.push({
            name: skill,
            category: categorizeSkill(skill),
            proficiency: Math.floor(Math.random() * 3) + 3,
            verified: false,
            source: "resume",
          });
        });

        skillGraph.experienceYears = Math.max(
          skillGraph.experienceYears,
          extractedData.experienceYears
        );
        skillGraph.industries = [
          ...new Set([...skillGraph.industries, ...extractedData.industries]),
        ];
        skillGraph.tools = [
          ...new Set([...skillGraph.tools, ...extractedData.tools]),
        ];
      }

      await skillGraph.save();

      res.json({
        success: true,
        message: "Resume parsed successfully",
        data: {
          extracted: extractedData,
          skillGraphId: skillGraph._id,
        },
      });
    } catch (error) {
      console.error("Parse resume error:", error);

      if (
        error.message.includes("file type") ||
        error.message.includes("parse")
      ) {
        return res.status(400).json({
          success: false,
          message: error.message,
        });
      }

      res.status(500).json({
        success: false,
        message: "Failed to parse resume. Please try again.",
      });
    }
  }
);

// Recommend career path endpoint
router.post(
  "/recommendPath",
  aiRateLimit,
  authMiddleware,
  validateRecommendPath,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        currentSkills,
        goals,
        experienceYears = 0,
        currentRole,
      } = req.body;

      // Get career path recommendations from AI
      const recommendations = await recommendCareerPaths(
        currentSkills,
        goals,
        experienceYears,
        currentRole
      );

      // Save career paths to database
      const careerPaths = [];
      for (const rec of recommendations.recommendations) {
        const careerPath = new CareerPath({
          userId: req.user._id,
          currentRole: currentRole || "Professional",
          targetRole: rec.nextRole,
          requiredSkills: rec.requiredSkills,
          timeToAchieve: rec.timeToAchieve,
          difficulty: rec.difficulty,
          reasoning: rec.reasoning,
          salaryRange: rec.salaryRange,
          marketDemand: rec.marketDemand,
          keySteps: rec.keySteps || [],
          status: "suggested",
        });

        await careerPath.save();
        careerPaths.push(careerPath);
      }

      res.json({
        success: true,
        message: "Career paths recommended successfully",
        data: {
          recommendations: careerPaths,
          totalPaths: careerPaths.length,
        },
      });
    } catch (error) {
      console.error("Recommend path error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate career recommendations. Please try again.",
      });
    }
  }
);

// Generate learning roadmap endpoint
router.post(
  "/generateRoadmap",
  aiRateLimit,
  authMiddleware,
  validateGenerateRoadmap,
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        targetRole,
        requiredSkills,
        timeframe,
        hoursPerWeek,
        currentSkills = [],
      } = req.body;

      // Generate roadmap using AI service
      const roadmapData = await generateLearningRoadmap(
        targetRole,
        requiredSkills,
        timeframe,
        hoursPerWeek,
        currentSkills
      );

      // Save roadmap to database
      const roadmap = new Roadmap({
        userId: req.user._id,
        title: roadmapData.title,
        targetRole,
        duration: roadmapData.duration,
        monthlyPlans: roadmapData.monthlyPlans.map((plan) => ({
          month: plan.month,
          title: plan.title,
          focus: plan.focus,
          skills: plan.skills,
          resources: plan.resources.map((resource) => ({
            title: resource.title,
            type: resource.type,
            url: resource.url || "#",
            provider: resource.provider || "Various",
            duration: resource.duration,
            difficulty: resource.difficulty,
            description: resource.description,
            completed: false,
          })),
          milestones: plan.milestones,
          practiceProjects: plan.practiceProjects || [],
        })),
        keyMilestones: roadmapData.keyMilestones,
        estimatedOutcome: roadmapData.estimatedOutcome,
        status: "active",
      });

      await roadmap.save();

      res.json({
        success: true,
        message: "Learning roadmap generated successfully",
        data: {
          roadmap,
          roadmapId: roadmap._id,
        },
      });
    } catch (error) {
      console.error("Generate roadmap error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate learning roadmap. Please try again.",
      });
    }
  }
);

// Suggest projects endpoint
router.post(
  "/suggestProjects",
  aiRateLimit,
  authMiddleware,
  validateSuggestProjects,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { targetRole, skills, difficultyLevel = "intermediate" } = req.body;

      // Get project suggestions from AI
      const projectSuggestions = await suggestProjects(
        targetRole,
        skills,
        difficultyLevel
      );

      // Save projects to database
      const projects = [];
      for (const proj of projectSuggestions.projects) {
        const project = new Project({
          userId: req.user._id,
          title: proj.title,
          description: proj.description,
          difficulty: proj.difficulty,
          estimatedHours: proj.estimatedHours,
          skillsUsed: proj.skillsUsed,
          technologies: proj.technologies,
          deliverables: proj.deliverables.map((deliverable) => ({
            title: deliverable.title,
            description: deliverable.description,
            type: deliverable.type,
            completed: false,
          })),
          learningObjectives: proj.learningObjectives,
          portfolioValue: proj.portfolioValue,
          realWorldApplication: proj.realWorldApplication,
          status: "suggested",
        });

        await project.save();
        projects.push(project);
      }

      res.json({
        success: true,
        message: "Projects suggested successfully",
        data: {
          projects,
          totalProjects: projects.length,
        },
      });
    } catch (error) {
      console.error("Suggest projects error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to suggest projects. Please try again.",
      });
    }
  }
);

// AI mentor chat endpoint
router.post(
  "/mentorChat",
  aiRateLimit,
  authMiddleware,
  validateMentorChat,
  handleValidationErrors,
  async (req, res) => {
    try {
      const { message, context = {} } = req.body;
      const userId = req.user._id.toString();

      // Get user context if not provided
      if (!context.currentRole || !context.skills) {
        const [user, skillGraph, activeRoadmap] = await Promise.all([
          User.findById(req.user._id),
          SkillGraph.findOne({ userId: req.user._id }),
          Roadmap.findOne({ userId: req.user._id, status: "active" }),
        ]);

        context.currentRole =
          context.currentRole ||
          skillGraph?.currentRole ||
          user?.role ||
          "Professional";
        context.experienceYears =
          context.experienceYears || skillGraph?.experienceYears || 0;
        context.skills =
          context.skills || skillGraph?.skills.map((s) => s.name) || [];
        context.goals = context.goals || user?.preferences?.careerGoals || [];
        context.roadmapTitle = context.roadmapTitle || activeRoadmap?.title;
      }

      // Get AI mentor response
      const chatResponse = await mentorChat(userId, message, context);

      res.json({
        success: true,
        message: "Chat response generated successfully",
        data: chatResponse,
      });
    } catch (error) {
      console.error("Mentor chat error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to generate chat response. Please try again.",
      });
    }
  }
);

// Get AI interaction history
router.get("/history", authMiddleware, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const page = parseInt(req.query.page) || 1;
    const skip = (page - 1) * limit;

    // Get recent AI interactions from various models
    const [careerPaths, roadmaps, projects] = await Promise.all([
      CareerPath.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("targetRole difficulty createdAt status"),
      Roadmap.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("title targetRole duration createdAt status"),
      Project.find({ userId: req.user._id })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("title difficulty estimatedHours createdAt status"),
    ]);

    // Combine and sort by date
    const allInteractions = [
      ...careerPaths.map((cp) => ({ type: "career_path", data: cp })),
      ...roadmaps.map((rm) => ({ type: "roadmap", data: rm })),
      ...projects.map((proj) => ({ type: "project", data: proj })),
    ]
      .sort((a, b) => new Date(b.data.createdAt) - new Date(a.data.createdAt))
      .slice(skip, skip + limit);

    res.json({
      success: true,
      data: {
        interactions: allInteractions,
        pagination: {
          page,
          limit,
          total: allInteractions.length,
        },
      },
    });
  } catch (error) {
    console.error("Get AI history error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch AI interaction history",
    });
  }
});

// AI service health check
router.get("/health", async (req, res) => {
  try {
    const health = getServiceHealth();
    res.json({
      success: true,
      data: health,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "AI service health check failed",
    });
  }
});

// Helper function to categorize skills
function categorizeSkill(skillName) {
  const skill = skillName.toLowerCase();

  const categories = {
    technical: [
      "javascript",
      "python",
      "java",
      "react",
      "node",
      "sql",
      "html",
      "css",
      "git",
      "docker",
      "aws",
      "kubernetes",
    ],
    business: [
      "project management",
      "strategic planning",
      "business analysis",
      "marketing",
      "sales",
      "finance",
    ],
    creative: [
      "design",
      "photoshop",
      "figma",
      "content creation",
      "video",
      "graphics",
    ],
    leadership: [
      "leadership",
      "management",
      "team",
      "communication",
      "mentoring",
      "coaching",
    ],
    analytical: [
      "data analysis",
      "research",
      "statistics",
      "excel",
      "tableau",
      "power bi",
      "analytics",
    ],
  };

  for (const [category, keywords] of Object.entries(categories)) {
    if (keywords.some((keyword) => skill.includes(keyword))) {
      return category;
    }
  }

  return "other";
}

module.exports = router;
