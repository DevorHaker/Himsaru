import express from 'express';
import {
  getAllProducts,
  getAllProductsAdmin,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Admin-only routes (must come before /:identifier to avoid being swallowed)
router.get('/admin/all', protect, requireAdmin, getAllProductsAdmin);
router.post('/', protect, requireAdmin, createProduct);
router.put('/:id', protect, requireAdmin, updateProduct);
router.delete('/:id', protect, requireAdmin, deleteProduct);

// Public routes
router.get('/', getAllProducts);
router.get('/:identifier', getProduct);

export default router;
