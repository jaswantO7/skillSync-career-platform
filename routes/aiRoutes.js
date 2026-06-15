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
const ResumeAnalysis = require("../models/ResumeAnalysis");
const CareerPath = require("../models/CareerPath");
const Roadmap = require("../models/Roadmap");
const Project = require("../models/Project");
const Usage = require("../models/Usage");
const Chat = require("../models/Chat");
const { checkFeatureAccess } = require("../middleware/planEnforcer");

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
  body("targetRole")
    .optional()
    .isString()
    .trim()
    .withMessage("Target role must be a string"),
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
  (req, res, next) => {
    upload.single("resume")(req, res, (err) => {
      if (err) {
        console.error("Multer error:", err.message);
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },
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

      // Save as a new analysis record (keeps history intact)
      const analysis = await ResumeAnalysis.create({
        userId: req.user._id,
        fileName: req.file.originalname,
        extracted: extractedData,
      });

      // Merge into current skill graph as well
      let skillGraph = await SkillGraph.findOne({ userId: req.user._id });

      if (!skillGraph) {
        skillGraph = new SkillGraph({
          userId: req.user._id,
          skills: extractedData.skills.map((skill) => ({
            name: skill,
            category: categorizeSkill(skill),
            proficiency: extractedData.skillProficiencies?.[skill] || 3,
            verified: false,
            source: "resume",
          })),
          currentRole: extractedData.roles[0] || "Professional",
          experienceYears: extractedData.experienceYears,
          industries: extractedData.industries,
          tools: extractedData.tools,
        });
      } else {
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
            proficiency: extractedData.skillProficiencies?.[skill] || 3,
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
          analysisId: analysis._id,
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
        targetRole,
      } = req.body;

      // Get career path recommendations from AI
      const result = await recommendCareerPaths(
        currentSkills,
        goals,
        experienceYears,
        currentRole,
        targetRole
      );

      // Attach temp IDs for React keys & normalize field names
      const recommendations = (result.recommendations || []).map((rec, i) => ({
        ...rec,
        _id: `rec-${Date.now()}-${i}`,
        targetRole: rec.nextRole || rec.targetRole || '',
        currentRole: currentRole || '',
      }));

      // Track usage
      await Usage.increment(req.user._id, 'careerPathsGenerated')

      res.json({
        success: true,
        message: "Career paths recommended successfully",
        data: {
          recommendations,
          totalPaths: recommendations.length,
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
          resources: plan.resources.map((resource) => {
            const provider = resource.provider || 'Various';
            const title = encodeURIComponent(resource.title);
            const providerSearchMap = {
              'Coursera': `https://www.coursera.org/search?query=${title}`,
              'Udemy': `https://www.udemy.com/courses/search/?q=${title}`,
              'Pluralsight': `https://www.pluralsight.com/search?q=${title}`,
              'Frontend Masters': `https://frontendmasters.com/search/?q=${title}`,
              'Educative': `https://www.educative.io/search?q=${title}`,
              'O\'Reilly': `https://www.oreilly.com/search/?q=${title}`,
              'freeCodeCamp': `https://www.freecodecamp.org/news/search/?query=${title}`,
              'YouTube': `https://www.youtube.com/results?search_query=${title}`,
              'GitHub': `https://github.com/search?q=${title}`,
              'LinkedIn': `https://www.linkedin.com/learning/search?keywords=${title}`,
              'Scrum.org': `https://www.scrum.org/search?search=${title}`,
              'AWS': `https://aws.amazon.com/search/?searchQuery=${title}`,
              'Google Cloud': `https://cloud.google.com/search?q=${title}`,
              'Microsoft': `https://learn.microsoft.com/en-us/search/?terms=${title}`,
              'IBM': `https://www.ibm.com/training/search?q=${title}`,
              'Datacamp': `https://www.datacamp.com/search?q=${title}`,
              'Codecademy': `https://www.codecademy.com/search?query=${title}`,
              'edX': `https://www.edx.org/search?q=${title}`,
              'Docker': `https://docs.docker.com/search/?q=${title}`,
              'Manning': `https://www.manning.com/search?q=${title}`,
              'Amazon': `https://www.amazon.com/s?k=${title}`,
            };
            const searchUrl = providerSearchMap[provider] || `https://www.google.com/search?q=${encodeURIComponent(provider + ' ' + resource.title)}`;
            return {
            title: resource.title,
            type: ['course', 'video', 'article', 'book', 'tutorial', 'practice', 'project', 'certification', 'workshop', 'bootcamp', 'documentation', 'guide'].includes(resource.type) ? resource.type : 'course',
            url: searchUrl,
            provider,
            duration: resource.duration,
            difficulty: ['beginner', 'intermediate', 'advanced'].includes(resource.difficulty) ? resource.difficulty : 'intermediate',
            description: resource.description,
            cost: resource.cost || { amount: 0, currency: 'USD' },
            completed: false,
          };
          }),
          milestones: plan.milestones,
          practiceProjects: plan.practiceProjects || [],
        })),
        keyMilestones: roadmapData.keyMilestones,
        estimatedOutcome: roadmapData.estimatedOutcome,
        status: "active",
      });

      await roadmap.save();

      // Track usage
      await Usage.increment(req.user._id, 'roadmapsGenerated')

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

      // Return suggestions without saving — only save when user starts a project
      const projects = (projectSuggestions.projects || []).map((proj) => ({
        title: proj.title,
        description: proj.description,
        objective: proj.objective || `Build a ${proj.title} to demonstrate ${(proj.skillsUsed || []).slice(0, 3).join(', ')} skills`,
        difficulty: proj.difficulty || 'intermediate',
        estimatedDuration: {
          value: proj.estimatedDuration?.value || proj.estimatedHours || 40,
          unit: proj.estimatedDuration?.unit || 'hours'
        },
        skillsUsed: proj.skillsUsed || [],
        technologies: proj.technologies || [],
        deliverables: (proj.deliverables || []).map((d) => ({
          title: d.title,
          description: d.description,
          type: d.type,
          completed: false,
        })),
        learningObjectives: proj.learningObjectives || [],
        portfolioValue: proj.portfolioValue || '',
        realWorldApplication: proj.realWorldApplication || '',
      }));

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

      // Check plan limits for mentor chat
      const plan = req.user?.subscriptionPlan || 'free'
      if (plan === 'free') {
        const usage = await Usage.getUsage(req.user._id)
        if (usage.mentorChats >= 5) {
          return res.status(403).json({
            success: false,
            message: 'Free plan limited to 5 mentor chats per month. Upgrade to Pro for unlimited chats.',
          })
        }
      }

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

      // Track usage only after successful AI response
      await Usage.increment(req.user._id, 'mentorChats')

      res.json({
        success: true,
        message: "Chat response generated successfully",
        data: chatResponse,
      });
    } catch (error) {
      console.error("Mentor chat error:", error);
      // Don't increment usage on errors — user didn't get a response
      res.status(500).json({
        success: false,
        message: "Failed to generate chat response. Please try again.",
      });
    }
  }
);

