const { pool } = require('../config/database');
const { validationResult } = require('express-validator');

/**
 * Helper function to calculate server-side order total from live PostgreSQL product pricing & stock
 */
const processCheckout = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { customer, address, items, shippingMethod = 'standard', paymentMethod = 'upi' } = req.body;

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      // Fetch product pricing directly from PostgreSQL
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

    // Server-side Tax & Shipping Math
    const taxAmount = Math.round(calculatedSubtotal * 0.18); // 18% GST
    let shippingFee = 0;
    if (shippingMethod === 'express') {
      shippingFee = 249;
    } else {
      shippingFee = calculatedSubtotal >= 1999 ? 0 : 99;
    }

    const totalAmount = calculatedSubtotal + taxAmount + shippingFee;

    // Generate unique Order Number: e.g., MX10842
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderNumber = `MX${Date.now().toString().slice(-4)}${randomSuffix}`;

    // Insert order record into database
    const insertOrderQuery = `
      INSERT INTO orders (
        order_number, customer_name, customer_email, customer_phone,
        shipping_address_flat, shipping_address_street, shipping_address_area,
        shipping_address_city, shipping_address_state, shipping_address_pincode,
        shipping_address_country, shipping_method, payment_method,
        subtotal, tax_amount, shipping_fee, discount_amount, total_amount, status
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING id, order_number, created_at, status;
    `;

    const orderValues = [
      orderNumber,
      customer.fullName,
      customer.email,
      customer.mobile,
      address.flat,
      address.street,
      address.area || '',
      address.city,
      address.state,
      address.pincode,
      address.country || 'India',
      shippingMethod,
      paymentMethod,
      calculatedSubtotal,
      taxAmount,
      shippingFee,
      0, // Discount
      totalAmount,
      'PROCESSING'
    ];

    const orderRes = await client.query(insertOrderQuery, orderValues);
    const newOrder = orderRes.rows[0];

    // Insert Order Items & Decrement Inventory Stock in PostgreSQL
    for (const item of validatedItems) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, product_name, product_sku, unit_price, quantity, subtotal)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [newOrder.id, item.productId, item.name, item.sku, item.unitPrice, item.quantity, item.subtotal]
      );

      // Decrement stock quantity
      await client.query(
        `UPDATE inventory SET stock_quantity = GREATEST(0, stock_quantity - $1), updated_at = CURRENT_TIMESTAMP WHERE product_id = $2`,
        [item.quantity, item.productId]
      );
    }

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        orderNumber: newOrder.order_number,
        customerName: customer.fullName,
        customerEmail: customer.email,
        subtotal: calculatedSubtotal,
        taxAmount,
        shippingFee,
        totalAmount,
        status: newOrder.status,
        createdAt: newOrder.created_at,
        itemsCount: validatedItems.length
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    return res.status(400).json({
      success: false,
      message: err.message || 'Failed to process checkout order'
    });
  } finally {
    client.release();
  }
};

/**
 * Get Order Details by Order Number for Order Tracking
 */
const getOrderByNumber = async (req, res, next) => {
  try {
    const { orderNumber } = req.params;

    const orderRes = await pool.query(
      `SELECT * FROM orders WHERE order_number = $1`,
      [orderNumber]
    );

    if (orderRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Order #${orderNumber} not found`
      });
    }

    const order = orderRes.rows[0];

    const itemsRes = await pool.query(
      `SELECT oi.*, pi.image_url 
       FROM order_items oi 
       LEFT JOIN product_images pi ON (pi.product_id = oi.product_id AND pi.is_primary = true) 
       WHERE oi.order_id = $1`,
      [order.id]
    );

    return res.status(200).json({
      success: true,
      data: {
        id: order.id,
        orderNumber: order.order_number,
        customerName: order.customer_name,
        customerEmail: order.customer_email,
        customerPhone: order.customer_phone,
        shippingAddress: {
          flat: order.shipping_address_flat,
          street: order.shipping_address_street,
          area: order.shipping_address_area,
          city: order.shipping_address_city,
          state: order.shipping_address_state,
          pincode: order.shipping_address_pincode,
          country: order.shipping_address_country
        },
        shippingMethod: order.shipping_method,
        paymentMethod: order.payment_method,
        subtotal: parseFloat(order.subtotal),
        taxAmount: parseFloat(order.tax_amount),
        shippingFee: parseFloat(order.shipping_fee),
        totalAmount: parseFloat(order.total_amount),
        status: order.status,
        createdAt: order.created_at,
        items: itemsRes.rows.map(item => ({
          id: item.id,
          productId: item.product_id,
          name: item.product_name,
          sku: item.product_sku,
          unitPrice: parseFloat(item.unit_price),
          quantity: item.quantity,
          subtotal: parseFloat(item.subtotal),
          image: item.image_url || ''
        }))
      }
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  processCheckout,
  getOrderByNumber
};
