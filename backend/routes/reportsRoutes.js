import express from 'express';
import {
  getDashboard,
  getMonthlyReport,
  getAnnualReport,
  getCashPosition,
  getProductPerformance,
  getRiskAnalysis,
} from '../controllers/reportsController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require manager or admin access
router.use(protect);
router.use(authorize('manager', 'admin'));

// @route   GET /api/reports/dashboard
router.get('/dashboard', getDashboard);

// @route   GET /api/reports/monthly/:year/:month
router.get('/monthly/:year/:month', getMonthlyReport);

// @route   GET /api/reports/annual/:year
router.get('/annual/:year', getAnnualReport);

// @route   GET /api/reports/cash-position
router.get('/cash-position', getCashPosition);

// @route   GET /api/reports/product-performance
router.get('/product-performance', getProductPerformance);

// @route   GET /api/reports/risk-analysis
router.get('/risk-analysis', getRiskAnalysis);

export default router;

