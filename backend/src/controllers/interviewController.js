import { Op } from 'sequelize';
import InterviewSession from '../models/InterviewSession.js';
import InterviewQuestion from '../models/InterviewQuestion.js';
import InterviewAnswer from '../models/InterviewAnswer.js';
import InterviewReport from '../models/InterviewReport.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import User from '../models/User.js';
import ResumeProfile from '../models/ResumeProfile.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import {
  generateQuestions, evaluateAnswers, generateReport,
  mockQuestions, mockEvaluations, mockReport,
} from '../services/interviewService.js';

/* ── helpers ─────────────────────────────────────────────── */
const sessionWithAll = (where) =>
  InterviewSession.findOne({
    where,
    include: [
      { model: InterviewQuestion, as: 'questions', include: [{ model: InterviewAnswer, as: 'answer' }] },
      { model: Job,  as: 'job',       attributes: ['id', 'title', 'companyName', 'description', 'requiredSkills'] },
      { model: User, as: 'student',   attributes: ['id', 'name', 'email', 'branch', 'cgpa', 'skills'] },
      { model: User, as: 'recruiter', attributes: ['id', 'name', 'companyName'] },
      { model: InterviewReport, as: 'report' },
    ],
    order: [[{ model: InterviewQuestion, as: 'questions' }, 'orderIndex', 'ASC']],
  });

/* ── POST /api/interviews/create  (recruiter) ────────────── */
export const createInterview = async (req, res) => {
  try {
    const { studentId, jobId } = req.body;
    if (!studentId || !jobId)
      return res.status(400).json({ message: 'studentId and jobId are required.' });

    const job = await Job.findOne({ where: { id: jobId, recruiterId: req.user.id } });
    if (!job) return res.status(403).json({ message: 'Job not found or access denied.' });

    const application = await Application.findOne({ where: { studentId, jobId } });
    if (!application) return res.status(400).json({ message: 'Student has not applied for this job.' });

    // Fix: use Op.in for ENUM array check
    const existing = await InterviewSession.findOne({
      where: { studentId, jobId, status: { [Op.in]: ['pending', 'in_progress'] } },
    });
    if (existing) return res.status(400).json({ message: 'An active interview session already exists for this candidate.' });

    const student = await User.findByPk(studentId);
    if (!student) return res.status(404).json({ message: 'Student not found.' });

    const [resumeProfile, resumeAnalysis] = await Promise.all([
      ResumeProfile.findOne({ where: { studentId } }),
      ResumeAnalysis.findOne({ where: { studentId } }),
    ]);

    let rawQuestions;
    try {
      rawQuestions = await generateQuestions({ student, resumeProfile, resumeAnalysis, job });
    } catch (aiErr) {
      console.warn('AI question generation failed, using mock:', aiErr.message);
      rawQuestions = mockQuestions(job);
    }

    const session = await InterviewSession.create({
      studentId,
      recruiterId: req.user.id,
      jobId,
      status: 'pending',
    });

    const questions = await InterviewQuestion.bulkCreate(
      rawQuestions.map((q, i) => ({
        sessionId: session.id,
        questionText: q.questionText,
        questionType: q.questionType,
        orderIndex: q.orderIndex ?? i + 1,
      }))
    );

    await InterviewAnswer.bulkCreate(
      questions.map(q => ({ sessionId: session.id, questionId: q.id }))
    );

    const full = await sessionWithAll({ id: session.id });
    res.status(201).json(full);
  } catch (err) {
    console.error('createInterview error:', err);
    res.status(500).json({ message: 'Failed to create interview. Please try again.' });
  }
};

