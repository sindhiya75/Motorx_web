const { pool } = require('../config/database');

/**
 * Get list of all orders for Admin management
 */
const getAdminOrders = async (req, res, next) => {
  try {
    const { page = 1, limit = 15, status = '', search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (status) {
      params.push(status.toUpperCase());
      whereClause += ` AND o.status = $${params.length}`;
    }

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      whereClause += ` AND (LOWER(o.order_number) LIKE $${params.length} OR LOWER(o.customer_email) LIKE $${params.length} OR LOWER(o.customer_name) LIKE $${params.length})`;
    }

    const countRes = await pool.query(`SELECT COUNT(*) FROM orders o ${whereClause}`, params);
    const total = parseInt(countRes.rows[0].count);

    const queryParams = [...params, parseInt(limit), offset];
    const ordersRes = await pool.query(
      `SELECT o.*, COUNT(oi.id)::int AS items_count
       FROM orders o
       LEFT JOIN order_items oi ON oi.order_id = o.id
       ${whereClause}
       GROUP BY o.id
       ORDER BY o.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      queryParams
    );

    return res.status(200).json({
      success: true,
      data: ordersRes.rows.map(row => ({
        id: row.id,
        orderNumber: row.order_number,
        customerName: row.customer_name,
        customerEmail: row.customer_email,
        customerPhone: row.customer_phone,
        city: row.shipping_address_city,
        state: row.shipping_address_state,
        shippingMethod: row.shipping_method,
        paymentMethod: row.payment_method,
        subtotal: parseFloat(row.subtotal),
        taxAmount: parseFloat(row.tax_amount),
        shippingFee: parseFloat(row.shipping_fee),
        totalAmount: parseFloat(row.total_amount),
        status: row.status,
        paymentStatus: row.payment_status,
        itemsCount: row.items_count,
        createdAt: row.created_at
      })),
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)) || 1
      }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Get detailed Order information by ID for Admin
 */
const getAdminOrderDetails = async (req, res, next) => {
  try {
    const { id } = req.params;

    const orderRes = await pool.query(`SELECT * FROM orders WHERE id = $1`, [id]);
    if (orderRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Order #${id} not found` });
    }

    const order = orderRes.rows[0];

    const itemsRes = await pool.query(
      `SELECT oi.*, pi.image_url 
       FROM order_items oi 
       LEFT JOIN product_images pi ON (pi.product_id = oi.product_id AND pi.is_primary = true) 
       WHERE oi.order_id = $1`,
      [id]
    );

    const paymentsRes = await pool.query(`SELECT * FROM payments WHERE order_id = $1 ORDER BY id DESC`, [id]);

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
        paymentStatus: order.payment_status,
        razorpayOrderId: order.razorpay_order_id,
        razorpayPaymentId: order.razorpay_payment_id,
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
        })),
        payments: paymentsRes.rows
      }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Update Order Fulfillment Status (PROCESSING, SHIPPED, DELIVERED, CANCELLED)
 */
const updateAdminOrderStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['PENDING_PAYMENT', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid order status. Must be one of: ${validStatuses.join(', ')}`
      });
    }

    const updateRes = await pool.query(
      `UPDATE orders SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (updateRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Order #${id} not found` });
    }

    return res.status(200).json({
      success: true,
      message: `Order #${updateRes.rows[0].order_number} status updated to ${status}`,
      data: updateRes.rows[0]
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Get aggregated Customer list for Admin from Orders
 */
const getAdminCustomers = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        customer_email,
        customer_name,
        customer_phone,
        shipping_address_city AS city,
        shipping_address_state AS state,
        COUNT(id)::int AS total_orders,
        SUM(total_amount)::float AS total_spent,
        MAX(created_at) AS last_order_date
      FROM orders
      GROUP BY customer_email, customer_name, customer_phone, shipping_address_city, shipping_address_state
      ORDER BY last_order_date DESC;
    `;
    const result = await pool.query(query);

    return res.status(200).json({
      success: true,
      data: result.rows.map(row => ({
        email: row.customer_email,
        name: row.customer_name,
        phone: row.customer_phone,
        city: row.city,
        state: row.state,
        totalOrders: row.total_orders,
        totalSpent: parseFloat(row.total_spent || 0),
        lastOrderDate: row.last_order_date
      }))
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminOrders,
  getAdminOrderDetails,
  updateAdminOrderStatus,
  getAdminCustomers
};

