import express from 'express';
import {
  saveBill,
  getBills,
  getBillById,
  getDailyRevenue,
  getTopProducts,
  getStaffPerformance,
  createRazorpayOrderAndSaveBill ,
  verifyAndFinalizeBillPayment
} from '../controller/billController.js';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.js'; 

const router = express.Router();

// 🔐 Apply base auth middleware to all bill routes
router.use(authMiddleware);

// ✅ Routes with or without role-based protection
router.post('/', saveBill);
router.get('/', getBills);
router.post('/payment/create-order-from-products',createRazorpayOrderAndSaveBill);
router.post('/payment/verify', verifyAndFinalizeBillPayment);
router.get('/revenue', authorizeRoles('Admin', 'Manager'), getDailyRevenue);
router.get('/top-selling', getTopProducts);
router.get('/staff-performance', authorizeRoles('Admin', 'Manager'), getStaffPerformance);
router.get('/:id', getBillById);

export default router;
