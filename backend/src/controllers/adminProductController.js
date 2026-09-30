const { pool } = require('../config/database');

/**
 * Get all products for Admin management
 */
const getAdminProducts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (search) {
      params.push(`%${search.trim().toLowerCase()}%`);
      whereClause += ` AND (LOWER(p.name) LIKE $${params.length} OR LOWER(p.sku) LIKE $${params.length})`;
    }

    const countRes = await pool.query(
      `SELECT COUNT(*) FROM products p ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0].count);

    const queryParams = [...params, parseInt(limit), offset];
    const productsRes = await pool.query(
      `SELECT 
        p.*,
        c.name AS category_name, c.slug AS category_slug,
        b.name AS brand_name, b.slug AS brand_slug,
        pi.image_url AS primary_image,
        inv.stock_quantity, inv.low_stock_threshold
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN inventory inv ON inv.product_id = p.id
       LEFT JOIN product_images pi ON (pi.product_id = p.id AND pi.is_primary = true)
       ${whereClause}
       ORDER BY p.id DESC
       LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
      queryParams
    );

    return res.status(200).json({
      success: true,
      data: productsRes.rows.map(row => ({
        id: row.id,
        sku: row.sku,
        name: row.name,
        slug: row.slug,
        description: row.description,
        price: parseFloat(row.price || 0),
        salePrice: row.sale_price ? parseFloat(row.sale_price) : null,
        category: row.category_name || 'General Composites',
        categoryId: row.category_id,
        brand: row.brand_name || 'Seval Drones Composites',
        brandId: row.brand_id,
        rating: parseFloat(row.rating || 0),
        reviewCount: row.review_count,
        status: row.status,
        featured: row.featured,
        popularity: row.popularity,
        image: row.primary_image || '',
        stock: row.stock_quantity !== null ? row.stock_quantity : 0,
        lowStockThreshold: row.low_stock_threshold || 5,
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
 * Helper to get or create Category on the fly
 */
async function resolveOrCreateCategory(client, categoryId, newCategoryName) {
  if (newCategoryName && newCategoryName.trim()) {
    const cleanName = newCategoryName.trim();
    const existing = await client.query('SELECT id FROM categories WHERE LOWER(name) = LOWER($1)', [cleanName]);
    if (existing.rows.length > 0) {
      return existing.rows[0].id;
    }
    const cleanSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const insertRes = await client.query(
      `INSERT INTO categories (name, slug, description, image, is_active)
       VALUES ($1, $2, $3, '/products/cured_products/Carbon_Fiber_Sheet.jpeg', true)
       RETURNING id`,
      [cleanName, cleanSlug || `cat-${Date.now()}`, `High performance ${cleanName} materials`]
    );
    return insertRes.rows[0].id;
  }
  return categoryId ? parseInt(categoryId) : null;
}

/**
 * Helper to get or create Brand on the fly
 */
async function resolveOrCreateBrand(client, brandId, newBrandName) {
  if (newBrandName && newBrandName.trim()) {
    const cleanName = newBrandName.trim();
    const existing = await client.query('SELECT id FROM brands WHERE LOWER(name) = LOWER($1)', [cleanName]);
    if (existing.rows.length > 0) {
      return existing.rows[0].id;
    }
    const cleanSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const insertRes = await client.query(
      `INSERT INTO brands (name, slug, description, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING id`,
      [cleanName, cleanSlug || `brand-${Date.now()}`, `${cleanName} composite manufacturer`]
    );
    return insertRes.rows[0].id;
  }
  return brandId ? parseInt(brandId) : null;
}

/**
 * Create a new Product (with auto-create category & brand support)
 */
const createAdminProduct = async (req, res, next) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const {
      name, sku, slug, description, categoryId, newCategoryName,
      brandId, newBrandName,
      price, salePrice, status = 'IN_STOCK', featured = false,
      image, stock = 10, specifications = {}
    } = req.body;

    const finalCategoryId = await resolveOrCreateCategory(client, categoryId, newCategoryName);
    const finalBrandId = await resolveOrCreateBrand(client, brandId, newBrandName);

    const generatedSlug = slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    const generatedSku = sku || `MX-${Date.now().toString().slice(-6)}`;

    const productRes = await client.query(
      `INSERT INTO products (
        sku, name, slug, description, category_id, brand_id,
        price, sale_price, status, featured
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      RETURNING *`,
      [
        generatedSku, name, generatedSlug, description || '',
        finalCategoryId, finalBrandId,
        price, salePrice || null, status, featured
      ]
    );

    const newProduct = productRes.rows[0];

    // Image
    if (image) {
      await client.query(
        `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
         VALUES ($1, $2, $3, 1, true)`,
        [newProduct.id, image, name]
      );
    }

    // Inventory
    await client.query(
      `INSERT INTO inventory (product_id, stock_quantity, low_stock_threshold)
       VALUES ($1, $2, 5)`,
      [newProduct.id, parseInt(stock) || 0]
    );

    // Specifications Key-Value Insert
    if (specifications && typeof specifications === 'object') {
      const keys = Object.keys(specifications);
      for (let i = 0; i < keys.length; i++) {
        const specName = keys[i];
        const specVal = specifications[specName];
        if (specName && specVal) {
          await client.query(
            `INSERT INTO product_specifications (product_id, spec_name, spec_value, sort_order)
             VALUES ($1, $2, $3, $4)`,
            [newProduct.id, specName, String(specVal), i + 1]
          );
        }
      }
    }

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: newProduct
    });

  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * Update existing Product (with auto-create category & brand support)
 */
const updateAdminProduct = async (req, res, next) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const {
      name, price, salePrice, status, featured, stock, image,
      categoryId, newCategoryName, brandId, newBrandName
    } = req.body;

    await client.query('BEGIN');

    const finalCategoryId = newCategoryName ? await resolveOrCreateCategory(client, null, newCategoryName) : (categoryId !== undefined ? (categoryId === '' ? null : parseInt(categoryId)) : undefined);
    const finalBrandId = newBrandName ? await resolveOrCreateBrand(client, null, newBrandName) : (brandId !== undefined ? (brandId === '' ? null : parseInt(brandId)) : undefined);

    const updateRes = await client.query(
      `UPDATE products SET
        name = COALESCE($1, name),
        price = COALESCE($2, price),
        sale_price = $3,
        status = COALESCE($4, status),
        featured = COALESCE($5, featured),
        category_id = COALESCE($6, category_id),
        brand_id = COALESCE($7, brand_id),
        updated_at = CURRENT_TIMESTAMP
       WHERE id = $8
       RETURNING *`,
      [
        name,
        price,
        salePrice !== undefined ? (salePrice === '' ? null : salePrice) : null,
        status,
        featured,
        finalCategoryId !== undefined ? finalCategoryId : null,
        finalBrandId !== undefined ? finalBrandId : null,
        id
      ]
    );

    if (updateRes.rows.length === 0) {
      throw new Error(`Product #${id} not found`);
    }

    // Update Stock
    if (stock !== undefined) {
      await client.query(
        `UPDATE inventory SET stock_quantity = $1, updated_at = CURRENT_TIMESTAMP WHERE product_id = $2`,
        [parseInt(stock), id]
      );
    }

    // Update Image
    if (image) {
      const imgCheck = await client.query(
        `SELECT id FROM product_images WHERE product_id = $1 AND is_primary = true`,
        [id]
      );
      if (imgCheck.rows.length > 0) {
        await client.query(
          `UPDATE product_images SET image_url = $1 WHERE product_id = $2 AND is_primary = true`,
          [image, id]
        );
      } else {
        await client.query(
          `INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary)
           VALUES ($1, $2, $3, 1, true)`,
          [id, image, name || 'Product Image']
        );
      }
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'Product updated successfully',
      data: updateRes.rows[0]
    });

  } catch (err) {
    await client.query('ROLLBACK');
    next(err);
  } finally {
    client.release();
  }
};

