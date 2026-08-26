const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { adminLogin, getAdminProfile, changeAdminPassword } = require('../controllers/adminAuthController');
const { verifyAdminToken } = require('../middleware/authMiddleware');

const validateLogin = [
  body('email')
    .trim()
    .notEmpty()
    .withMessage('Email address is required')
    .isEmail()
    .withMessage('Please provide a valid email address'),

  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

/**
 * @route   POST /api/admin/auth/login
 * @desc    Authenticate admin user and issue JWT Token
 * @access  Public
 */
router.post('/login', validateLogin, adminLogin);

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
router.put('/change-password', verifyAdminToken, changeAdminPassword);

module.exports = router;

