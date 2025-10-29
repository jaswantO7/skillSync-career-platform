const OpenAI = require('openai')
const NodeCache = require('node-cache')
const winston = require('winston')
const pdfParse = require('pdf-parse')

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// Initialize cache (1 hour TTL)
const cache = new NodeCache({ stdTTL: parseInt(process.env.CACHE_TTL_SECONDS) || 3600 })

// Configure logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/ai-service.log' })
  ]
})

// GPT Configuration
const GPT_CONFIG = {
  model: process.env.OPENAI_MODEL || 'gpt-4-turbo-preview',
  max_tokens: parseInt(process.env.OPENAI_MAX_TOKENS) || 4000,
  temperature: parseFloat(process.env.OPENAI_TEMPERATURE) || 0.7,
}

// Skill taxonomy for better categorization
const SKILL_CATEGORIES = {
  technical: ['Programming', 'Software Development', 'Data Analysis', 'Machine Learning', 'AI', 'DevOps', 'Cloud Computing', 'Cybersecurity'],
  business: ['Project Management', 'Strategic Planning', 'Business Analysis', 'Marketing', 'Sales', 'Finance', 'Operations'],
  creative: ['Design', 'Content Creation', 'Video Production', 'Graphic Design', 'UX/UI', 'Copywriting'],
  leadership: ['Team Management', 'Leadership', 'Communication', 'Negotiation', 'Mentoring', 'Change Management'],
  analytical: ['Data Analysis', 'Research', 'Problem Solving', 'Critical Thinking', 'Statistics', 'Reporting']
}

// Helper function to make GPT API calls with error handling
async function callGPT(messages, options = {}) {
  try {
    const response = await openai.chat.completions.create({
      ...GPT_CONFIG,
      ...options,
      messages: messages,
    })

    // Log token usage for monitoring
    logger.info('GPT API Call', {
      tokens_used: response.usage?.total_tokens,
      model: response.model,
      finish_reason: response.choices[0]?.finish_reason
    })

    return response.choices[0]?.message?.content
  } catch (error) {
    logger.error('GPT API Error', {
      error: error.message,
      type: error.type,
      code: error.code
    })
    
    // Handle specific OpenAI errors
    if (error.code === 'rate_limit_exceeded') {
      throw new Error('AI service is currently busy. Please try again in a moment.')
    } else if (error.code === 'insufficient_quota') {
      throw new Error('AI service quota exceeded. Please contact support.')
    } else if (error.code === 'invalid_api_key') {
      throw new Error('AI service configuration error. Please contact support.')
    }
    
    throw new Error('AI service temporarily unavailable. Please try again later.')
  }
}

// Parse resume from file buffer
async function parseResumeFromFile(fileBuffer, filename) {
  try {
    let resumeText = ''
    
    if (filename.toLowerCase().endsWith('.pdf')) {
      const pdfData = await pdfParse(fileBuffer)
      resumeText = pdfData.text
    } else {
      // Handle text files
      resumeText = fileBuffer.toString('utf-8')
    }
    
    if (!resumeText || resumeText.trim().length < 50) {
      throw new Error('Resume content is too short or could not be extracted')
    }
    
    return resumeText
  } catch (error) {
    logger.error('Resume parsing error', { error: error.message, filename })
    throw new Error('Failed to parse resume file. Please ensure it\'s a valid PDF or text file.')
  }
}

// Generate cache key for requests
function generateCacheKey(type, data) {
  const hash = require('crypto').createHash('md5').update(JSON.stringify(data)).digest('hex')
  return `${type}_${hash}`
}

