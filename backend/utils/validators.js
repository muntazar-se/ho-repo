import { body } from 'express-validator';

export const validateUserRegistration = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters'),
  body('email').isEmail().withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('fullName')
    .trim()
    .isLength({ min: 2 })
    .withMessage('Full name must be at least 2 characters'),
  body('role')
    .isIn(['admin', 'manager', 'dataEntry'])
    .withMessage('Role must be admin, manager, or dataEntry'),
];

export const validateLogin = [
  body('username').notEmpty().withMessage('Username or email is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

export const validateDailySales = [
  body('date').isISO8601().withMessage('Valid date is required'),
  body('products').isObject().withMessage('Products data is required'),
  body('directCosts').isObject().withMessage('Direct costs data is required'),
  body('paymentsReceived').isObject().withMessage('Payments received data is required'),
  body('expenses').isObject().withMessage('Expenses data is required'),
];

export const validateChangePassword = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
];

