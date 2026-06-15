const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../middleware/validation');
const User = require('../models/User');
const SkillGraph = require('../models/SkillGraph');
const Progress = require('../models/Progress');
const Usage = require('../models/Usage');

const router = express.Router();

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-firebaseUid');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Get additional user data
    const skillGraph = await SkillGraph.findOne({ userId: user._id });
    const progress = await Progress.findOne({ userId: user._id });

    res.json({
      success: true,
      data: {
        user: user.toPublicJSON(),
        skillGraph: skillGraph || null,
        progress: progress || null
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user profile'
    });
  }
});

// Update user profile
router.post('/update', authMiddleware, validate(schemas.updateUser), async (req, res) => {
  try {
    const updates = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { ...updates, lastActive: new Date() },
      { new: true, runValidators: true }
    ).select('-firebaseUid');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile'
    });
  }
});

// Complete onboarding
router.post('/complete-onboarding', authMiddleware, async (req, res) => {
  try {
    const { preferences, profile } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        onboardingCompleted: true,
        preferences: preferences || {},
        profile: profile || {},
        lastActive: new Date()
      },
      { new: true, runValidators: true }
    ).select('-firebaseUid');

    // Create initial progress record
    const existingProgress = await Progress.findOne({ userId: req.user._id });
    if (!existingProgress) {
      const progress = new Progress({
        userId: req.user._id,
        weeklyGoals: {
          hoursTarget: preferences?.availableHoursPerWeek || 10
        }
      });
      await progress.save();
    }

    res.json({
      success: true,
      message: 'Onboarding completed successfully',
      data: user.toPublicJSON()
    });
  } catch (error) {
    console.error('Complete onboarding error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete onboarding'
    });
  }
});

// Get user statistics
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const progress = await Progress.findOne({ userId: req.user._id });
    const skillGraph = await SkillGraph.findOne({ userId: req.user._id });

    const stats = {
      totalPoints: progress?.totalPoints || 0,
      level: progress?.level || 1,
      streak: progress?.streak || { current: 0, longest: 0 },
      totalSkills: skillGraph?.skills?.length || 0,
      completedProjects: progress?.statistics?.totalProjectsCompleted || 0,
      hoursLearned: progress?.statistics?.totalHoursLearned || 0,
      achievements: progress?.achievements?.length || 0,
      weeklyProgress: {
        hoursCompleted: progress?.weeklyGoals?.hoursCompleted || 0,
        hoursTarget: progress?.weeklyGoals?.hoursTarget || 10,
        tasksCompleted: progress?.weeklyGoals?.tasksCompleted || 0,
        tasksTarget: progress?.weeklyGoals?.tasksTarget || 5
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch user statistics'
    });
  }
});

// Upgrade or downgrade subscription plan
router.post('/plan', authMiddleware, async (req, res) => {
  try {
    const { plan } = req.body
    if (!['free', 'pro', 'enterprise'].includes(plan)) {
      return res.status(400).json({ success: false, message: 'Invalid plan. Choose free, pro, or enterprise.' })
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { subscriptionPlan: plan, lastActive: new Date() },
      { new: true }
    ).select('-firebaseUid')

    res.json({
      success: true,
      message: `Plan upgraded to ${plan}`,
      data: user.toPublicJSON()
    })
  } catch (error) {
    console.error('Plan update error:', error)
    res.status(500).json({ success: false, message: 'Failed to update plan' })
  }
})

// Delete user account
router.delete('/account', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all user-related data
    await Promise.all([
      User.findByIdAndDelete(userId),
      SkillGraph.findOneAndDelete({ userId }),
      Progress.findOneAndDelete({ userId }),
      // Add other models as needed
    ]);

    res.json({
      success: true,
      message: 'Account deleted successfully'
    });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete account'
    });
  }
});

module.exports = router;