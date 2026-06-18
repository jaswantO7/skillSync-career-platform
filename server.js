const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

// Import routes
const userRoutes = require('./routes/userRoutes');
const aiRoutes = require('./routes/aiRoutes');
const progressRoutes = require('./routes/progressRoutes');
const projectRoutes = require('./routes/projectRoutes');
const { router: stripeRouter, webhookRouter: stripeWebhookRouter } = require('./routes/stripeRoutes');
const resetRoutes = require('./routes/resetRoutes');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const authMiddleware = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// CORS configuration
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',')
  : (process.env.NODE_ENV === 'production'
    ? ['https://skillsync.app', 'https://www.skillsync.app']
    : ['http://localhost:3000', 'http://localhost:3001'])

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));

// Stripe webhook — must be before JSON body parser
app.use('/api/stripe/webhook', stripeWebhookRouter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging
if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('combined'));
}

// Database connection
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ Connected to MongoDB'))
.catch(err => console.error('❌ MongoDB connection error:', err));

// Health check endpoint
app.get(['/health', '/api/health'], (req, res) => {
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasGrok = !!process.env.GROK_API_KEY
  let aiMode = 'none'
  if (hasGrok) aiMode = 'grok'
  else if (hasOpenAI) aiMode = 'openai'

  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    aiMode
  });
});

// API routes
app.use('/api/stripe', stripeRouter);
app.use('/api/user', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/dev', resetRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 SkillSync Backend running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
});

module.exports = app;