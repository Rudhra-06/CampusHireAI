import ChatSession from '../models/ChatSession.js';
import ChatMessage from '../models/ChatMessage.js';
import ResumeProfile from '../models/ResumeProfile.js';
import ResumeAnalysis from '../models/ResumeAnalysis.js';
import Application from '../models/Application.js';
import Job from '../models/Job.js';
import AssessmentSubmission from '../models/AssessmentSubmission.js';
import AssessmentResult from '../models/AssessmentResult.js';
import InterviewSession from '../models/InterviewSession.js';
import InterviewReport from '../models/InterviewReport.js';
import { generateAiResponse } from '../services/aiService.js';

const buildChatContext = async (studentId) => {
    const [profile, analysis, applications, assessments, interviewSessions] = await Promise.all([
        ResumeProfile.findOne({ where: { studentId } }),
        ResumeAnalysis.findOne({ where: { studentId } }),
        Application.findAll({ where: { studentId }, include: [{ model: Job, as: 'job', attributes: ['title', 'companyName'] }] }),
        AssessmentSubmission.findAll({ where: { studentId }, include: [{ model: AssessmentResult, as: 'AssessmentResult' }] }),
        InterviewSession.findAll({ where: { studentId }, include: [{ model: InterviewReport, as: 'report' }] }),
    ]);

    return {
        profile,
        analysis,
        applications,
        assessments,
        interviewSessions,
    };
};

export const listChatSessions = async (req, res) => {
    try {
        const sessions = await ChatSession.findAll({ where: { studentId: req.user.id }, order: [['updatedAt', 'DESC']] });
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load chat sessions.' });
    }
};

export const createChatSession = async (req, res) => {
    try {
        const session = await ChatSession.create({ studentId: req.user.id, title: req.body?.title || 'New Chat' });
        res.status(201).json(session);
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to create chat session.' });
    }
};

export const getChatSessionMessages = async (req, res) => {
    try {
        const session = await ChatSession.findOne({ where: { id: req.params.sessionId, studentId: req.user.id } });
        if (!session) return res.status(404).json({ message: 'Chat session not found.' });

        const messages = await ChatMessage.findAll({ where: { sessionId: session.id }, order: [['createdAt', 'ASC']] });
        res.json({ session, messages });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to load chat messages.' });
    }
};

export const sendChatMessage = async (req, res) => {
    try {
        const { sessionId, content } = req.body;
        let session = await ChatSession.findOne({ where: { id: sessionId, studentId: req.user.id } });

        if (!session) {
            session = await ChatSession.create({ studentId: req.user.id, title: content.slice(0, 40) || 'New Chat' });
        }

        await ChatMessage.create({ sessionId: session.id, role: 'user', content });

        const context = await buildChatContext(req.user.id);
        const history = await ChatMessage.findAll({ where: { sessionId: session.id }, order: [['createdAt', 'ASC']] });
        const prompt = `You are CampusHire AI career advisor for a student. Use the student's context only. Context:\n${JSON.stringify({ context, history: history.map(item => ({ role: item.role, content: item.content })) }, null, 2)}\n\nAnswer the student's latest message concisely and helpfully.`;

        const aiReply = await generateAiResponse(prompt);
        const assistantMessage = await ChatMessage.create({ sessionId: session.id, role: 'assistant', content: aiReply });
        session.title = session.title === 'New Chat' ? content.slice(0, 40) : session.title;
        await session.save();

        res.json({ session, message: assistantMessage });
    } catch (error) {
        res.status(500).json({ message: error.message || 'Failed to send chat message.' });
    }
};
