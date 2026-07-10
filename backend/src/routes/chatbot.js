import express from 'express';
import auth from '../middleware/auth.js';
import { createChatSession, getChatSessionMessages, listChatSessions, sendChatMessage } from '../controllers/chatbotController.js';

const router = express.Router();

router.get('/sessions', auth, listChatSessions);
router.post('/sessions', auth, createChatSession);
router.get('/sessions/:sessionId', auth, getChatSessionMessages);
router.post('/messages', auth, sendChatMessage);

export default router;
