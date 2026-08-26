const db = require('../config/database');

/**
 * @route   GET /api/categories
 * @desc    Get all active categories
 * @access  Public
 */
async function getCategories(req, res, next) {
  try {
    const query = `
      SELECT c.*, COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      WHERE c.is_active = true
      GROUP BY c.id
      ORDER BY c.id ASC;
    `;
    const result = await db.query(query);

    res.json({
      success: true,
      data: result.rows.map(row => ({
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        image: row.image,
        count: row.product_count,
        isActive: row.is_active
      }))
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/categories/:slug
 * @desc    Get single category by slug
 * @access  Public
 */
async function getCategoryBySlug(req, res, next) {
  try {
    const { slug } = req.params;
    const query = `
      SELECT c.*, COUNT(p.id)::int AS product_count
      FROM categories c
      LEFT JOIN products p ON p.category_id = c.id
      WHERE c.slug = $1 AND c.is_active = true
      GROUP BY c.id;
    `;
    const result = await db.query(query, [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Category with slug '${slug}' not found`
      });
    }

    const row = result.rows[0];
    res.json({
      success: true,
      data: {
        id: row.id,
        name: row.name,
        slug: row.slug,
        description: row.description,
        image: row.image,
        count: row.product_count
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getCategories,
  getCategoryBySlug,
};