// Parse resume and extract structured information
async function parseResume(fileBuffer, filename) {
  try {
    const resumeText = await parseResumeFromFile(fileBuffer, filename)
    
    // Check cache first
    const cacheKey = generateCacheKey('parse_resume', resumeText.substring(0, 500))
    const cachedResult = cache.get(cacheKey)
    if (cachedResult) {
      logger.info('Resume parsing cache hit')
      return cachedResult
    }
    
    const prompt = `
You are an expert HR professional and career analyst. Analyze the following resume and extract structured information in JSON format.

Resume Content:
${resumeText}

Please extract and return ONLY a valid JSON object with the following structure:
{
  "skills": ["skill1", "skill2", ...],
  "tools": ["tool1", "tool2", ...],
  "roles": ["role1", "role2", ...],
  "experienceYears": number,
  "industries": ["industry1", "industry2", ...],
  "education": ["degree1", "degree2", ...],
  "certifications": ["cert1", "cert2", ...],
  "languages": ["language1", "language2", ...],
  "summary": "Brief professional summary"
}

Guidelines:
- Extract 10-20 most relevant technical and soft skills
- Include software, tools, and technologies used
- List job titles/roles held
- Estimate total years of professional experience
- Identify industries worked in
- Include educational qualifications and certifications
- Provide a 2-3 sentence professional summary
- Ensure all arrays contain strings and experienceYears is a number
- Return ONLY the JSON object, no additional text
`

    const messages = [
      {
        role: 'system',
        content: 'You are a professional resume parser that extracts structured data from resumes and returns only valid JSON.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    const response = await callGPT(messages, { temperature: 0.3 })
    
    // Parse and validate JSON response
    let parsedData
    try {
      // Clean response to extract JSON
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        throw new Error('No JSON found in response')
      }
      
      parsedData = JSON.parse(jsonMatch[0])
      
      // Validate required fields
      const requiredFields = ['skills', 'tools', 'roles', 'experienceYears', 'industries', 'education']
      for (const field of requiredFields) {
        if (!parsedData[field]) {
          parsedData[field] = field === 'experienceYears' ? 0 : []
        }
      }
      
      // Ensure experienceYears is a number
      parsedData.experienceYears = parseInt(parsedData.experienceYears) || 0
      
    } catch (parseError) {
      logger.error('JSON parsing error', { error: parseError.message, response })
      
      // Fallback parsing with basic extraction
      parsedData = {
        skills: extractSkillsFromText(resumeText),
        tools: extractToolsFromText(resumeText),
        roles: extractRolesFromText(resumeText),
        experienceYears: estimateExperience(resumeText),
        industries: [],
        education: [],
        certifications: [],
        languages: ['English'],
        summary: 'Professional with diverse experience and skills'
      }
    }
    
    // Cache the result
    cache.set(cacheKey, parsedData)
    
    logger.info('Resume parsed successfully', {
      skillsCount: parsedData.skills.length,
      experienceYears: parsedData.experienceYears
    })
    
    return parsedData
    
  } catch (error) {
    logger.error('Resume parsing failed', { error: error.message })
    throw error
  }
}

// Recommend career paths based on current skills and goals
async function recommendCareerPaths(currentSkills, goals, experienceYears, currentRole) {
  try {
    const cacheKey = generateCacheKey('career_paths', { currentSkills, goals, experienceYears, currentRole })
    const cachedResult = cache.get(cacheKey)
    if (cachedResult) {
      logger.info('Career path recommendations cache hit')
      return cachedResult
    }
    
    const prompt = `
You are a senior career counselor with expertise in technology, business, and professional development. Based on the provided information, recommend 3-5 realistic career progression paths.

Current Profile:
- Current Role: ${currentRole || 'Professional'}
- Experience: ${experienceYears} years
- Current Skills: ${currentSkills.join(', ')}
- Career Goals: ${goals.join(', ')}

Please provide career path recommendations in JSON format:
{
  "recommendations": [
    {
      "nextRole": "Target Role Title",
      "timeToAchieve": "6-12 months",
      "difficulty": "beginner|intermediate|advanced",
      "reasoning": "Detailed explanation of why this path makes sense",
      "requiredSkills": ["skill1", "skill2", "skill3"],
      "salaryRange": "$XX,000 - $XX,000",
      "marketDemand": "high|medium|low",
      "keySteps": ["step1", "step2", "step3"]
    }
  ]
}

Guidelines:
- Consider current experience level and realistic progression
- Focus on roles that build upon existing skills
- Include both technical and leadership growth paths
- Provide specific, actionable next steps
- Consider market demand and salary expectations
- Return ONLY the JSON object
`

    const messages = [
      {
        role: 'system',
        content: 'You are an expert career advisor who provides realistic, data-driven career path recommendations in JSON format.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    const response = await callGPT(messages, { temperature: 0.5 })
    
    let recommendations
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      recommendations = JSON.parse(jsonMatch[0])
      
      // Validate structure
      if (!recommendations.recommendations || !Array.isArray(recommendations.recommendations)) {
        throw new Error('Invalid recommendations structure')
      }
      
    } catch (parseError) {
      logger.error('Career path JSON parsing error', { error: parseError.message })
      
      // Fallback recommendations
      recommendations = {
        recommendations: [
          {
            nextRole: "Senior " + (currentRole || "Professional"),
            timeToAchieve: "12-18 months",
            difficulty: "intermediate",
            reasoning: "Natural progression based on your current experience and skills",
            requiredSkills: currentSkills.slice(0, 3).concat(["Leadership", "Strategic Thinking"]),
            salaryRange: "$80,000 - $120,000",
            marketDemand: "high",
            keySteps: ["Develop leadership skills", "Take on larger projects", "Build team management experience"]
          }
        ]
      }
    }
    
    cache.set(cacheKey, recommendations)
    
    logger.info('Career paths recommended', {
      pathsCount: recommendations.recommendations.length,
      experienceYears
    })
    
    return recommendations
    
  } catch (error) {
    logger.error('Career path recommendation failed', { error: error.message })
    throw error
  }
}

// Generate detailed learning roadmap
async function generateLearningRoadmap(targetRole, requiredSkills, timeframe, hoursPerWeek, currentSkills = []) {
  try {
    const cacheKey = generateCacheKey('roadmap', { targetRole, requiredSkills, timeframe, hoursPerWeek })
    const cachedResult = cache.get(cacheKey)
    if (cachedResult) {
      logger.info('Learning roadmap cache hit')
      return cachedResult
    }
    
    const prompt = `
You are an expert learning and development specialist. Create a detailed ${timeframe}-month learning roadmap to help someone transition to "${targetRole}".

Current Profile:
- Target Role: ${targetRole}
- Required Skills: ${requiredSkills.join(', ')}
- Current Skills: ${currentSkills.join(', ')}
- Available Time: ${hoursPerWeek} hours per week
- Timeframe: ${timeframe} months

Create a month-by-month learning plan in JSON format:
{
  "title": "Path to ${targetRole}",
  "duration": {
    "months": ${timeframe},
    "hoursPerWeek": ${hoursPerWeek},
    "totalHours": ${timeframe * hoursPerWeek * 4}
  },
  "monthlyPlans": [
    {
      "month": 1,
      "title": "Month Title",
      "focus": "Main learning focus for this month",
      "skills": ["skill1", "skill2"],
      "resources": [
        {
          "title": "Resource Title",
          "type": "course|book|tutorial|project|certification",
          "url": "https://example.com",
          "provider": "Platform/Publisher",
          "duration": "X hours",
          "difficulty": "beginner|intermediate|advanced",
          "description": "Brief description"
        }
      ],
      "milestones": ["milestone1", "milestone2"],
      "practiceProjects": ["project1", "project2"]
    }
  ],
  "keyMilestones": ["major milestone 1", "major milestone 2"],
  "estimatedOutcome": "What you'll achieve by the end"
}

Guidelines:
- Create realistic monthly progression building on previous months
- Include mix of theoretical learning and practical projects
- Suggest real courses, books, and resources when possible
- Balance breadth and depth of learning
- Include milestone projects to demonstrate progress
- Consider the available hours per week for realistic pacing
- Return ONLY the JSON object
`

    const messages = [
      {
        role: 'system',
        content: 'You are a professional learning designer who creates structured, practical learning roadmaps in JSON format.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    const response = await callGPT(messages, { temperature: 0.4 })
    
    let roadmap
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      roadmap = JSON.parse(jsonMatch[0])
      
      // Validate structure
      if (!roadmap.monthlyPlans || !Array.isArray(roadmap.monthlyPlans)) {
        throw new Error('Invalid roadmap structure')
      }
      
      // Ensure all months have required fields
      roadmap.monthlyPlans.forEach((month, index) => {
        if (!month.month) month.month = index + 1
        if (!month.resources) month.resources = []
        if (!month.milestones) month.milestones = []
        if (!month.skills) month.skills = []
      })
      
    } catch (parseError) {
      logger.error('Roadmap JSON parsing error', { error: parseError.message })
      
      // Generate fallback roadmap
      roadmap = generateFallbackRoadmap(targetRole, requiredSkills, timeframe, hoursPerWeek)
    }
    
    cache.set(cacheKey, roadmap)
    
    logger.info('Learning roadmap generated', {
      targetRole,
      months: timeframe,
      monthlyPlansCount: roadmap.monthlyPlans.length
    })
    
    return roadmap
    
  } catch (error) {
    logger.error('Learning roadmap generation failed', { error: error.message })
    throw error
  }
}

// Suggest portfolio projects
async function suggestProjects(targetRole, skills, difficultyLevel = 'intermediate') {
  try {
    const cacheKey = generateCacheKey('projects', { targetRole, skills, difficultyLevel })
    const cachedResult = cache.get(cacheKey)
    if (cachedResult) {
      logger.info('Project suggestions cache hit')
      return cachedResult
    }
    
    const prompt = `
You are a senior technical mentor and project advisor. Suggest 4-6 portfolio projects that would be perfect for someone targeting the role of "${targetRole}" with skills in ${skills.join(', ')}.

Requirements:
- Target Role: ${targetRole}
- Skill Level: ${difficultyLevel}
- Skills to Showcase: ${skills.join(', ')}

Provide project suggestions in JSON format:
{
  "projects": [
    {
      "title": "Project Title",
      "description": "Detailed project description and objectives",
      "difficulty": "beginner|intermediate|advanced",
      "estimatedHours": 20,
      "skillsUsed": ["skill1", "skill2", "skill3"],
      "technologies": ["tech1", "tech2"],
      "deliverables": [
        {
          "title": "Deliverable 1",
          "description": "What needs to be created",
          "type": "code|documentation|presentation|deployment"
        }
      ],
      "learningObjectives": ["objective1", "objective2"],
      "portfolioValue": "Why this project strengthens your portfolio",
      "realWorldApplication": "How this relates to actual job responsibilities"
    }
  ]
}

Guidelines:
- Projects should be realistic and completable
- Include variety: frontend, backend, full-stack, data projects
- Each project should demonstrate multiple skills
- Consider what employers in this role actually look for
- Include both technical and business value
- Suggest projects of varying complexity
- Return ONLY the JSON object
`

    const messages = [
      {
        role: 'system',
        content: 'You are a technical mentor who suggests practical, portfolio-worthy projects that demonstrate job-relevant skills.'
      },
      {
        role: 'user',
        content: prompt
      }
    ]

    const response = await callGPT(messages, { temperature: 0.6 })
    
    let projects
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      projects = JSON.parse(jsonMatch[0])
      
      // Validate structure
      if (!projects.projects || !Array.isArray(projects.projects)) {
        throw new Error('Invalid projects structure')
      }
      
      // Ensure all projects have required fields
      projects.projects.forEach(project => {
        if (!project.deliverables) project.deliverables = []
        if (!project.skillsUsed) project.skillsUsed = skills.slice(0, 3)
        if (!project.estimatedHours) project.estimatedHours = 20
      })
      
    } catch (parseError) {
      logger.error('Projects JSON parsing error', { error: parseError.message })
      
      // Generate fallback projects
      projects = generateFallbackProjects(targetRole, skills, difficultyLevel)
    }
    
    cache.set(cacheKey, projects)
    
    logger.info('Projects suggested', {
      targetRole,
      projectsCount: projects.projects.length,
      difficultyLevel
    })
    
    return projects
    
  } catch (error) {
    logger.error('Project suggestion failed', { error: error.message })
    throw error
  }
}

// AI Mentor Chat with conversation memory
const conversationMemory = new Map()

async function mentorChat(userId, message, context = {}) {
  try {
    // Get or initialize conversation history
    let conversation = conversationMemory.get(userId) || []
    
    // Limit conversation history to last 10 exchanges
    if (conversation.length > 20) {
      conversation = conversation.slice(-20)
    }
    
    const systemPrompt = `
You are Alex, a professional AI career mentor and coach with 15+ years of experience in technology, business, and professional development. You provide personalized, actionable career advice.

User Context:
- Current Role: ${context.currentRole || 'Professional'}
- Experience: ${context.experienceYears || 0} years
- Skills: ${context.skills?.join(', ') || 'Various skills'}
- Goals: ${context.goals?.join(', ') || 'Career growth'}
- Current Roadmap: ${context.roadmapTitle || 'None'}

Your personality:
- Encouraging and supportive but realistic
- Practical and action-oriented
- Ask clarifying questions when needed
- Provide specific, actionable advice
- Share relevant examples and insights
- Keep responses concise but comprehensive (2-4 paragraphs max)

Guidelines:
- Always be helpful, professional, and encouraging
- Provide actionable advice with specific next steps
- Ask follow-up questions to better understand their situation
- Reference their current context when relevant
- If you don't know something, be honest and suggest resources
- Focus on career growth, skill development, and professional success
`

    const messages = [
      { role: 'system', content: systemPrompt },
      ...conversation,
      { role: 'user', content: message }
    ]

    const response = await callGPT(messages, { 
      temperature: 0.7,
      max_tokens: 800 
    })
    
    // Update conversation history
    conversation.push(
      { role: 'user', content: message },
      { role: 'assistant', content: response }
    )
    conversationMemory.set(userId, conversation)
    
    logger.info('Mentor chat response generated', {
      userId: userId.substring(0, 8),
      messageLength: message.length,
      responseLength: response.length
    })
    
    return {
      response,
      conversationId: userId,
      timestamp: new Date().toISOString()
    }
    
  } catch (error) {
    logger.error('Mentor chat failed', { error: error.message, userId })
    
    // Fallback response
    return {
      response: "I'm having trouble connecting right now, but I'm here to help with your career questions. Could you try asking again in a moment?",
      conversationId: userId,
      timestamp: new Date().toISOString()
    }
  }
}

// Helper functions for fallback parsing
function extractSkillsFromText(text) {
  const commonSkills = [
    'JavaScript', 'Python', 'Java', 'React', 'Node.js', 'SQL', 'HTML', 'CSS',
    'Project Management', 'Leadership', 'Communication', 'Problem Solving',
    'Data Analysis', 'Microsoft Office', 'Git', 'Agile', 'Scrum'
  ]
  
  return commonSkills.filter(skill => 
    text.toLowerCase().includes(skill.toLowerCase())
  ).slice(0, 10)
}

function extractToolsFromText(text) {
  const commonTools = [
    'Microsoft Office', 'Excel', 'PowerPoint', 'Word', 'Outlook',
    'Slack', 'Trello', 'Jira', 'Git', 'GitHub', 'VS Code',
    'Photoshop', 'Figma', 'Salesforce', 'Google Analytics'
  ]
  
  return commonTools.filter(tool => 
    text.toLowerCase().includes(tool.toLowerCase())
  ).slice(0, 8)
}

function extractRolesFromText(text) {
  const commonRoles = [
    'Manager', 'Developer', 'Analyst', 'Coordinator', 'Specialist',
    'Lead', 'Senior', 'Associate', 'Director', 'Engineer'
  ]
  
  return commonRoles.filter(role => 
    text.toLowerCase().includes(role.toLowerCase())
  ).slice(0, 5)
}

function estimateExperience(text) {
  const yearMatches = text.match(/(\d+)\s*(year|yr)/gi)
  if (yearMatches && yearMatches.length > 0) {
    const years = yearMatches.map(match => parseInt(match.match(/\d+/)[0]))
    return Math.max(...years)
  }
  return 0
}

function generateFallbackRoadmap(targetRole, requiredSkills, timeframe, hoursPerWeek) {
  const monthlyPlans = []
  
  for (let i = 1; i <= timeframe; i++) {
    monthlyPlans.push({
      month: i,
      title: `Month ${i}: ${requiredSkills[i-1] || 'Skill Development'}`,
      focus: `Focus on developing ${requiredSkills[i-1] || 'core skills'} for ${targetRole}`,
      skills: requiredSkills.slice((i-1)*2, i*2),
      resources: [
        {
          title: `${requiredSkills[i-1] || 'Skill'} Fundamentals Course`,
          type: 'course',
          url: 'https://coursera.org',
          provider: 'Coursera',
          duration: `${hoursPerWeek} hours`,
          difficulty: 'intermediate',
          description: `Learn the fundamentals of ${requiredSkills[i-1] || 'the skill'}`
        }
      ],
      milestones: [`Complete ${requiredSkills[i-1] || 'skill'} basics`, 'Build practice project'],
      practiceProjects: [`${requiredSkills[i-1] || 'Skill'} practice project`]
    })
  }
  
  return {
    title: `Path to ${targetRole}`,
    duration: {
      months: timeframe,
      hoursPerWeek: hoursPerWeek,
      totalHours: timeframe * hoursPerWeek * 4
    },
    monthlyPlans,
    keyMilestones: [`Master ${requiredSkills[0] || 'core skills'}`, `Complete ${targetRole} portfolio`],
    estimatedOutcome: `Ready for ${targetRole} position with practical experience`
  }
}

function generateFallbackProjects(targetRole, skills, difficultyLevel) {
  return {
    projects: [
      {
        title: `${targetRole} Portfolio Project`,
        description: `A comprehensive project showcasing skills relevant to ${targetRole} position`,
        difficulty: difficultyLevel,
        estimatedHours: 40,
        skillsUsed: skills.slice(0, 4),
        technologies: skills.slice(0, 3),
        deliverables: [
          {
            title: 'Working Application',
            description: 'Fully functional application demonstrating key skills',
            type: 'code'
          },
          {
            title: 'Documentation',
            description: 'Comprehensive project documentation and README',
            type: 'documentation'
          }
        ],
        learningObjectives: [`Master ${skills[0] || 'key skills'}`, 'Build portfolio piece'],
        portfolioValue: `Demonstrates practical application of ${targetRole} skills`,
        realWorldApplication: `Simulates real-world ${targetRole} responsibilities`
      }
    ]
  }
}

// Clear conversation memory (for cleanup)
function clearConversationMemory(userId) {
  if (userId) {
    conversationMemory.delete(userId)
  } else {
    conversationMemory.clear()
  }
}

// Get AI service health and stats
function getServiceHealth() {
  return {
    status: 'healthy',
    cacheStats: cache.getStats(),
    conversationsActive: conversationMemory.size,
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  }
}

module.exports = {
  parseResume,
  recommendCareerPaths,
  generateLearningRoadmap,
  suggestProjects,
  mentorChat,
  clearConversationMemory,
  getServiceHealth
}