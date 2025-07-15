import express from 'express';
import multer from 'multer';
import {
  addProduct,
  addProductItem,
  getAllProducts,
  getProductById,
  getProductByBarcode,
  updateProduct,
  deleteProduct,
  getLowStockAlert,
  getInventoryForecast
} from '../controller/productController.js';
import { authMiddleware, authorizeRoles } from '../middlewares/auth.js';

const router = express.Router();
const storage = multer.memoryStorage(); // For Cloudinary uploads
const upload = multer({ storage });

// Apply auth to all routes
router.use(authMiddleware);

// ProductType CRUD
router.get('/inventory/forecast', getInventoryForecast);
router.post('/', authorizeRoles('Admin', 'Manager'), upload.single('imageFile'), addProduct);
router.put('/:id', authorizeRoles('Admin', 'Manager'), upload.single('imageFile'), updateProduct);
router.delete('/:id', authorizeRoles('Admin'), deleteProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// ProductItem (barcoded)
router.post('/barcode', authorizeRoles('Admin', 'Manager'), addProductItem);
router.get('/barcode/:barcode', getProductByBarcode);

// 🔔 Low stock alert chart
router.get('/low-stock/chart', authorizeRoles('Admin', 'Manager'), getLowStockAlert);

export default router;
