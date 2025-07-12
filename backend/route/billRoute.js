import express from 'express';
import {
  saveBill,
  getBills,
  getBillById,
  getDailyRevenue,
  getTopProducts,
  getStaffPerformance 
} from '../controller/billController.js';

const router = express.Router();

router.post('/', saveBill);
router.get('/', getBills);
router.get('/revenue', getDailyRevenue);
router.get('/top-selling', getTopProducts);
router.get('/staff-performance', getStaffPerformance);
router.get('/:id', getBillById); 


export default router;
