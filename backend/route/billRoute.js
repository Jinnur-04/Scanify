import express from 'express';
import {
  saveBill,
  getBills,
  getBillById,
  getDailyRevenue,
  getTopProducts
} from '../controller/billController.js';

const router = express.Router();

router.post('/', saveBill);
router.get('/', getBills);
router.get('/revenue', getDailyRevenue);
router.get('/top-selling', getTopProducts);
router.get('/:id', getBillById); 

export default router;
