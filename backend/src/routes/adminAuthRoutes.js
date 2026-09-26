const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { 
  adminLogin, 
  forgotPassword, 
  verifyResetCode, 
  resetPasswordWithCode, 
  getAdminProfile, 
  changeAdminPassword, 
  adminLogout 
} = require('../controllers/adminAuthController');
const { verifyAdminToken } = require('../middleware/authMiddleware');
const { loginLimiter, changePasswordLimiter } = require('../middleware/rateLimiter');

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),

  body('newPassword')
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters long')
];

/**
 * @route   POST /api/admin/auth/login
 * @desc    Authenticate admin user and issue JWT Token (brute-force rate-limited)
 * @access  Public
 */
router.post('/login', loginLimiter, validateLogin, adminLogin);

/**
 * @route   POST /api/admin/auth/forgot-password
 * @desc    Request 2-Step verification OTP for password reset
 * @access  Public (Rate-limited)
 */
router.post('/forgot-password', loginLimiter, forgotPassword);

/**
 * @route   POST /api/admin/auth/verify-code
 * @desc    Verify 2-Step OTP Code
 * @access  Public
 */
router.post('/verify-code', verifyResetCode);

/**
 * @route   POST /api/admin/auth/reset-password
 * @desc    Verify 2-Step OTP and reset password
 * @access  Public (Rate-limited)
 */
router.post('/reset-password', changePasswordLimiter, resetPasswordWithCode);

/**
 * @route   POST /api/admin/auth/logout
 * @desc    Admin logout
 * @access  Private (Admin)
 */
router.post('/logout', verifyAdminToken, adminLogout);

/**
 * @route   GET /api/admin/auth/me
 * @desc    Get currently authenticated admin user details
 * @access  Private (Admin)
 */
router.get('/me', verifyAdminToken, getAdminProfile);

/**
 * @route   PUT /api/admin/auth/change-password
 * @desc    Change authenticated admin password
 * @access  Private (Admin)
 */
router.put('/change-password', verifyAdminToken, changePasswordLimiter, validateChangePassword, changeAdminPassword);

module.exports = router;


