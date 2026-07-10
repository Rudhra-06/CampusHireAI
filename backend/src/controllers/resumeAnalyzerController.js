import User from '../models/User.js';
import ResumeProfile from '../models/ResumeProfile.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import Job from '../models/Job.js';
import { analyzeResume } from '../services/resumeAnalyzerService.js';

// POST /api/resume-analyzer/analyze
export const analyze = async (req, res) => {
  try {
    const { source = 'auto', jobId } = req.body;

    if (!['pdf', 'builder', 'auto'].includes(source)) {
      return res.status(422).json({ message: 'Invalid source. Use "pdf", "builder", or "auto".' });
    }

    // Fetch full user (need resumeURL)
    const user = await User.findByPk(req.user.id);

    // Fetch resume builder profile if needed
    const profile = (source === 'builder' || source === 'auto')
      ? await ResumeProfile.findOne({ where: { studentId: req.user.id } })
      : null;

    // Validate at least one source exists
    const hasPDF     = source !== 'builder' && !!user.resumeURL;
    const hasProfile = source !== 'pdf'     && !!profile;
    if (!hasPDF && !hasProfile) {
      return res.status(422).json({
        message: source === 'pdf'
          ? 'No uploaded resume found. Please upload a PDF first.'
          : source === 'builder'
          ? 'No Resume Builder profile found. Please build your resume first.'
          : 'No resume found. Please upload a PDF or build your resume first.',
      });
    }

    // Fetch optional job context
    let job = null;
    if (jobId) {
      job = await Job.findByPk(jobId);
    }

    // Run AI analysis
    const result = await analyzeResume(user, profile, source, job);
    if (!result) {
      return res.status(422).json({ message: 'Could not extract text from resume. Please check your resume content.' });
    }

    const atsScore = result.scores?.ats ?? 0;

    // Upsert — one analysis record per student
    const [record] = await ResumeAnalysis.findOrCreate({
      where: { studentId: req.user.id },
      defaults: { studentId: req.user.id, resumeScore: atsScore, analysisData: result, source, jobId: jobId || null },
    });

    if (record.id) {
      await record.update({ resumeScore: atsScore, analysisData: result, source, jobId: jobId || null });
    }

    res.json({ resumeScore: atsScore, analysisData: result, source, jobId: jobId || null, updatedAt: record.updatedAt });
  } catch (err) {
    console.error('analyze error:', err);
    res.status(500).json({ message: 'Analysis failed. Please try again.' });
  }
};

// GET /api/resume-analyzer/latest
export const getLatest = async (req, res) => {
  try {
    const record = await ResumeAnalysis.findOne({ where: { studentId: req.user.id } });
    if (!record) return res.json(null);
    res.json(record);
  } catch (err) {
    console.error('getLatest error:', err);
    res.status(500).json({ message: 'Failed to load analysis.' });
  }
};
