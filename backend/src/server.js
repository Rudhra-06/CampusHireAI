import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fs from 'fs';
import sequelize from './config/db.js';
import './models/User.js';
import './models/Job.js';
import './models/Application.js';
import './models/ResumeProfile.js';
import './models/ResumeAnalysis.js';
import './models/ProjectRecommendation.js';
import './models/CoverLetter.js';
import './models/InterviewSession.js';
import './models/InterviewQuestion.js';
import './models/InterviewAnswer.js';
import './models/InterviewReport.js';
import './models/Assessment.js';
import './models/AssessmentQuestion.js';
import './models/AssessmentSubmission.js';
import './models/CodingSubmission.js';
import './models/MCQSubmission.js';
import './models/AssessmentResult.js';
import './models/ChatSession.js';
import './models/ChatMessage.js';
import './models/AnalyticsCache.js';
import authRoutes from './routes/auth.js';
import jobRoutes from './routes/jobs.js';
import applicationRoutes from './routes/applications.js';
import adminRoutes from './routes/admin.js';
import uploadRoutes from './routes/upload.js';
import interviewRoutes from './routes/interviews.js';
import resumeAnalyzerRoutes from './routes/resumeAnalyzer.js';
import resumeBuilderRoutes from './routes/resumeBuilder.js';
import projectRoutes from './routes/projects.js';
import coverLetterRoutes from './routes/coverLetter.js';
import assessmentRoutes from './routes/assessments.js';
import analyticsRoutes from './routes/analytics.js';
import chatbotRoutes from './routes/chatbot.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads', { recursive: true });

app.get('/api/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/interviews', interviewRoutes);
app.use('/api/resume-analyzer', resumeAnalyzerRoutes);
app.use('/api/resume-builder', resumeBuilderRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/cover-letter', coverLetterRoutes);
app.use('/api/assessments', assessmentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chatbot', chatbotRoutes);

app.use((req, res) => res.status(404).json({ message: 'Route not found.' }));

app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error.' });
});

const PORT = process.env.PORT || 5000;

sequelize.sync({ alter: process.env.DB_SYNC_ALTER === 'true' })
  .then(() => {
    console.log('PostgreSQL connected and tables synced');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error('Database connection error:', err));
