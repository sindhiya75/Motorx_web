const { pool } = require('../config/database');

/**
 * Get Aggregate Store Analytics Summary for Admin Dashboard
 */
const getAdminAnalyticsSummary = async (req, res, next) => {
  try {
    const [revenueRes, ordersRes, productsRes, lowStockRes] = await Promise.all([
      pool.query(`SELECT COALESCE(SUM(total_amount), 0) AS total_revenue FROM orders WHERE status != 'CANCELLED'`),
      pool.query(`SELECT COUNT(*) AS total_orders, COUNT(CASE WHEN status = 'PROCESSING' THEN 1 END) AS pending_orders FROM orders`),
      pool.query(`SELECT COUNT(*) AS total_products FROM products`),
      pool.query(`SELECT COUNT(*) AS low_stock_count FROM inventory WHERE stock_quantity <= low_stock_threshold`)
    ]);

    const totalRevenue = parseFloat(revenueRes.rows[0].total_revenue || 0);
    const totalOrders = parseInt(ordersRes.rows[0].total_orders || 0);
    const pendingOrders = parseInt(ordersRes.rows[0].pending_orders || 0);
    const totalProducts = parseInt(productsRes.rows[0].total_products || 0);
    const lowStockCount = parseInt(lowStockRes.rows[0].low_stock_count || 0);

    return res.status(200).json({
      success: true,
      data: {
        totalRevenue,
        totalOrders,
        pendingOrders,
        totalProducts,
        lowStockCount
      }
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminAnalyticsSummary
};
