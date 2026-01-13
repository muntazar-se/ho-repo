import express from 'express';
import {
  register,
  login,
  getMe,
  changePassword,
} from '../controllers/authController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import { validateUserRegistration, validateLogin, validateChangePassword } from '../utils/validators.js';
import rateLimit from 'express-rate-limit';
import { RATE_LIMITS } from '../config/constants.js';

const router = express.Router();

// Rate limiting for auth routes (more lenient in development)
const authLimiter = rateLimit({
  windowMs: RATE_LIMITS.AUTH.windowMs,
  max: process.env.NODE_ENV === 'production' ? RATE_LIMITS.AUTH.max : 100, // Allow more attempts in development
  message: 'Too many login attempts, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development' && req.ip === '::1', // Skip for localhost in dev
});

// @route   POST /api/auth/register
router.post('/register', protect, authorize('admin'), validateUserRegistration, authLimiter, register);

// @route   POST /api/auth/login
router.post('/login', validateLogin, authLimiter, login);

// @route   GET /api/auth/me
router.get('/me', protect, getMe);

// @route   PUT /api/auth/change-password
router.put('/change-password', protect, validateChangePassword, changePassword);

export default router;

