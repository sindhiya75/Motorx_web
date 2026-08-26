const { pool } = require('../config/database');

/**
 * Get Inventory Stock Levels for Admin
 */
const getAdminInventory = async (req, res, next) => {
  try {
    const { lowStockOnly = false } = req.query;

    let whereClause = '';
    if (lowStockOnly === 'true' || lowStockOnly === true) {
      whereClause = 'WHERE inv.stock_quantity <= inv.low_stock_threshold OR p.status = \'OUT_OF_STOCK\' OR p.status = \'LOW_STOCK\'';
    }

    const inventoryRes = await pool.query(
      `SELECT 
        inv.*,
        p.name AS product_name, p.sku AS product_sku, p.slug AS product_slug, p.status AS product_status,
        c.name AS category_name, b.name AS brand_name,
        pi.image_url AS primary_image
       FROM inventory inv
       JOIN products p ON inv.product_id = p.id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN product_images pi ON (pi.product_id = p.id AND pi.is_primary = true)
       ${whereClause}
       ORDER BY inv.stock_quantity ASC`
    );

    return res.status(200).json({
      success: true,
      data: inventoryRes.rows.map(row => ({
        id: row.id,
        productId: row.product_id,
        productName: row.product_name,
        productSku: row.product_sku,
        productSlug: row.product_slug,
        productStatus: row.product_status,
        category: row.category_name,
        brand: row.brand_name,
        image: row.primary_image || '',
        stockQuantity: row.stock_quantity,
        lowStockThreshold: row.low_stock_threshold,
        reservedQuantity: row.reserved_quantity,
        updatedAt: row.updated_at
      }))
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Update Product Stock Quantity
 */
const updateAdminStock = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { stockQuantity, lowStockThreshold } = req.body;

    if (stockQuantity === undefined || parseInt(stockQuantity) < 0) {
      return res.status(400).json({ success: false, message: 'Valid non-negative stock quantity is required' });
    }

    const qty = parseInt(stockQuantity);
    const threshold = lowStockThreshold !== undefined ? parseInt(lowStockThreshold) : 5;

    // Update inventory
    const invRes = await pool.query(
      `UPDATE inventory 
       SET stock_quantity = $1, low_stock_threshold = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE product_id = $3 
       RETURNING *`,
      [qty, threshold, productId]
    );

    if (invRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: `Inventory record for product #${productId} not found` });
    }

    // Auto update product status badge based on stock quantity
    let newStatus = 'IN_STOCK';
    if (qty === 0) {
      newStatus = 'OUT_OF_STOCK';
    } else if (qty <= threshold) {
      newStatus = 'LOW_STOCK';
    }

    await pool.query(
      `UPDATE products SET status = $1 WHERE id = $2 AND status NOT IN ('PRICE_ON_REQUEST', 'COMING_SOON')`,
      [newStatus, productId]
    );

    return res.status(200).json({
      success: true,
      message: 'Inventory stock updated successfully',
      data: invRes.rows[0]
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminInventory,
  updateAdminStock
};
