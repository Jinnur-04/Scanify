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

const router = express.Router();
const storage = multer.memoryStorage(); // For Cloudinary uploads
const upload = multer({ storage });

// ProductType CRUD
router.get('/inventory/forecast', getInventoryForecast);
router.post('/', upload.single('imageFile'), addProduct);
router.put('/:id', upload.single('imageFile'), updateProduct);
router.delete('/:id', deleteProduct);
router.get('/', getAllProducts);
router.get('/:id', getProductById);

// ProductItem (barcoded)
router.post('/barcode', addProductItem);
router.get('/barcode/:barcode', getProductByBarcode);
// 🔔 Low stock alert chart
router.get('/low-stock/chart', getLowStockAlert);


export default router;
