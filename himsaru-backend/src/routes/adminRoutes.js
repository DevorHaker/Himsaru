import express from 'express';
import { protect, requireAdmin } from '../middlewares/authMiddleware.js';
import {
  getStats,
  getContacts,
  markContactRead,
  deleteContact,
  getDistributors,
  updateDistributorStatus,
  getUsers,
} from '../controllers/adminController.js';

const router = express.Router();

// All admin routes require authentication + ADMIN role
router.use(protect, requireAdmin);

router.get('/stats', getStats);

router.get('/contacts', getContacts);
router.patch('/contacts/:id/read', markContactRead);
router.delete('/contacts/:id', deleteContact);

router.get('/distributors', getDistributors);
router.patch('/distributors/:id/status', updateDistributorStatus);

router.get('/users', getUsers);

export default router;
