const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const Project = require('../models/Project');

const router = express.Router();

// Get user's started projects
router.get('/', authMiddleware, async (req, res) => {
  try {
    const projects = await Project.find({
      userId: req.user._id,
      status: { $in: ['in_progress', 'completed'] }
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: { projects }
    });
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch projects'
    });
  }
});

// Start a project (save to DB)
router.post('/start', authMiddleware, async (req, res) => {
  try {
    const { title, description, objective, difficulty, estimatedDuration, skillsUsed, technologies, deliverables, learningObjectives, portfolioValue, realWorldApplication } = req.body;

    const project = new Project({
      userId: req.user._id,
      title,
      description,
      objective: objective || `Build a ${title}`,
      difficulty: difficulty || 'intermediate',
      estimatedDuration: estimatedDuration || { value: 40, unit: 'hours' },
      skillsUsed: skillsUsed || [],
      technologies: technologies || [],
      deliverables: (deliverables || []).map(d => ({
        title: d.title,
        description: d.description,
        type: d.type || 'code',
        completed: false,
      })),
      learningObjectives: learningObjectives || [],
      portfolioValue: portfolioValue || '',
      realWorldApplication: realWorldApplication || '',
      status: 'in_progress',
      startDate: new Date()
    });

    await project.save();

    res.json({
      success: true,
      message: 'Project started successfully',
      data: { project }
    });
  } catch (error) {
    console.error('Start project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to start project'
    });
  }
});

// Complete a deliverable
router.post('/deliverable', authMiddleware, async (req, res) => {
  try {
    const { projectId, deliverableIndex, url, notes } = req.body;

    const project = await Project.findOne({ _id: projectId, userId: req.user._id });
    if (!project) {
      return res.status(404).json({ success: false, message: 'Project not found' });
    }

    project.deliverables[deliverableIndex].completed = true;
    project.deliverables[deliverableIndex].completedAt = new Date();
    if (url) project.deliverables[deliverableIndex].url = url;
    if (notes) project.deliverables[deliverableIndex].notes = notes;

    await project.updateProgress();

    res.json({
      success: true,
      data: { project }
    });
  } catch (error) {
    console.error('Complete deliverable error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to complete deliverable'
    });
  }
});

// Remove a project
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await Project.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    res.json({
      success: true,
      message: 'Project removed'
    });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to remove project'
    });
  }
});

module.exports = router;
