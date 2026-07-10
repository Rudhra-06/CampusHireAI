import { Op } from 'sequelize';
import Application from '../models/Application.js';
import AssessmentSubmission from '../models/AssessmentSubmission.js';
import AssessmentResult from '../models/AssessmentResult.js';
import Job from '../models/Job.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import ResumeProfile from '../models/ResumeProfile.js';
import User from '../models/User.js';
import Assessment from '../models/Assessment.js';
import AnalyticsCache from '../models/AnalyticsCache.js';

const cacheKeyFor = (scope, userId, filters = {}) => `${scope}:${userId}:${JSON.stringify(filters)}`;

const getCached = async (scope, userId, filters) => {
    const record = await AnalyticsCache.findOne({ where: { scope, userId, key: cacheKeyFor(scope, userId, filters) } });
    if (!record) return null;
    if (record.expiresAt && record.expiresAt < new Date()) return null;
    return record.data;
};

const setCached = async (scope, userId, filters, data) => {
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await AnalyticsCache.upsert({ scope, userId, key: cacheKeyFor(scope, userId, filters), data, expiresAt });
};

export const getRecruiterAnalytics = async (req, res) => {
    try {
        const filters = req.query || {};
        const cache = await getCached('recruiter-analytics', req.user.id, filters);
        if (cache) return res.json(cache);

        const where = { recruiterId: req.user.id };
        if (filters.jobId) where.id = filters.jobId;
        const jobs = await Job.findAll({ where, attributes: ['id', 'title', 'status', 'companyName', 'requiredSkills', 'createdAt'] });

        const jobIds = jobs.map(job => job.id);
        const applications = await Application.findAll({ where: { jobId: { [Op.in]: jobIds } }, include: [{ model: User, as: 'student', attributes: ['id', 'name', 'branch', 'cgpa'] }] });
        const assessments = await Assessment.findAll({ where: { recruiterId: req.user.id }, attributes: ['id', 'title', 'status'] });
        const assessmentSubmissions = await AssessmentSubmission.findAll({ where: { assessmentId: { [Op.in]: assessments.map(item => item.id) } }, include: [{ model: AssessmentResult, as: 'AssessmentResult' }] });

        const totalJobs = jobs.length;
        const activeJobs = jobs.filter(job => job.status === 'active').length;
        const closedJobs = jobs.filter(job => job.status === 'closed').length;
        const applicationsReceived = applications.length;
        const shortlistedCandidates = applications.filter(app => app.status === 'shortlisted').length;
        const interviewedCandidates = applications.filter(app => app.status === 'interview').length;
        const selectedCandidates = applications.filter(app => app.status === 'selected').length;
        const rejectedCandidates = applications.filter(app => app.status === 'rejected').length;
        const averageResumeScore = applications.length ? Math.round(applications.reduce((sum, app) => sum + Number(app.aiScore || 0), 0) / applications.length) : 0;
        const averageCodingAssessmentScore = assessmentSubmissions.length ? Math.round(assessmentSubmissions.reduce((sum, item) => sum + Number(item.score || 0), 0) / assessmentSubmissions.length) : 0;
        const assessmentPassRate = assessmentSubmissions.length ? Math.round((assessmentSubmissions.filter(item => item.score >= 50).length / assessmentSubmissions.length) * 100) : 0;

        const payload = {
            summary: {
                totalJobs,
                activeJobs,
                closedJobs,
                applicationsReceived,
                shortlistedCandidates,
                interviewedCandidates,
                selectedCandidates,
                rejectedCandidates,
                averageResumeScore,
                averageCodingAssessmentScore,
                assessmentPassRate,
            },
            funnel: [
                { name: 'Applied', value: applicationsReceived },
                { name: 'Shortlisted', value: shortlistedCandidates },
                { name: 'Interviewed', value: interviewedCandidates },
                { name: 'Selected', value: selectedCandidates },
            ],
            statusBreakdown: [
                { name: 'Applied', value: applicationsReceived - shortlistedCandidates - interviewedCandidates - selectedCandidates - rejectedCandidates },
                { name: 'Shortlisted', value: shortlistedCandidates },
                { name: 'Interviewed', value: interviewedCandidates },
                { name: 'Selected', value: selectedCandidates },
                { name: 'Rejected', value: rejectedCandidates },
            ],
            skills: jobs.flatMap(job => job.requiredSkills || []).reduce((acc, skill) => {
                acc[skill] = (acc[skill] || 0) + 1;
                return acc;
            }, {}),
            branches: applications.reduce((acc, application) => {
                const branch = application.student?.branch || 'Unknown';
                acc[branch] = (acc[branch] || 0) + 1;
                return acc;
            }, {}),
            cgpa: applications.reduce((acc, application) => {
                const bucket = application.student?.cgpa >= 8 ? '8+ CGPA' : application.student?.cgpa >= 7 ? '7-8 CGPA' : 'Below 7';
                acc[bucket] = (acc[bucket] || 0) + 1;
                return acc;
            }, {}),
        };

        await setCached('recruiter-analytics', req.user.id, filters, payload);
        res.json(payload);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load recruiter analytics.' });
    }
};

