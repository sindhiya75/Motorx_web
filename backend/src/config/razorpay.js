
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
      return await razorpayInstance.orders.create({
        amount: options.amount,
        currency: options.currency || 'INR',
        receipt: options.receipt,
        notes: options.notes || {}
      });
    } catch (err) {
      console.warn('Razorpay API call notice:', err.message);
      throw new Error(`Razorpay Order Creation Failed: ${err.error?.description || err.message}`);
    }
  }

  // Simulated / Test Mode Razorpay Order creation fallback when demo keys are in use
  const mockRzpOrderId = `order_${Date.now()}_${Math.floor(1000 + Math.random() * 9000)}`;
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
 * Verifies Razorpay HMAC SHA256 Payment Signature using timing-safe comparison
 */
const verifyRazorpaySignature = ({ razorpay_order_id, razorpay_payment_id, razorpay_signature }) => {
  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return false;
  }

  // In local test mode with demo keys, accept simulated test signatures starting with 'sig_test_' or valid HMAC
  if (key_id === 'rzp_test_motorx_demo' && razorpay_signature.startsWith('sig_test_')) {
    return true;
  }

  try {
    const generatedSignature = crypto
      .createHmac('sha256', key_secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature.length !== razorpay_signature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(generatedSignature, 'utf-8'),
      Buffer.from(razorpay_signature, 'utf-8')
    );
  } catch (err) {
    console.error('Signature verification error:', err.message);
    return false;
  }
};

/**
 * Verifies Razorpay Webhook HMAC Signature
 */
const verifyWebhookSignature = (bodyString, signature) => {
  if (!signature || !webhook_secret) return false;
  
  if (key_id === 'rzp_test_motorx_demo' && signature.startsWith('sig_webhook_test')) {
    return true;
  }

  try {
    const expectedSignature = crypto
      .createHmac('sha256', webhook_secret)
      .update(bodyString)
      .digest('hex');

    if (expectedSignature.length !== signature.length) {
      return false;
    }

    return crypto.timingSafeEqual(
      Buffer.from(expectedSignature, 'utf-8'),
      Buffer.from(signature, 'utf-8')
    );
  } catch (err) {
    return false;
  }
};

module.exports = {
  key_id,
  createRazorpayOrder,
  verifyRazorpaySignature,
  verifyWebhookSignature
};

