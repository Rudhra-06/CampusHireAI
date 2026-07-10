import express from 'express';
import { getRecruiterAnalytics, getStudentAnalytics } from '../controllers/analyticsController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

router.get('/recruiter', auth, getRecruiterAnalytics);
router.get('/student', auth, getStudentAnalytics);

export default router;
