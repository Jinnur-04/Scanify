import express from 'express';
import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  loginStaff,
  forgotPassword,
  getStaffPerformance
} from '../controller/staffController.js';

import { body } from 'express-validator';
import authMiddleware from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('username').notEmpty().withMessage('Username is required'),
    body('password').isLength({ min: 4 }).withMessage('Password must be at least 4 characters'),
    body('role').notEmpty().withMessage('Role is required'),
  ],
  createStaff
);

router.post(
  '/login',
  [
    body('username').notEmpty().withMessage('Username is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  loginStaff
);

router.post('/forgot-password', forgotPassword);

// Chart route first to avoid ID conflicts
router.get('/performence/chart', getStaffPerformance);

// Protected routes
router.get('/',  getAllStaff);
router.get('/:id', authMiddleware, getStaffById);
router.put('/:id', authMiddleware, updateStaff);
router.delete('/:id', authMiddleware, deleteStaff);

export default router;
