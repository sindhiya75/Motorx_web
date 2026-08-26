const express = require('express');
const router = express.Router();
const { createPaymentOrder, verifyPayment, handleWebhook } = require('../controllers/paymentController');
const { validateCheckout } = require('../validators/orderValidator');

/**
 * @route   POST /api/payments/create-order
 * @desc    Initialize checkout order & Razorpay order (or COD)
 * @access  Public
 */
router.post('/create-order', validateCheckout, createPaymentOrder);

/**
 * @route   POST /api/payments/verify
 * @desc    Verify Razorpay HMAC SHA256 payment signature
 * @access  Public
 */
router.post('/verify', verifyPayment);

/**
 * @route   POST /api/payments/webhook
 * @desc    Razorpay Webhook Callback Listener
 * @access  Public
 */
router.post('/webhook', express.raw({ type: 'application/json' }), handleWebhook);

module.exports = router;
