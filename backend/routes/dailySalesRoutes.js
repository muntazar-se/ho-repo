import express from 'express';
import {
  createDailySales,
  getDailySales,
  getDailySalesById,
  updateDailySales,
  deleteDailySales,
  getDailySalesByDate,
  getDailySalesByMonth,
} from '../controllers/dailySalesController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validateDailySales } from '../utils/validators.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/daily-sales-history
router.post('/', authorize('admin', 'dataEntry'), validateDailySales, createDailySales);

// @route   GET /api/daily-sales-history
router.get('/', getDailySales);

// @route   GET /api/daily-sales-history/date/:date
router.get('/date/:date', getDailySalesByDate);

// @route   GET /api/daily-sales-history/month/:year/:month
router.get('/month/:year/:month', getDailySalesByMonth);

// @route   GET /api/daily-sales-history/:id
router.get('/:id', getDailySalesById);

// @route   PUT /api/daily-sales-history/:id
router.put('/:id', authorize('admin', 'dataEntry'), validateDailySales, updateDailySales);

// @route   DELETE /api/daily-sales-history/:id
router.delete('/:id', authorize('admin'), deleteDailySales);

export default router;

