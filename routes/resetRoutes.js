const express = require('express');
const { authMiddleware } = require('../middleware/authMiddleware');
const CareerPath = require('../models/CareerPath');
const Roadmap = require('../models/Roadmap');
const Project = require('../models/Project');
const Usage = require('../models/Usage');
const Progress = require('../models/Progress');
const Chat = require('../models/Chat');
const ResumeAnalysis = require('../models/ResumeAnalysis');
const SkillGraph = require('../models/SkillGraph');

const router = express.Router();

router.post('/reset', authMiddleware, async (req, res) => {
  try {
    const userId = req.user._id;

    await Promise.all([
      CareerPath.deleteMany({ userId }),
      Roadmap.deleteMany({ userId }),
      Project.deleteMany({ userId }),
      Usage.deleteMany({ userId }),
      Progress.deleteMany({ userId }),
      Chat.deleteMany({ userId }),
      ResumeAnalysis.deleteMany({ userId }),
      SkillGraph.deleteMany({ userId }),
    ]);

    res.json({ success: true, message: 'All user data reset successfully' });
  } catch (error) {
    console.error('Reset error:', error);
    res.status(500).json({ success: false, message: 'Failed to reset data' });
  }
});

module.exports = router;
