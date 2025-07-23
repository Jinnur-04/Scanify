import express from 'express';
import { body } from 'express-validator';
import multer from 'multer';

import {
  createStaff,
  getAllStaff,
  getStaffById,
  updateStaff,
  deleteStaff,
  loginStaff,
  sendResetLink,
  resetPassword,
  getStaffPerformance,
  getStaffProfileWithStats,
  changeStaffPassword,
  updateProfilePhoto
} from '../controller/staffController.js';

import { authMiddleware, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() }); // For profile photo upload

// 🔓 Public routes
router.post(
  '/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').notEmpty().withMessage('Email is required'),
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

router.post('/send-reset-link', sendResetLink);
router.post('/reset-password/:token', resetPassword);


// 🔐 Protected Routes

// 📊 Staff performance chart (Admin, Manager)
router.get('/performence/chart', authMiddleware, authorizeRoles('Admin', 'Manager'), getStaffPerformance);

// 👤 My Profile routes
router.get('/:id/details', authMiddleware, getStaffProfileWithStats);                 // Profile + stats
router.patch('/:id/password', authMiddleware, changeStaffPassword);                  // Change password
router.patch('/:id/photo', authMiddleware, upload.single('photo'), updateProfilePhoto); // Update profile pic

// 👥 Staff management (Admin only)
router.get('/', authMiddleware, authorizeRoles('Admin'), getAllStaff);
router.get('/:id', authMiddleware, getStaffById);
router.put('/:id', authMiddleware, updateStaff);
router.delete('/:id', authMiddleware, authorizeRoles('Admin'), deleteStaff);

export default router;
