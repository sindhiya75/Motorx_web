const Razorpay = require('razorpay');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_motorx_demo';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'motorx_razorpay_secret_demo';
const webhook_secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'motorx_webhook_secret_demo';

let razorpayInstance = null;

try {
  if (key_id && key_secret) {
    razorpayInstance = new Razorpay({
      key_id,
      key_secret
    });
  }
} catch (e) {
  console.warn('Razorpay SDK initialization notice:', e.message);
}

/**
 * Creates a Razorpay Order
 */
const createRazorpayOrder = async (options) => {
  if (razorpayInstance && key_id !== 'rzp_test_motorx_demo') {
    try {
      return await razorpayInstance.orders.create(options);
    } catch (err) {
      console.warn('Razorpay SDK order creation failed, falling back to simulated order:', err.message);
    }
  }

  // Simulated / Test Mode Razorpay Order creation fallback
  const mockRzpOrderId = `order_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
  return {
    id: mockRzpOrderId,
    entity: 'order',
    amount: options.amount,
    amount_paid: 0,
    amount_due: options.amount,
    currency: options.currency || 'INR',
    receipt: options.receipt,
    status: 'created',
    attempts: 0,
    created_at: Math.floor(Date.now() / 1000)
  };
};

/**
 * Verifies Razorpay HMAC SHA256 Payment Signature
 */
const verifyRazorpaySignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false;
  }

  // In test mode with demo keys, accept simulated test signatures starting with 'sig_test_' or valid HMAC
  if (key_id === 'rzp_test_motorx_demo' && razorpay_signature.startsWith('sig_test_')) {
    return true;
  }

  const generatedSignature = crypto
    .createHmac('sha256', key_secret)
    .update(`${razorpay_order_id}|${razorpay_payment_id}`)
    .digest('hex');

  return generatedSignature === razorpay_signature;
};

/**
 * Verifies Razorpay Webhook HMAC Signature
 */
const verifyWebhookSignature = (bodyString, signature) => {
  if (!signature || !webhook_secret) return false;
  
  if (key_id === 'rzp_test_motorx_demo' && signature.startsWith('sig_webhook_test')) {
    return true;
  }

  const expectedSignature = crypto
    .createHmac('sha256', webhook_secret)
    .update(bodyString)
    .digest('hex');

  return expectedSignature === signature;
};

module.exports = {
  key_id,
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature
};
