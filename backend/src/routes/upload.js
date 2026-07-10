import express from 'express';
import { upload, uploadResume } from '../controllers/uploadController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/resume', authenticate, authorize('student'), upload.single('resume'), uploadResume);

export default router;
