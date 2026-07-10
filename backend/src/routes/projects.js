import express from 'express';
import { recommend, getLatest, deleteRecommendations, updateBookmarks } from '../controllers/projectRecommendController.js';
import { authenticate, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/recommend',            authenticate, authorize('student'), recommend);
router.get('/recommend/latest',      authenticate, authorize('student'), getLatest);
router.delete('/recommend',          authenticate, authorize('student'), deleteRecommendations);
router.patch('/recommend/bookmarks', authenticate, authorize('student'), updateBookmarks);

export default router;
