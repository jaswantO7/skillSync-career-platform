# SkillSync Backend API

An AI-powered career growth companion backend built with Node.js, Express, MongoDB, and integrated with OpenAI/Claude for intelligent career guidance.

## 🚀 Features

- **AI-Powered Resume Parsing**: Extract skills, experience, and roles from PDF/text resumes
- **Career Path Recommendations**: Get personalized career progression suggestions
- **Learning Roadmap Generation**: Create structured 3-6 month learning plans
- **Project Suggestions**: Receive portfolio project ideas tailored to target roles
- **Progress Tracking**: Monitor learning progress with gamification elements
- **Mentor Chat**: Context-aware AI chatbot for career guidance
- **Firebase Authentication**: Secure user authentication and authorization
- **RESTful API**: Clean, well-documented API endpoints

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **AI Integration**: OpenAI GPT-4, LangChain
- **Authentication**: Firebase Admin SDK
- **File Processing**: Multer, PDF-Parse
- **Validation**: Joi
- **Security**: Helmet, CORS, Rate Limiting

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v4.4 or higher)
- Firebase project with Admin SDK credentials
- OpenAI API key

## ⚙️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd skillsync-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp .env.example .env
   ```
   
   Fill in your environment variables:
   ```env
   PORT=3000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/skillsync
   
   # Firebase Configuration
   FIREBASE_PROJECT_ID=your-project-id
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nYOUR_PRIVATE_KEY\n-----END PRIVATE KEY-----\n"
   FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project-id.iam.gserviceaccount.com
   
   # AI Services
   OPENAI_API_KEY=sk-your-openai-api-key
   ```

4. **Start MongoDB**
   ```bash
   # Using MongoDB service
   sudo systemctl start mongod
   
   # Or using Docker
   docker run -d -p 27017:27017 --name mongodb mongo:latest
   ```

5. **Run the application**
   ```bash
   # Development mode
   npm run dev
   
   # Production mode
   npm start
   ```

## 📚 API Documentation

### Authentication

All protected endpoints require a Firebase ID token in the Authorization header:
```
Authorization: Bearer <firebase-id-token>
```

### Core Endpoints

#### User Management
- `GET /api/user/me` - Get current user profile
- `POST /api/user/update` - Update user profile
- `POST /api/user/complete-onboarding` - Complete user onboarding
- `GET /api/user/stats` - Get user statistics

#### AI Services
- `POST /api/ai/parseResume` - Parse resume (PDF/text upload)
- `POST /api/ai/recommendPath` - Get career path recommendations
- `POST /api/ai/generateRoadmap` - Generate learning roadmap
- `POST /api/ai/suggestProjects` - Get project suggestions
- `POST /api/ai/mentorChat` - Chat with AI mentor
- `GET /api/ai/history` - Get AI interaction history

#### Progress Tracking
- `GET /api/progress/:userId?` - Get user progress
- `POST /api/progress/update` - Update progress
- `POST /api/progress/complete-resource` - Mark resource as completed
- `POST /api/progress/complete-deliverable` - Mark project deliverable as completed
- `GET /api/progress/analytics/:timeframe?` - Get progress analytics

### Example API Calls

#### Parse Resume
```bash
curl -X POST http://localhost:3000/api/ai/parseResume \
  -H "Authorization: Bearer <token>" \
  -F "resume=@/path/to/resume.pdf"
```

#### Get Career Recommendations
```bash
curl -X POST http://localhost:3000/api/ai/recommendPath \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "currentSkills": ["JavaScript", "React", "Node.js"],
    "goals": ["Become a Senior Full Stack Developer"],
    "experienceYears": 3
  }'
```

#### Generate Learning Roadmap
```bash
curl -X POST http://localhost:3000/api/ai/generateRoadmap \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "targetRole": "Senior Full Stack Developer",
    "requiredSkills": ["TypeScript", "GraphQL", "Docker", "AWS"],
    "timeframe": 6,
    "hoursPerWeek": 15
  }'
```

## 🗄️ Database Schema

### User Model
```javascript
{
  firebaseUid: String (unique),
  email: String (unique),
  name: String,
  role: String,
  subscriptionPlan: String (free/pro/enterprise),
  preferences: {
    industries: [String],
    careerGoals: [String],
    learningStyle: String,
    availableHoursPerWeek: Number
  },
  profile: {
    bio: String,
    location: String,
    linkedinUrl: String,
    githubUrl: String,
    portfolioUrl: String
  }
}
```

### SkillGraph Model
```javascript
{
  userId: ObjectId,
  skills: [{
    name: String,
    category: String,
    proficiency: Number (1-5),
    verified: Boolean,
    source: String
  }],
  currentRole: String,
  experienceYears: Number,
  industries: [String],
  tools: [String]
}
```

### Roadmap Model
```javascript
{
  userId: ObjectId,
  title: String,
  targetRole: String,
  duration: {
    months: Number,
    startDate: Date,
    expectedEndDate: Date
  },
  monthlyPlans: [{
    month: Number,
    title: String,
    focus: String,
    skills: [String],
    resources: [{
      title: String,
      type: String,
      url: String,
      provider: String,
      duration: String,
      difficulty: String,
      completed: Boolean
    }],
    milestones: [String]
  }],
  overallProgress: Number,
  status: String
}
```

## 🔒 Security Features

- **Firebase Authentication**: Secure token-based authentication
- **Rate Limiting**: Prevents API abuse
- **Input Validation**: Joi schema validation for all inputs
- **CORS Protection**: Configured for specific origins
- **Helmet**: Security headers for Express
- **File Upload Limits**: Restricted file sizes and types

## 🚦 Error Handling

The API uses consistent error response format:
```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

Common HTTP status codes:
- `200` - Success
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## 📊 Monitoring & Logging

- **Morgan**: HTTP request logging
- **Console Logging**: Structured error and info logs
- **Health Check**: `/health` endpoint for monitoring

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage
```

## 🚀 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=3000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/skillsync
# ... other production configs
```

### Docker Deployment
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

## 📈 Performance Optimization

- **Database Indexing**: Optimized indexes on frequently queried fields
- **Connection Pooling**: MongoDB connection optimization
- **Compression**: Gzip compression for responses
- **Caching**: Consider Redis for session/response caching (future enhancement)

## 🔄 Integration Flow

1. **User Registration**: Firebase Auth → Create User record
2. **Resume Upload**: File processing → AI parsing → Skill graph update
3. **Career Planning**: Skills analysis → AI recommendations → Path creation
4. **Learning Path**: Requirements analysis → AI roadmap → Resource curation
5. **Progress Tracking**: Activity logging → Gamification → Analytics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation for common solutions

---

**SkillSync Backend** - Empowering career growth through AI-driven insights and personalized learning paths.