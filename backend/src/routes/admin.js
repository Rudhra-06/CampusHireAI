import express from 'express';
import { getPendingRecruiters, approveRecruiter, getAnalytics } from '../controllers/adminController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/recruiters/pending', authenticate, authorize('admin'), getPendingRecruiters);
router.put('/recruiters/:id/approve', authenticate, authorize('admin'), approveRecruiter);
router.get('/analytics', authenticate, authorize('admin'), getAnalytics);

export default router;
