import express from 'express';
import { getResume, createResume, updateResume, deleteResume } from '../controllers/resumeBuilderController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/',    authenticate, authorize('student'), getResume);
router.post('/',   authenticate, authorize('student'), createResume);
router.put('/',    authenticate, authorize('student'), updateResume);
router.delete('/', authenticate, authorize('student'), deleteResume);

export default router;