export const getStudentAnalytics = async (req, res) => {
    try {
        const filters = req.query || {};
        const cache = await getCached('student-analytics', req.user.id, filters);
        if (cache) return res.json(cache);

        const [profile, analysis, applications, interviewSessions, assessments, recommendations, coverLetters] = await Promise.all([
            ResumeProfile.findOne({ where: { studentId: req.user.id } }),
            ResumeAnalysis.findOne({ where: { studentId: req.user.id } }),
            Application.findAll({ where: { studentId: req.user.id }, include: [{ model: Job, as: 'job', attributes: ['id', 'title', 'companyName'] }] }),
            (await import('../models/InterviewSession.js')).default.findAll({ where: { studentId: req.user.id }, include: [{ model: (await import('../models/InterviewReport.js')).default, as: 'report' }] }),
            AssessmentSubmission.findAll({ where: { studentId: req.user.id }, include: [{ model: AssessmentResult, as: 'AssessmentResult' }] }),
            (await import('../models/ProjectRecommendation.js')).default.findAll({ where: { studentId: req.user.id } }),
            (await import('../models/CoverLetter.js')).default.findAll({ where: { userId: req.user.id } }),
        ]);

        const profileCompletion = Math.min(100, 20 + (profile ? 20 : 0) + (analysis ? 20 : 0) + (applications.length ? 20 : 0) + (profile?.skills?.length ? 20 : 0));
        const resumeBuilderCompletion = profile ? 100 : 40;
        const atsScore = analysis?.analysisData?.scores?.ats || 0;
        const qualityScore = analysis?.analysisData?.scores?.quality || 0;
        const shortlistedJobs = applications.filter(app => app.status === 'shortlisted').length;
        const rejectedJobs = applications.filter(app => app.status === 'rejected').length;
        const interviewInvitations = applications.filter(app => app.status === 'interview').length;
        const interviewScores = interviewSessions.reduce((sum, session) => sum + Number(session.overallScore || 0), 0);
        const codingScores = assessments.reduce((sum, item) => sum + Number(item.score || 0), 0);
        const readiness = Math.round((atsScore * 0.2) + (qualityScore * 0.15) + (shortlistedJobs * 10) + (codingScores > 0 ? Math.min(30, codingScores / assessments.length) : 0) + (interviewScores > 0 ? Math.min(20, interviewScores / Math.max(1, interviewSessions.length)) : 0));

        const payload = {
            summary: {
                profileCompletion,
                resumeBuilderCompletion,
                atsScore,
                qualityScore,
                applicationCount: applications.length,
                shortlistedJobs,
                rejectedJobs,
                interviewInvitations,
                interviewScores,
                codingScores,
                readiness,
            },
            timeline: applications.map(app => ({ name: app.job?.title || 'Application', date: app.createdAt, status: app.status })),
            skills: profile?.skills || [],
            missingSkills: analysis?.analysisData?.missingTechnicalSkills || [],
            recommendations: (recommendations || []).slice(0, 5),
            coverLetters: (coverLetters || []).slice(0, 5),
            strengths: analysis?.analysisData?.strengths || [],
            weaknesses: analysis?.analysisData?.weaknesses || [],
            nextSteps: [
                'Strengthen your resume with quantified achievements',
                'Practice coding problems for the next assessment',
                'Prepare additional interview stories and examples',
            ],
        };

        await setCached('student-analytics', req.user.id, filters, payload);
        res.json(payload);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load student analytics.' });
    }
};
