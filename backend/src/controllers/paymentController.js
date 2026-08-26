const { pool } = require('../config/database');
const { validationResult } = require('express-validator');
const { key_id, createRazorpayOrder, verifyRazorpaySignature, verifyWebhookSignature } = require('../config/razorpay');

/**
 * Step 1: Create Payment / Order Request
 * Handles both COD and Razorpay Online Payment initialization
 */
const createPaymentOrder = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { customer, address, items, shippingMethod = 'standard', paymentMethod = 'upi' } = req.body;
  const isCod = paymentMethod.toLowerCase() === 'cod';

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let calculatedSubtotal = 0;
    const validatedItems = [];

    // Verify product pricing & stock live from PostgreSQL
    for (const item of items) {
      const productRes = await client.query(
        `SELECT p.id, p.sku, p.name, p.price, p.sale_price, p.status, p.gst_rate, inv.stock_quantity 
         FROM products p 
         LEFT JOIN inventory inv ON inv.product_id = p.id 
         WHERE p.id = $1`,
        [item.productId]
      );

      if (productRes.rows.length === 0) {
        throw new Error(`Product ID ${item.productId} not found in database catalog`);
      }

      const dbProduct = productRes.rows[0];

      if (dbProduct.status === 'OUT_OF_STOCK' || (dbProduct.stock_quantity !== null && dbProduct.stock_quantity < item.quantity)) {
        throw new Error(`Product "${dbProduct.name}" is currently out of stock or has insufficient quantity`);
      }

      const unitPrice = parseFloat(dbProduct.sale_price || dbProduct.price || 0);
      const itemSubtotal = unitPrice * item.quantity;
      calculatedSubtotal += itemSubtotal;

      validatedItems.push({
        productId: dbProduct.id,
        name: dbProduct.name,
        sku: dbProduct.sku,
        unitPrice,
        quantity: item.quantity,
        subtotal: itemSubtotal
      });
    }

    // Server-side Tax & Shipping calculation
    const taxAmount = Math.round(calculatedSubtotal * 0.18); // 18% GST
    let shippingFee = 0;
    if (shippingMethod === 'express') {
      shippingFee = 249;
    } else {
      shippingFee = calculatedSubtotal >= 1999 ? 0 : 99;
    }

    const totalAmount = calculatedSubtotal + taxAmount + shippingFee;
    const totalAmountInPaise = Math.round(totalAmount * 100);

    // Generate unique Order Number
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `MX${Date.now().toString().slice(-4)}${randomSuffix}`;

    if (isCod) {
      // CASH ON DELIVERY (COD) ORDER
      const insertCodOrderQuery = `
        INSERT INTO orders (
          order_number, customer_name, customer_email, customer_phone,
          shipping_address_flat, shipping_address_street, shipping_address_area,
          shipping_address_city, shipping_address_state, shipping_address_pincode,
          shipping_address_country, shipping_method, payment_method,
          subtotal, tax_amount, shipping_fee, discount_amount, total_amount, 
          status, payment_status, inventory_deducted
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
        RETURNING id, order_number, created_at, status;
      `;

      const codOrderValues = [
        orderNumber, customer.fullName, customer.email, customer.mobile,
        address.flat, address.street, address.area || '',
        address.city, address.state, address.pincode, address.country || 'India',
        shippingMethod, 'cod',
        calculatedSubtotal, taxAmount, shippingFee, 0, totalAmount,
        'PROCESSING', 'PENDING_COD', true
      ];

      const orderRes = await client.query(insertCodOrderQuery, codOrderValues);
      const newOrder = orderRes.rows[0];

      // Insert Order Items & Decrement Inventory Stock
      for (const item of validatedItems) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, product_sku, unit_price, quantity, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [newOrder.id, item.productId, item.name, item.sku, item.unitPrice, item.quantity, item.subtotal]
        );

        await client.query(
          `UPDATE inventory SET stock_quantity = GREATEST(0, stock_quantity - $1), updated_at = CURRENT_TIMESTAMP WHERE product_id = $2`,
          [item.quantity, item.productId]
        );
      }

      await client.query('COMMIT');

      return res.status(201).json({
        success: true,
        isCod: true,
        message: 'COD Order placed successfully',
        data: {
          orderNumber: newOrder.order_number,
          customerName: customer.fullName,
          customerEmail: customer.email,
          totalAmount,
          status: newOrder.status,
          paymentStatus: 'PENDING_COD'
        }
      });

    } else {
      // ONLINE PAYMENT VIA RAZORPAY
      const rzpOrder = await createRazorpayOrder({
        amount: totalAmountInPaise,
        currency: 'INR',
        receipt: orderNumber,
        notes: {
          customerName: customer.fullName,
          customerEmail: customer.email
        }
      });

      const insertOnlineOrderQuery = `
        INSERT INTO orders (
          order_number, customer_name, customer_email, customer_phone,
          shipping_address_flat, shipping_address_street, shipping_address_area,
          shipping_address_city, shipping_address_state, shipping_address_pincode,
          shipping_address_country, shipping_method, payment_method,
          subtotal, tax_amount, shipping_fee, discount_amount, total_amount, 
          status, payment_status, razorpay_order_id, inventory_deducted
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22)
        RETURNING id, order_number, created_at, status;
      `;

      const onlineOrderValues = [
        orderNumber, customer.fullName, customer.email, customer.mobile,
        address.flat, address.street, address.area || '',
        address.city, address.state, address.pincode, address.country || 'India',
        shippingMethod, paymentMethod,
        calculatedSubtotal, taxAmount, shippingFee, 0, totalAmount,
        'PENDING_PAYMENT', 'PENDING', rzpOrder.id, false
      ];

      const orderRes = await client.query(insertOnlineOrderQuery, onlineOrderValues);
      const newOrder = orderRes.rows[0];

      // Insert Order Items (Stock will be decremented upon payment verification)
      for (const item of validatedItems) {
        await client.query(
          `INSERT INTO order_items (order_id, product_id, product_name, product_sku, unit_price, quantity, subtotal)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [newOrder.id, item.productId, item.name, item.sku, item.unitPrice, item.quantity, item.subtotal]
        );
      }

      await client.query('COMMIT');

      return res.status(201).json({
        success: true,
        isCod: false,
        message: 'Razorpay order created successfully',
        data: {
          razorpayOrderId: rzpOrder.id,
          orderNumber: newOrder.order_number,
          amount: totalAmountInPaise,
          amountInINR: totalAmount,
          currency: 'INR',
          keyId: key_id,
          customerName: customer.fullName,
          customerEmail: customer.email,
          customerPhone: customer.mobile
        }
      });
    }

  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to initialize checkout payment'
    });
  } finally {
    client.release();
  }
};

/**
 * Step 2: Verify Razorpay Payment Signature
 */
const verifyPayment = async (req, res, next) => {
  const { orderNumber, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

  if (!orderNumber || !razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return res.status(400).json({
      success: false,
      message: 'Missing required Razorpay payment verification parameters'
    });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const orderRes = await client.query(
      `SELECT * FROM orders WHERE order_number = $1 OR razorpay_order_id = $2`,
      [orderNumber, razorpay_order_id]
    );

    if (orderRes.rows.length === 0) {
      throw new Error(`Order #${orderNumber} not found in database`);
    }

    const order = orderRes.rows[0];

    // Idempotency Check: If already verified and paid
    if (order.payment_status === 'PAID') {
      await client.query('COMMIT');
      return res.status(200).json({
        success: true,
        message: 'Payment already verified and processed',
        data: {
          orderNumber: order.order_number,
          totalAmount: parseFloat(order.total_amount),
          status: order.status,
          paymentStatus: order.payment_status
        }
      });
    }

    // Verify HMAC SHA256 Signature
    const isValid = verifyRazorpaySignature({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    });

    if (!isValid) {
      // Mark payment as failed
      await client.query(
        `UPDATE orders SET payment_status = 'FAILED', updated_at = CURRENT_TIMESTAMP WHERE id = $1`,
        [order.id]
      );

      await client.query(
        `INSERT INTO payments (order_id, order_number, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, status, error_code, error_description)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [order.id, order.order_number, razorpay_order_id, razorpay_payment_id, razorpay_signature, order.total_amount, 'INR', 'FAILED', 'INVALID_SIGNATURE', 'HMAC signature mismatch']
      );

      await client.query('COMMIT');

      return res.status(400).json({
        success: false,
        message: 'Invalid payment signature. Verification failed.'
      });
    }

    // Signature Valid: Update Order Status & Decrement Stock Idempotently
    await client.query(
      `UPDATE orders SET 
        status = 'PROCESSING', 
        payment_status = 'PAID', 
        razorpay_payment_id = $1, 
        razorpay_signature = $2, 
        inventory_deducted = true,
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [razorpay_payment_id, razorpay_signature, order.id]
    );

    // If stock not previously deducted, deduct stock now
    if (!order.inventory_deducted) {
      const itemsRes = await client.query(
        `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
        [order.id]
      );

      for (const item of itemsRes.rows) {
        if (item.product_id) {
          await client.query(
            `UPDATE inventory SET stock_quantity = GREATEST(0, stock_quantity - $1), updated_at = CURRENT_TIMESTAMP WHERE product_id = $2`,
            [item.quantity, item.product_id]
          );
        }
      }
    }

    // Insert payment transaction log
    await client.query(
      `INSERT INTO payments (order_id, order_number, razorpay_order_id, razorpay_payment_id, razorpay_signature, amount, currency, status, method)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [order.id, order.order_number, razorpay_order_id, razorpay_payment_id, razorpay_signature, order.total_amount, 'INR', 'CAPTURED', order.payment_method]
    );

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Payment verified and order confirmed successfully',
      data: {
        orderNumber: order.order_number,
        totalAmount: parseFloat(order.total_amount),
        status: 'PROCESSING',
        paymentStatus: 'PAID'
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(400).json({
      success: false,
      message: err.message || 'Payment verification failed'
    });
  } finally {
    client.release();
  }
};

/**
 * Step 3: Razorpay Webhook Listener Callback
 */
const handleWebhook = async (req, res, next) => {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const bodyString = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);

    const isValid = verifyWebhookSignature(bodyString, signature);
    if (!isValid) {
      return res.status(400).json({ status: 'error', message: 'Invalid webhook signature' });
    }

    const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;

    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;
      const razorpayPaymentId = payment.id;

      const client = await pool.connect();
      try {
        await client.query('BEGIN');

        const orderRes = await client.query(
          `SELECT * FROM orders WHERE razorpay_order_id = $1`,
          [razorpayOrderId]
        );

        if (orderRes.rows.length > 0) {
          const order = orderRes.rows[0];
          if (order.payment_status !== 'PAID') {
            await client.query(
              `UPDATE orders SET status = 'PROCESSING', payment_status = 'PAID', razorpay_payment_id = $1, inventory_deducted = true WHERE id = $2`,
              [razorpayPaymentId, order.id]
            );

            if (!order.inventory_deducted) {
              const itemsRes = await client.query(
                `SELECT product_id, quantity FROM order_items WHERE order_id = $1`,
                [order.id]
              );
              for (const item of itemsRes.rows) {
                if (item.product_id) {
                  await client.query(
                    `UPDATE inventory SET stock_quantity = GREATEST(0, stock_quantity - $1) WHERE product_id = $2`,
                    [item.quantity, item.product_id]
                  );
                }
              }
            }
          }
        }
        await client.query('COMMIT');
      } catch (err) {
        await client.query('ROLLBACK');
      } finally {
        client.release();
      }
    } else if (event.event === 'payment.failed') {
      const payment = event.payload.payment.entity;
      const razorpayOrderId = payment.order_id;

      await pool.query(
        `UPDATE orders SET payment_status = 'FAILED', status = 'CANCELLED' WHERE razorpay_order_id = $1 AND payment_status != 'PAID'`,
        [razorpayOrderId]
      );
    }

    return res.status(200).json({ status: 'ok' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  handleWebhook
};
