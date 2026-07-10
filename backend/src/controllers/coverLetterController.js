import CoverLetter from '../models/CoverLetter.js';
import ResumeProfile from '../models/ResumeProfile.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import Job from '../models/Job.js';
import { generateCoverLetter } from '../services/coverLetterService.js';

const HISTORY_LIMIT = 10;

/* POST /api/cover-letter/generate */
export const generate = async (req, res) => {
  try {
    const { jobId, tone = 'professional', length = 'medium', customization = {} } = req.body;

    if (!jobId) return res.status(400).json({ message: 'jobId is required.' });

    const validTones   = ['professional', 'friendly', 'formal', 'confident', 'enthusiastic', 'minimal', 'creative'];
    const validLengths = ['short', 'medium', 'detailed'];
    if (!validTones.includes(tone))     return res.status(400).json({ message: `Invalid tone. Choose: ${validTones.join(', ')}` });
    if (!validLengths.includes(length)) return res.status(400).json({ message: `Invalid length. Choose: ${validLengths.join(', ')}` });

    const job = await Job.findByPk(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found.' });

    const [profile, analysis] = await Promise.all([
      ResumeProfile.findOne({ where: { studentId: req.user.id } }),
      ResumeAnalysis.findOne({ where: { studentId: req.user.id } }),
    ]);

    // Require at least some profile data
    const hasProfile = profile && (
      profile.skills?.length ||
      profile.experience?.length ||
      profile.projects?.length ||
      profile.summary
    );
    const hasUploadedResume = !!req.user.resumeURL;

    if (!hasProfile && !hasUploadedResume) {
      return res.status(400).json({
        message: 'Please complete your Resume Builder profile or upload a resume before generating a cover letter.',
      });
    }

    const letterText = await generateCoverLetter(
      req.user, profile, analysis, job, tone, length, customization
    );

    // Enforce history cap — delete oldest beyond limit
    const count = await CoverLetter.count({ where: { studentId: req.user.id } });
    if (count >= HISTORY_LIMIT) {
      const oldest = await CoverLetter.findOne({
        where: { studentId: req.user.id },
        order: [['createdAt', 'ASC']],
      });
      if (oldest) await oldest.destroy();
    }

    const record = await CoverLetter.create({
      studentId:   req.user.id,
      jobId:       job.id,
      letterText,
      tone,
      length,
      jobSnapshot: { title: job.title, companyName: job.companyName },
    });

    res.status(201).json(record);
  } catch (err) {
    console.error('Cover letter generate error:', err);
    res.status(500).json({ message: 'Failed to generate cover letter. Please try again.' });
  }
};

/* GET /api/cover-letter/history */
export const history = async (req, res) => {
  try {
    const records = await CoverLetter.findAll({
      where: { studentId: req.user.id },
      order: [['createdAt', 'DESC']],
      attributes: ['id', 'tone', 'length', 'jobSnapshot', 'jobId', 'createdAt'],
    });
    res.json(records);
  } catch (err) {
    console.error('Cover letter history error:', err);
    res.status(500).json({ message: 'Failed to load history.' });
  }
};

/* GET /api/cover-letter/:id */
export const getById = async (req, res) => {
  try {
    const record = await CoverLetter.findOne({
      where: { id: req.params.id, studentId: req.user.id },
    });
    if (!record) return res.status(404).json({ message: 'Cover letter not found.' });
    res.json(record);
  } catch (err) {
    console.error('Cover letter getById error:', err);
    res.status(500).json({ message: 'Failed to load cover letter.' });
  }
};

/* DELETE /api/cover-letter/:id */
export const deleteById = async (req, res) => {
  try {
    const record = await CoverLetter.findOne({
      where: { id: req.params.id, studentId: req.user.id },
    });
    if (!record) return res.status(404).json({ message: 'Cover letter not found.' });
    await record.destroy();
    res.json({ message: 'Deleted.' });
  } catch (err) {
    console.error('Cover letter delete error:', err);
    res.status(500).json({ message: 'Failed to delete cover letter.' });
  }
};
