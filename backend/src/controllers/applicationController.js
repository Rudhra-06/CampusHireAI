import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import { extractTextFromPDF } from '../utils/pdfParser.js';
import { calculateMatchScore } from '../utils/aiMatcher.js';

export const applyForJob = async (req, res) => {
  try {
    const { jobId } = req.body;
    if (!jobId) return res.status(400).json({ message: 'jobId is required.' });

    const existing = await Application.findOne({ where: { studentId: req.user.id, jobId } });
    if (existing) return res.status(400).json({ message: 'Already applied' });

    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    // req.user already loaded by auth middleware — no extra DB call needed
    const student = req.user;

    let aiScore = 50;
    let matchedSkills = [];
    let missingSkills = job.requiredSkills || [];

    if (student.resumeURL) {
      try {
        const resumeText = await extractTextFromPDF(student.resumeURL);
        if (resumeText) {
          const aiResult = await calculateMatchScore(resumeText, job.description, job.requiredSkills);
          aiScore        = aiResult.aiScore;
          matchedSkills  = aiResult.matchedSkills;
          missingSkills  = aiResult.missingSkills;
        }
      } catch (err) {
        console.error('AI processing failed:', err.message);
      }
    }

    const application = await Application.create({
      studentId: req.user.id, jobId, aiScore, matchedSkills, missingSkills,
    });
    res.status(201).json(application);
  } catch (error) {
    console.error('Apply error:', error);
    res.status(500).json({ message: 'Failed to submit application.' });
  }
};

export const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.findAll({
      where: { studentId: req.user.id },
      include: [{ model: Job, as: 'job' }],
      order: [['createdAt', 'DESC']]
    });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByPk(req.params.id, {
      include: [{ model: Job, as: 'job' }]
    });

    if (!application) return res.status(404).json({ message: 'Application not found' });

    if (req.user.role === 'recruiter' && application.job.recruiterId !== req.user.id) {
      return res.status(403).json({ message: 'Access denied' });
    }

    await application.update({ status });
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
