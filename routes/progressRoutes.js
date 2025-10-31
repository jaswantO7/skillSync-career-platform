const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validation');
const Progress = require('../models/Progress');
const Roadmap = require('../models/Roadmap');
const Project = require('../models/Project');

const router = express.Router();

// Get progress analytics
router.get('/analytics/:timeframe?', authMiddleware, async (req, res) => {
  try {
    const timeframe = req.params.timeframe || '30'; // days
    const daysBack = parseInt(timeframe);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - daysBack);

    const progress = await Progress.findOne({ userId: req.user._id });
    
    if (!progress) {
      return res.json({
        success: true,
        data: {
          activities: [],
          stats: {
            totalActivities: 0,
            pointsEarned: 0,
            hoursSpent: 0,
            streakDays: 0
          }
        }
      });
    }

    // Filter recent activities
    const recentActivities = progress.recentActivity.filter(
      activity => activity.timestamp >= startDate
    );

    // Calculate stats
    const stats = {
      totalActivities: recentActivities.length,
      pointsEarned: recentActivities.reduce((sum, activity) => 
        sum + (activity.metadata?.pointsEarned || 0), 0),
      hoursSpent: recentActivities.reduce((sum, activity) => 
        sum + (activity.metadata?.hoursSpent || 0), 0),
      streakDays: progress.streak.current,
      level: progress.level,
      totalPoints: progress.totalPoints
    };

    // Group activities by day
    const dailyActivity = {};
    recentActivities.forEach(activity => {
      const day = activity.timestamp.toISOString().split('T')[0];
      if (!dailyActivity[day]) {
        dailyActivity[day] = { count: 0, points: 0, hours: 0 };
      }
      dailyActivity[day].count++;
      dailyActivity[day].points += activity.metadata?.pointsEarned || 0;
      dailyActivity[day].hours += activity.metadata?.hoursSpent || 0;
    });

    res.json({
      success: true,
      data: {
        activities: recentActivities,
        stats,
        dailyActivity,
        weeklyGoals: progress.weeklyGoals,
        achievements: progress.achievements.slice(-10) // Last 10 achievements
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress analytics'
    });
  }
});

// Update progress
router.post('/update', authMiddleware, validate(schemas.updateProgress), async (req, res) => {
  try {
    const { type, description, metadata = {} } = req.body;

    let progress = await Progress.findOne({ userId: req.user._id });
    
    if (!progress) {
      progress = new Progress({ userId: req.user._id });
    }

    // Add activity and update progress
    await progress.addActivity({
      type,
      description,
      metadata
    });

    // Update weekly progress if hours are provided
    if (metadata.hoursSpent) {
      await progress.updateWeeklyProgress(metadata.hoursSpent, 1);
    }

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: progress
    });
  } catch (error) {
    console.error('Update progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update progress'
    });
  }
});

// Complete a resource/module
router.post('/complete-resource', authMiddleware, async (req, res) => {
  try {
    const { roadmapId, monthIndex, resourceIndex, hoursSpent = 1 } = req.body;

    // Find and update roadmap
    const roadmap = await Roadmap.findOne({ 
      _id: roadmapId, 
      userId: req.user._id 
    });

    if (!roadmap) {
      return res.status(404).json({
        success: false,
        message: 'Roadmap not found'
      });
    }

    // Complete the resource
    await roadmap.completeResource(monthIndex, resourceIndex);

    // Update user progress
    const progress = await Progress.findOne({ userId: req.user._id });
    if (progress) {
      await progress.addActivity({
        type: 'resource_completed',
        description: `Completed: ${roadmap.monthlyPlans[monthIndex].resources[resourceIndex].title}`,
        metadata: {
          resourceTitle: roadmap.monthlyPlans[monthIndex].resources[resourceIndex].title,
          hoursSpent,
          pointsEarned: 25
        }
      });

      await progress.updateWeeklyProgress(hoursSpent, 1);
    }

    res.json({
      success: true,
      message: 'Resource completed successfully',
      data: {
        roadmap,
        newProgress: roadmap.overallProgress
      }
    });
  } catch (error) {
    console.error('Complete resource error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete resource'
    });
  }
});

// Complete a project deliverable
router.post('/complete-deliverable', authMiddleware, async (req, res) => {
  try {
    const { projectId, deliverableIndex, url, notes } = req.body;

    // Find and update project
    const project = await Project.findOne({ 
      _id: projectId, 
      userId: req.user._id 
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: 'Project not found'
      });
    }

    // Complete the deliverable
    if (project.deliverables[deliverableIndex]) {
      project.deliverables[deliverableIndex].completed = true;
      project.deliverables[deliverableIndex].completedAt = new Date();
      if (url) project.deliverables[deliverableIndex].url = url;
      if (notes) project.deliverables[deliverableIndex].notes = notes;
    }

    await project.updateProgress();

    // Update user progress
    const progress = await Progress.findOne({ userId: req.user._id });
    if (progress) {
      const activityType = project.progress === 100 ? 'project_completed' : 'milestone_reached';
      const points = project.progress === 100 ? 100 : 50;

      await progress.addActivity({
        type: activityType,
        description: project.progress === 100 
          ? `Completed project: ${project.title}`
          : `Completed deliverable: ${project.deliverables[deliverableIndex].title}`,
        metadata: {
          projectTitle: project.title,
          pointsEarned: points
        }
      });
    }

    res.json({
      success: true,
      message: 'Deliverable completed successfully',
      data: {
        project,
        isProjectComplete: project.progress === 100
      }
    });
  } catch (error) {
    console.error('Complete deliverable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete deliverable'
    });
  }
});

// Update weekly goals
router.post('/weekly-goals', authMiddleware, async (req, res) => {
  try {
    const { hoursTarget, tasksTarget } = req.body;

    const progress = await Progress.findOne({ userId: req.user._id });
    
    if (!progress) {
      return res.status(404).json({
        success: false,
        message: 'Progress record not found'
      });
    }

    // Update weekly goals
    if (hoursTarget !== undefined) {
      progress.weeklyGoals.hoursTarget = hoursTarget;
    }
    if (tasksTarget !== undefined) {
      progress.weeklyGoals.tasksTarget = tasksTarget;
    }

    await progress.save();

    res.json({
      success: true,
      message: 'Weekly goals updated successfully',
      data: progress.weeklyGoals
    });
  } catch (error) {
    console.error('Update weekly goals error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update weekly goals'
    });
  }
});

// Get user progress
router.get('/:userId?', authMiddleware, async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;
    
    // Ensure user can only access their own progress (unless admin)
    if (userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const progress = await Progress.findOne({ userId }).populate('roadmapId');
    
    if (!progress) {
      // Create initial progress record if it doesn't exist
      const newProgress = new Progress({
        userId: req.user._id
      });
      await newProgress.save();
      
      return res.json({
        success: true,
        data: newProgress
      });
    }

    // Get additional context
    const [activeRoadmap, activeProjects] = await Promise.all([
      Roadmap.findOne({ userId, status: 'active' }),
      Project.find({ userId, status: { $in: ['in_progress', 'planned'] } }).limit(5)
    ]);

    res.json({
      success: true,
      data: {
        progress,
        activeRoadmap,
        activeProjects,
        summary: {
          totalPoints: progress.totalPoints,
          level: progress.level,
          streak: progress.streak,
          weeklyProgress: progress.weeklyGoals
        }
      }
    });
  } catch (error) {
    console.error('Get progress error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress'
    });
  }
});


module.exports = router;