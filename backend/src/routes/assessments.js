import express from 'express';
import { authenticate, authorize } from '../middleware/auth.js';
import {
    createAssessment,
    listAssessments,
    getAssessment,
    updateAssessment,
    deleteAssessment,
    addQuestion,
    getStudentAssessments,
    startAssessment,
    saveProgress,
    submitAssessment,
    getResults,
} from '../controllers/assessmentController.js';

const router = express.Router();

router.get('/', authenticate, listAssessments);
router.post('/', authenticate, authorize('recruiter'), createAssessment);
router.get('/student', authenticate, authorize('student'), getStudentAssessments);
router.get('/:id', authenticate, getAssessment);
router.put('/:id', authenticate, authorize('recruiter'), updateAssessment);
router.delete('/:id', authenticate, authorize('recruiter'), deleteAssessment);
router.post('/:assessmentId/questions', authenticate, authorize('recruiter'), addQuestion);
router.post('/:id/start', authenticate, authorize('student'), startAssessment);
router.post('/:id/save', authenticate, authorize('student'), saveProgress);
router.post('/:id/submit', authenticate, authorize('student'), submitAssessment);
router.get('/:id/results', authenticate, getResults);

export default router;
