const db = require('../config/database');

/**
 * @route   GET /api/brands
 * @desc    Get all active brands
 * @access  Public
 */
async function getBrands(req, res, next) {
  try {
    const query = `
      SELECT b.*, COUNT(p.id)::int AS product_count
      FROM brands b
      LEFT JOIN products p ON p.brand_id = b.id
      WHERE b.is_active = true
      GROUP BY b.id
      ORDER BY b.name ASC;
    `;
    const result = await db.query(query);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        count: row.product_count
      }))
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getBrands,
};
