import express from 'express';
import { createJob, getJobs, getJobById, updateJob, deleteJob, getJobApplicants } from '../controllers/jobController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/', authenticate, authorize('recruiter'), createJob);
router.get('/', authenticate, getJobs);
router.get('/:id', authenticate, getJobById);
router.put('/:id', authenticate, authorize('recruiter'), updateJob);
router.delete('/:id', authenticate, authorize('recruiter'), deleteJob);
router.get('/:id/applicants', authenticate, authorize('recruiter', 'admin'), getJobApplicants);

export default router;
