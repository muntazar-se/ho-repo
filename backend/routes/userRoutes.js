import express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  toggleUserActive,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

// All routes require admin access
router.use(protect);
router.use(authorize('admin'));

// @route   GET /api/users
router.get('/', getUsers);

// @route   GET /api/users/:id
router.get('/:id', getUserById);

// @route   PUT /api/users/:id
router.put('/:id', updateUser);

// @route   DELETE /api/users/:id
router.delete('/:id', deleteUser);

// @route   PATCH /api/users/:id/toggle-active
router.patch('/:id/toggle-active', toggleUserActive);

export default router;

