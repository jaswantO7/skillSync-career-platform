# SkillSync — AI-Powered Career Growth Companion

An intelligent career platform that leverages AI (OpenAI GPT, Claude) to provide personalized skill analysis, career path recommendations, learning roadmaps, project suggestions, and a 24/7 AI mentor chat.

## Features

- **AI-Powered Skill Audit** — Upload a resume or share a LinkedIn profile; AI extracts skills, experience, roles, and tools, then visualizes them with interactive charts.
- **Career Path Recommendations** — Get 3–5 personalized career progression paths with salary ranges, difficulty, key steps, and market demand analysis.
- **Learning Roadmaps** — Generate structured multi-month learning plans with curated resources (courses, books, tutorials) and milestones.
- **Project Suggestions** — Receive portfolio project ideas with deliverables, technologies, and estimated effort.
- **AI Mentor Chat** — Context-aware career mentor available 24/7 for guidance, interview prep, and skill advice.
- **Progress Gamification** — Points, levels, streaks, and weekly goals to track learning consistency.
- **Firebase Authentication** — Email/password and Google OAuth sign-in with secure token management.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16, React 19, Tailwind CSS, Framer Motion |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose ODM |
| AI | OpenAI, LangChain |
| Auth | Firebase Auth (client + Admin SDK) |
| Charts | Recharts |
| UI | Lucide React, React Hot Toast, React Dropzone |
| Security | Helmet, CORS, Rate Limiting, Input Validation (Joi) |

## Quick Start

```bash
git clone <repo-url>
cd skillsync
npm install
cp .env.example .env    # fill in your API keys
npm run dev             # starts Next.js on :3000
npm run server          # starts Express on :3001
npm run full-dev        # runs both concurrently
```

## Project Structure

```
├── src/
│   ├── app/                # Next.js App Router pages
│   │   ├── page.js         # Landing page (455 lines)
│   │   ├── layout.js       # Root layout with providers
│   │   ├── dashboard/      # User dashboard
│   │   ├── skill-audit/    # Resume upload & AI analysis
│   │   ├── career-path/    # Career recommendations
│   │   ├── roadmap/        # Learning roadmaps
│   │   ├── projects/       # Portfolio projects
│   │   ├── mentor/         # AI chat mentor
│   │   └── auth/           # Sign in, sign up, reset password
│   ├── components/
│   │   ├── ui/             # Button, Card, Badge, Input, Modal, Progress
│   │   ├── layout/         # Navbar, Footer
│   │   ├── dashboard/      # Sidebar, Header, ProgressCard, CareerSummary
│   │   └── skill-audit/    # FileUploader, SkillGraph
│   ├── context/            # Auth, Theme, Progress contexts
│   ├── lib/                # API client (axios), Firebase config, utilities
│   └── middleware.js       # Route protection
├── models/                 # Mongoose schemas (User, SkillGraph, CareerPath, Roadmap, Project, Progress)
├── routes/                 # Express route handlers (user, ai, progress)
├── services/               # AI service (OpenAI integration)
├── middleware/              # Auth, error handler, validation
├── server.js               # Express entry point
└── package.json
```

## API Endpoints

### AI Services (`/api/ai`)
| Endpoint | Description |
|----------|-------------|
| `POST /parseResume` | Upload and parse a resume (PDF/DOC/TXT) |
| `POST /recommendPath` | Get career path recommendations |
| `POST /generateRoadmap` | Generate learning roadmap |
| `POST /suggestProjects` | Get project suggestions |
| `POST /mentorChat` | Chat with AI mentor |
| `GET /history` | Get AI interaction history |

### User Management (`/api/user`)
| Endpoint | Description |
|----------|-------------|
| `GET /me` | Get current user profile |
| `POST /update` | Update profile |
| `POST /complete-onboarding` | Complete onboarding |
| `GET /stats` | Get user statistics |
| `DELETE /account` | Delete account |

### Progress Tracking (`/api/progress`)
| Endpoint | Description |
|----------|-------------|
| `GET /:userId?` | Get user progress |
| `POST /update` | Update progress |
| `POST /complete-resource` | Mark resource complete |
| `POST /complete-deliverable` | Mark deliverable complete |
| `GET /analytics/:timeframe` | Progress analytics |
| `POST /weekly-goals` | Update weekly goals |

## License

MIT
