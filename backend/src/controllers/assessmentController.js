import Assessment from '../models/Assessment.js';
import AssessmentQuestion from '../models/AssessmentQuestion.js';
import AssessmentSubmission from '../models/AssessmentSubmission.js';
import AssessmentResult from '../models/AssessmentResult.js';
import MCQSubmission from '../models/MCQSubmission.js';
import CodingSubmission from '../models/CodingSubmission.js';
import Job from '../models/Job.js';
import { Op } from 'sequelize';
import { generateQuestions } from '../services/assessmentAiService.js';
import { executeCode } from '../services/codeExecutionService.js';

export const createAssessment = async (req, res) => {
    try {
        const payload = {
            ...req.body,
            recruiterId: req.user.id,
            status: req.body.status || 'draft',
        };
        const assessment = await Assessment.create(payload);
        res.status(201).json(assessment);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create assessment.' });
    }
};

export const listAssessments = async (req, res) => {
    try {
        const assessments = await Assessment.findAll({
            include: [{ model: Job, as: 'job', attributes: ['id', 'title', 'companyName'] }],
            order: [['createdAt', 'DESC']],
        });
        res.json(assessments);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load assessments.' });
    }
};

export const getAssessment = async (req, res) => {
    try {
        const assessment = await Assessment.findByPk(req.params.id, {
            include: [{ model: AssessmentQuestion, as: 'AssessmentQuestions' }],
        });
        if (!assessment) return res.status(404).json({ message: 'Assessment not found.' });
        res.json(assessment);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load assessment.' });
    }
};

export const updateAssessment = async (req, res) => {
    try {
        const [updated] = await Assessment.update(req.body, { where: { id: req.params.id, recruiterId: req.user.id } });
        if (!updated) return res.status(404).json({ message: 'Assessment not found.' });
        const assessment = await Assessment.findByPk(req.params.id);
        res.json(assessment);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to update assessment.' });
    }
};

