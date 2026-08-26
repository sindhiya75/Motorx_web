const express = require('express');
const router = express.Router();
const { processCheckout, getOrderByNumber } = require('../controllers/orderController');
const { validateCheckout } = require('../validators/orderValidator');

/**
 * @route   POST /api/orders/checkout
 * @desc    Submit guest checkout order with server-side price & stock verification
 * @access  Public
 */
router.post('/checkout', validateCheckout, processCheckout);

/**
 * @route   GET /api/orders/:orderNumber
 * @desc    Fetch order details and tracking status by Order Number
 * @access  Public
 */
router.get('/:orderNumber', getOrderByNumber);

module.exports = router;