/**
 * Delete Product
 */
const deleteAdminProduct = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deleteRes = await pool.query(`DELETE FROM products WHERE id = $1 RETURNING id`, [id]);

    if (deleteRes.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    return res.status(200).json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (err) {
    next(err);
  }
};

/**
 * Standalone Create Category
 */
const createAdminCategory = async (req, res, next) => {
  try {
    const { name, description, image } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }
    const cleanName = name.trim();
    const cleanSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Check if exists
    const existing = await pool.query('SELECT * FROM categories WHERE LOWER(name) = LOWER($1)', [cleanName]);
    if (existing.rows.length > 0) {
      return res.status(200).json({ success: true, message: 'Category already exists', data: existing.rows[0] });
    }

    const insertRes = await pool.query(
      `INSERT INTO categories (name, slug, description, image, is_active)
       VALUES ($1, $2, $3, $4, true)
       RETURNING *`,
      [cleanName, cleanSlug || `cat-${Date.now()}`, description || `High quality ${cleanName}`, image || '/products/cured_products/Carbon_Fiber_Sheet.jpeg']
    );

    return res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: insertRes.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Standalone Create Brand
 */
const createAdminBrand = async (req, res, next) => {
  try {
    const { name, description } = req.body;
    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Brand name is required' });
    }
    const cleanName = name.trim();
    const cleanSlug = cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const existing = await pool.query('SELECT * FROM brands WHERE LOWER(name) = LOWER($1)', [cleanName]);
    if (existing.rows.length > 0) {
      return res.status(200).json({ success: true, message: 'Brand already exists', data: existing.rows[0] });
    }

    const insertRes = await pool.query(
      `INSERT INTO brands (name, slug, description, is_active)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [cleanName, cleanSlug || `brand-${Date.now()}`, description || `${cleanName} composite manufacturer`]
    );

    return res.status(201).json({
      success: true,
      message: 'Brand created successfully',
      data: insertRes.rows[0]
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getAdminProducts,
  createAdminProduct,
  updateAdminProduct,
  deleteAdminProduct,
  createAdminCategory,
  createAdminBrand
};