export const deleteAssessment = async (req, res) => {
    try {
        const deleted = await Assessment.destroy({ where: { id: req.params.id, recruiterId: req.user.id } });
        if (!deleted) return res.status(404).json({ message: 'Assessment not found.' });
        res.json({ message: 'Assessment deleted.' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete assessment.' });
    }
};

export const addQuestion = async (req, res) => {
    try {
        const question = await AssessmentQuestion.create({
            ...req.body,
            assessmentId: req.params.assessmentId,
        });
        res.status(201).json(question);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to add question.' });
    }
};

export const generateAssessmentQuestions = async (req, res) => {
    try {
        const { role, requiredSkills, difficulty, count } = req.body;
        const questions = await generateQuestions({ role, requiredSkills, difficulty, count });
        res.json({ questions });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to generate questions.' });
    }
};

export const deleteQuestion = async (req, res) => {
    try {
        const deleted = await AssessmentQuestion.destroy({ where: { id: req.params.questionId, assessmentId: req.params.assessmentId } });
        if (!deleted) return res.status(404).json({ message: 'Question not found.' });
        res.json({ message: 'Question deleted.' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to delete question.' });
    }
};

export const startAssessment = async (req, res) => {
    try {
        const assessment = await Assessment.findByPk(req.params.id);
        if (!assessment) return res.status(404).json({ message: 'Assessment not found.' });
        if (assessment.status !== 'published') return res.status(400).json({ message: 'Assessment is not available.' });

        const existing = await AssessmentSubmission.findOne({
            where: { assessmentId: req.params.id, studentId: req.user.id, status: { [Op.in]: ['in_progress', 'submitted', 'graded'] } },
        });
        if (existing) return res.status(400).json({ message: 'Assessment already started.' });

        const submission = await AssessmentSubmission.create({
            assessmentId: req.params.id,
            studentId: req.user.id,
            startedAt: new Date(),
            status: 'in_progress',
        });

        const questions = await AssessmentQuestion.findAll({ where: { assessmentId: req.params.id }, order: [['orderIndex', 'ASC']] });
        res.status(201).json({ submission, questions });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to start assessment.' });
    }
};

export const saveProgress = async (req, res) => {
    try {
        const { answers } = req.body;
        const submission = await AssessmentSubmission.findOne({ where: { id: req.params.id, studentId: req.user.id } });
        if (!submission) return res.status(404).json({ message: 'Submission not found.' });
        await submission.update({ metadata: { ...(submission.metadata || {}), answers } });
        res.json({ message: 'Progress saved.' });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to save progress.' });
    }
};

const evaluateMcq = (question, answer) => {
    const correct = Array.isArray(question.correctAnswers) ? question.correctAnswers : [];
    const selected = Array.isArray(answer) ? answer : [];
    const isCorrect = selected.length > 0 && selected.every(item => correct.includes(item)) && correct.length === selected.length;
    return { isCorrect, score: isCorrect ? question.points : 0 };
};

export const submitAssessment = async (req, res) => {
    try {
        const { answers = {}, codeSubmissions = [] } = req.body;
        const submission = await AssessmentSubmission.findOne({ where: { id: req.params.id, studentId: req.user.id } });
        if (!submission) return res.status(404).json({ message: 'Submission not found.' });
        if (submission.status === 'submitted' || submission.status === 'graded') return res.status(400).json({ message: 'Assessment already submitted.' });

        const questions = await AssessmentQuestion.findAll({ where: { assessmentId: submission.assessmentId }, order: [['orderIndex', 'ASC']] });
        let mcqScore = 0;
        let programmingScore = 0;
        let totalScore = 0;

        for (const question of questions) {
            if (question.questionType === 'mcq') {
                const answer = answers[question.id];
                const outcome = evaluateMcq(question, answer);
                mcqScore += outcome.score;
                await MCQSubmission.create({ submissionId: submission.id, questionId: question.id, selectedAnswers: answer || [], score: outcome.score, isCorrect: outcome.isCorrect });
            }

            if (question.questionType === 'programming') {
                const codeSubmission = codeSubmissions.find(item => item.questionId === question.id);
                if (codeSubmission) {
                    const executionResult = await executeCode({
                        code: codeSubmission.code || '',
                        language: codeSubmission.language || 'python',
                        tests: question.exampleTests || [{ input: '', expected: '' }],
                    });
                    const score = Number(executionResult.score || 0);
                    programmingScore += score;
                    await CodingSubmission.create({
                        submissionId: submission.id,
                        questionId: question.id,
                        language: codeSubmission.language || 'python',
                        code: codeSubmission.code || '',
                        status: executionResult.status || 'completed',
                        score,
                        executionTime: Number(executionResult.executionTime || 0),
                        memoryUsage: Number(executionResult.memoryUsage || 0),
                        compilerOutput: executionResult.compilerOutput || '',
                        errorMessage: executionResult.errorMessage || '',
                        testResults: executionResult.testResults || [],
                    });
                }
            }
        }

        totalScore = Math.round(mcqScore + programmingScore);
        const assessment = await Assessment.findByPk(submission.assessmentId);

        const passed = totalScore >= Number(assessment?.passingScore || 0);
        const feedback = `Completed ${assessment?.title || 'assessment'} with a score of ${totalScore}. Focus on strengthening problem-solving and code quality.`;
        const skillAnalysis = [
            'Logic and problem solving',
            'Code clarity',
            'Debugging approach',
        ];
        const improvementSuggestions = [
            'Practice more coding drills on arrays and strings.',
            'Review time complexity and edge cases.',
            'Write clearer variable naming and comments.',
        ];
        const recommendedTopics = ['Data structures', 'Algorithms', 'System design'];
        const learningResources = ['LeetCode', 'HackerRank', 'GeeksforGeeks'];

        await submission.update({ status: 'graded', submittedAt: new Date(), score: totalScore, timeTakenMinutes: Math.max(1, Math.round((new Date() - submission.startedAt) / 60000)) });
        const result = await AssessmentResult.create({
            submissionId: submission.id,
            overallScore: totalScore,
            programmingScore,
            mcqScore,
            timeTakenMinutes: submission.timeTakenMinutes || 1,
            passed,
            feedback,
            skillAnalysis,
            improvementSuggestions,
            recommendedTopics,
            learningResources,
        });

        res.json({ submission, result });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to submit assessment.' });
    }
};

export const getResults = async (req, res) => {
    try {
        const submission = await AssessmentSubmission.findOne({ where: { id: req.params.id, studentId: req.user.id }, include: [{ model: AssessmentResult, as: 'AssessmentResult' }] });
        if (!submission) return res.status(404).json({ message: 'Submission not found.' });
        res.json(submission);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load results.' });
    }
};

export const getStudentAssessments = async (req, res) => {
    try {
        const assessments = await Assessment.findAll({
            where: {
                status: 'published'
            },
            include: [
                {
                    model: Job,
                    as: 'job',
                    attributes: ['id', 'title', 'companyName']
                },
                {
                    model: AssessmentQuestion,
                    as: 'AssessmentQuestions'
                }
            ],
            order: [['createdAt', 'DESC']]
        });

        res.json(assessments);

    } catch (error) {
        console.error(error);

        res.status(500).json({
            message: error.message || 'Failed to load assessments.'
        });
    }
};