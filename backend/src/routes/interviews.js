import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
  createInterview,
  getStudentInterviews,
  getRecruiterInterviews,
  getSession,
  submitInterview,
  getReport,
} from '../controllers/interviewController.js';

const router = express.Router();

router.use(authenticate);

// Order matters — specific paths before :sessionId
router.get('/student',            authorize('student'),            getStudentInterviews);
router.get('/recruiter',          authorize('recruiter', 'admin'), getRecruiterInterviews);
router.post('/create',            authorize('recruiter'),          createInterview);
router.get('/report/:sessionId',  authorize('student', 'recruiter', 'admin'), getReport);
router.get('/:sessionId',         authorize('student', 'recruiter', 'admin'), getSession);
router.post('/:sessionId/submit', authorize('student'),            submitInterview);

export default router;
