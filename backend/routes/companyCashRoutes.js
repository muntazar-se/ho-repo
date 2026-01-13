import express from 'express';
import {
  getCompanyCash,
  getCashHistory,
} from '../controllers/companyCashController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require manager or admin access
router.use(protect);
router.use(authorize('manager', 'admin'));

// @route   GET /api/company-cash
router.get('/', getCompanyCash);

// @route   GET /api/company-cash/history
router.get('/history', getCashHistory);

export default router;

