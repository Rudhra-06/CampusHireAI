import express from 'express';
import { analyze, getLatest } from '../controllers/resumeAnalyzerController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/analyze', authenticate, authorize('student'), analyze);
router.get('/latest',   authenticate, authorize('student'), getLatest);

export default router;
