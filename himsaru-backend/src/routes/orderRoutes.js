import express from 'express';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';
import { createOrder, getMyOrders, getAllOrders, updateOrderStatus } from '../controllers/orderController.js';

const router = express.Router();

// User routes
router.post('/', protect, createOrder);
router.get('/myorders', protect, getMyOrders);

// Admin routes
router.get('/admin', protect, requireAdmin, getAllOrders);
router.patch('/:id/status', protect, requireAdmin, updateOrderStatus);

export default router;
