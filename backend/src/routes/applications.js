import express from 'express';
import { applyForJob, getMyApplications, updateApplicationStatus } from '../controllers/applicationController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('student'), applyForJob);
router.get('/my', authenticate, authorize('student'), getMyApplications);
router.put('/:id/status', authenticate, authorize('recruiter', 'admin'), updateApplicationStatus);

export default router;
