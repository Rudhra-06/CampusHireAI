import express from 'express';
import { generate, history, getById, deleteById } from '../controllers/coverLetterController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

const student = [authenticate, authorize('student')];

router.post('/generate',  ...student, generate);
router.get('/history',    ...student, history);
router.get('/:id',        ...student, getById);
router.delete('/:id',     ...student, deleteById);

export default router;