// Get mentor chat history
router.get("/mentorChat/history", authMiddleware, async (req, res) => {
  try {
    const chat = await Chat.getOrCreate(req.user._id)
    res.json({
      success: true,
      data: { messages: chat.messages },
    })
  } catch (error) {
    console.error("Chat history error:", error)
    res.status(500).json({ success: false, message: "Failed to load chat history" })
  }
})

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

// List all resume analyses for the user
router.get("/analyses", authMiddleware, async (req, res) => {
  try {
    const analyses = await ResumeAnalysis.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .select("-__v");
    res.json({ success: true, data: analyses });
  } catch (error) {
    console.error("Get analyses error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch analyses" });
  }
});

// Update an analysis (edit extracted data)
router.put("/analyses/:id", authMiddleware, async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOne({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!analysis) {
      return res.status(404).json({ success: false, message: "Analysis not found" });
    }
    analysis.extracted = { ...analysis.extracted.toObject(), ...req.body.extracted };
    await analysis.save();
    res.json({ success: true, data: analysis });
  } catch (error) {
    console.error("Update analysis error:", error);
    res.status(500).json({ success: false, message: "Failed to update analysis" });
  }
});

// Delete an analysis
router.delete("/analyses/:id", authMiddleware, async (req, res) => {
  try {
    const analysis = await ResumeAnalysis.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id,
    });
    if (!analysis) {
      return res.status(404).json({ success: false, message: "Analysis not found" });
    }
    res.json({ success: true, message: "Analysis deleted" });
  } catch (error) {
    console.error("Delete analysis error:", error);
    res.status(500).json({ success: false, message: "Failed to delete analysis" });
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