/* ── GET /api/interviews/student  (student) ──────────────── */
export const getStudentInterviews = async (req, res) => {
  try {
    const sessions = await InterviewSession.findAll({
      where: { studentId: req.user.id },
      include: [
        { model: Job,  as: 'job',       attributes: ['id', 'title', 'companyName'] },
        { model: User, as: 'recruiter', attributes: ['id', 'name', 'companyName'] },
        { model: InterviewReport, as: 'report' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(sessions);
  } catch (err) {
    console.error('getStudentInterviews error:', err);
    res.status(500).json({ message: 'Failed to load interviews.' });
  }
};

/* ── GET /api/interviews/recruiter  (recruiter) ──────────── */
export const getRecruiterInterviews = async (req, res) => {
  try {
    const sessions = await InterviewSession.findAll({
      where: { recruiterId: req.user.id },
      include: [
        { model: Job,  as: 'job',     attributes: ['id', 'title', 'companyName'] },
        { model: User, as: 'student', attributes: ['id', 'name', 'email', 'branch', 'cgpa'] },
        { model: InterviewReport, as: 'report' },
      ],
      order: [['createdAt', 'DESC']],
    });
    res.json(sessions);
  } catch (err) {
    console.error('getRecruiterInterviews error:', err);
    res.status(500).json({ message: 'Failed to load interviews.' });
  }
};

/* ── GET /api/interviews/:sessionId  (student or recruiter) ─ */
export const getSession = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await sessionWithAll({ id: sessionId });
    if (!session) return res.status(404).json({ message: 'Interview session not found.' });

    const { role, id } = req.user;
    if (role === 'student'   && session.studentId   !== id) return res.status(403).json({ message: 'Access denied.' });
    if (role === 'recruiter' && session.recruiterId !== id) return res.status(403).json({ message: 'Access denied.' });

    res.json(session);
  } catch (err) {
    console.error('getSession error:', err);
    res.status(500).json({ message: 'Failed to load session.' });
  }
};

/* ── POST /api/interviews/:sessionId/submit  (student) ────── */
export const submitInterview = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { answers, final: isFinal } = req.body;

    if (!Array.isArray(answers) || answers.length === 0)
      return res.status(400).json({ message: 'answers array is required.' });

    const session = await InterviewSession.findOne({
      where: { id: sessionId, studentId: req.user.id },
      include: [
        { model: InterviewQuestion, as: 'questions' },
        { model: Job,  as: 'job' },
        { model: User, as: 'student', attributes: ['id', 'name', 'branch', 'cgpa', 'skills'] },
      ],
    });
    if (!session) return res.status(404).json({ message: 'Session not found or access denied.' });
    if (session.status === 'completed')
      return res.status(400).json({ message: 'Interview already submitted.' });

    // Save answers
    await Promise.all(
      answers.map(({ questionId, answerText }) =>
        InterviewAnswer.update(
          { answerText: answerText || '' },
          { where: { sessionId: Number(sessionId), questionId } }
        )
      )
    );

    // Partial save
    if (!isFinal) {
      await session.update({ status: 'in_progress' });
      return res.json({ message: 'Progress saved.', status: 'in_progress' });
    }

    // Final submission — evaluate
    const savedAnswers = await InterviewAnswer.findAll({ where: { sessionId } });
    const answerObjects = savedAnswers.map(a => ({ questionId: a.questionId, answerText: a.answerText }));

    let evaluations;
    try {
      evaluations = await evaluateAnswers({
        questions: session.questions,
        answers: answerObjects,
        job: session.job,
        student: session.student,
      });
    } catch (aiErr) {
      console.warn('AI evaluation failed, using mock:', aiErr.message);
      evaluations = mockEvaluations(session.questions.length);
    }

    await Promise.all(
      evaluations.map((ev) => {
        const q = session.questions[ev.questionIndex];
        if (!q) return null;
        return InterviewAnswer.update(
          { aiScore: ev.score, aiFeedback: `${ev.feedback}\n\nImprovement: ${ev.improvementSuggestion}` },
          { where: { sessionId, questionId: q.id } }
        );
      })
    );

    let reportData;
    try {
      reportData = await generateReport({
        questions: session.questions,
        answers: answerObjects,
        evaluations,
        job: session.job,
        student: session.student,
      });
    } catch (aiErr) {
      console.warn('AI report generation failed, using mock:', aiErr.message);
      reportData = mockReport();
    }

    await InterviewReport.create({ sessionId, ...reportData });
    await session.update({ status: 'completed', overallScore: reportData.overallScore });

    const full = await sessionWithAll({ id: sessionId });
    res.json(full);
  } catch (err) {
    console.error('submitInterview error:', err);
    res.status(500).json({ message: 'Submission failed. Please try again.' });
  }
};

/* ── GET /api/interviews/report/:sessionId ───────────────── */
export const getReport = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await InterviewSession.findByPk(sessionId, {
      include: [{ model: InterviewReport, as: 'report' }],
    });
    if (!session) return res.status(404).json({ message: 'Session not found.' });

    const { role, id } = req.user;
    if (role === 'student'   && session.studentId   !== id) return res.status(403).json({ message: 'Access denied.' });
    if (role === 'recruiter' && session.recruiterId !== id) return res.status(403).json({ message: 'Access denied.' });

    if (!session.report) return res.status(404).json({ message: 'Report not yet available.' });
    res.json(session.report);
  } catch (err) {
    console.error('getReport error:', err);
    res.status(500).json({ message: 'Failed to load report.' });
  }
};
