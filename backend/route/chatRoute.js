// routes/chatRoutes.js
import express from 'express';
import { askAI } from '../controller/chatController.js';
import { authMiddleware } from '../middlewares/auth.js';

const router = express.Router();

// 🔐 Protect chat query route for logged-in users only
router.post('/query', authMiddleware, askAI);

export default router;
