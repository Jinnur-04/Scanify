// routes/chatRoutes.js
import express from 'express';
import { askAI } from '../controller/chatController.js';

const router = express.Router();

router.post('/query', askAI);

export default router;
