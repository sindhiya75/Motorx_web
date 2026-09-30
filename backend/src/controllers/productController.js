const db = require('../config/database');

/**
 * Helper to build product object format matching frontend Expectations
 */
function formatProductRow(row) {
  const price = row.price ? Number(row.price) : null;
  const salePrice = row.sale_price ? Number(row.sale_price) : null;

  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    slug: row.slug,
    brand: row.brand_name || 'Seval Drones Composites',
    brandSlug: row.brand_slug,
    category: row.category_name || 'General Composites',
    categorySlug: row.category_slug,
    price,
    salePrice,
    currency: row.currency || 'INR',
    gstRate: Number(row.gst_rate || 0.18),
    gstIncluded: row.gst_included || false,
    rating: Number(row.rating || 0.0),
    reviewCount: row.review_count || 0,
    stock: row.stock_quantity || 0,
    status: row.status || 'IN_STOCK',
    featured: row.featured || false,
    popularity: row.popularity || 0,
    image: row.primary_image || '/products/cured_products/Carbon_Fiber_Sheet.jpeg',
    createdAt: row.created_at
  };
}

/**
 * @route   GET /api/products
 * @desc    Get paginated, filtered, searched and sorted products
 * @access  Public
 */
async function getProducts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit || '12', 10)));
    const offset = (page - 1) * limit;

    const {
      category,
      brand,
      minPrice,
      maxPrice,
      status,
      rating,
      featured,
      search,
      sort
    } = req.query;

    const whereConditions = [];
    const queryParams = [];
    let paramIndex = 1;

    // Join clauses
    let joins = `
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN inventory inv ON inv.product_id = p.id
      LEFT JOIN product_images pi ON (pi.product_id = p.id AND pi.is_primary = true)
    `;

    // Category Filter
    if (category && category !== 'All Products' && category !== 'All Motors') {
      whereConditions.push(`(c.slug = $${paramIndex} OR LOWER(c.name) = LOWER($${paramIndex}))`);
      queryParams.push(category);
      paramIndex++;
    }

    // Brand Filter
    if (brand) {
      whereConditions.push(`(b.slug = $${paramIndex} OR LOWER(b.name) = LOWER($${paramIndex}))`);
      queryParams.push(brand);
      paramIndex++;
    }

    // Min Price
    if (minPrice && !isNaN(Number(minPrice))) {
      whereConditions.push(`COALESCE(p.sale_price, p.price) >= $${paramIndex}`);
      queryParams.push(Number(minPrice));
      paramIndex++;
    }

    // Max Price
    if (maxPrice && !isNaN(Number(maxPrice))) {
      whereConditions.push(`COALESCE(p.sale_price, p.price) <= $${paramIndex}`);
      queryParams.push(Number(maxPrice));
      paramIndex++;
    }

    // Status Filter
    if (status) {
      whereConditions.push(`p.status = $${paramIndex}`);
      queryParams.push(status);
      paramIndex++;
    }

    // Featured Filter
    if (featured === 'true' || featured === true) {
      whereConditions.push(`p.featured = true`);
    }

    // Min Rating Filter
    if (rating && !isNaN(Number(rating))) {
      whereConditions.push(`p.rating >= $${paramIndex}`);
      queryParams.push(Number(rating));
      paramIndex++;
    }

    // Search Query
    if (search && search.trim() !== '') {
      const q = `%${search.trim().toLowerCase()}%`;
      whereConditions.push(`(
        LOWER(p.name) LIKE $${paramIndex} OR
        LOWER(p.sku) LIKE $${paramIndex} OR
        LOWER(COALESCE(b.name, '')) LIKE $${paramIndex} OR
        LOWER(COALESCE(c.name, '')) LIKE $${paramIndex} OR
        LOWER(COALESCE(p.description, '')) LIKE $${paramIndex}
      )`);
      queryParams.push(q);
      paramIndex++;
    }

    const whereClause = whereConditions.length > 0 ? `WHERE ${whereConditions.join(' AND ')}` : '';

    // Safe Sort Whitelist
    let orderByClause = 'ORDER BY p.featured DESC, p.popularity DESC, p.id DESC';
    if (sort) {
      switch (sort) {
        case 'popularity':
          orderByClause = 'ORDER BY p.popularity DESC';
          break;
        case 'newest':
          orderByClause = 'ORDER BY p.created_at DESC';
          break;
        case 'price_asc':
        case 'price-low':
          orderByClause = 'ORDER BY COALESCE(p.sale_price, p.price, 999999) ASC';
          break;
        case 'price_desc':
        case 'price-high':
          orderByClause = 'ORDER BY COALESCE(p.sale_price, p.price, 0) DESC';
          break;
        case 'rating':
          orderByClause = 'ORDER BY p.rating DESC';
          break;
        case 'discount':
          orderByClause = 'ORDER BY (COALESCE(p.price, 0) - COALESCE(p.sale_price, p.price, 0)) DESC';
          break;
        case 'featured':
        default:
          orderByClause = 'ORDER BY p.featured DESC, p.popularity DESC';
          break;
      }
    }

    // 1. Get Count
    const countQuery = `SELECT COUNT(DISTINCT p.id)::int AS total FROM products p ${joins} ${whereClause};`;
    const countResult = await db.query(countQuery, queryParams);
    const total = countResult.rows[0]?.total || 0;
    const totalPages = Math.ceil(total / limit) || 1;

    // 2. Get Paginated Data
    const dataQuery = `
      SELECT 
        p.*,
        c.name AS category_name, c.slug AS category_slug,
        b.name AS brand_name, b.slug AS brand_slug,
        pi.image_url AS primary_image,
        inv.stock_quantity
      FROM products p
      ${joins}
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramIndex} OFFSET $${paramIndex + 1};
    `;

    const dataParams = [...queryParams, limit, offset];
    const dataResult = await db.query(dataQuery, dataParams);

    res.json({
      success: true,
      data: dataResult.rows.map(formatProductRow),
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * @route   GET /api/products/:slug
 * @desc    Get complete product details by slug (includes images, dynamic specs, inventory)
 * @access  Public
 */
async function getProductBySlug(req, res, next) {
  try {
    const { slug } = req.params;

    const isNumericId = !isNaN(Number(slug)) && Number.isInteger(Number(slug));
    
    // Fetch base product info
    const productQuery = `
      SELECT 
        p.*,
        c.name AS category_name, c.slug AS category_slug,
        b.name AS brand_name, b.slug AS brand_slug,
        inv.stock_quantity, inv.low_stock_threshold, inv.reserved_quantity
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN inventory inv ON inv.product_id = p.id
      WHERE p.slug = $1 ${isNumericId ? 'OR p.id = $2' : ''};
    `;
    const queryParams = isNumericId ? [slug, parseInt(slug, 10)] : [slug];
    const productResult = await db.query(productQuery, queryParams);


    if (productResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: `Product with slug '${slug}' not found`,
      });
    }

    const row = productResult.rows[0];

    // Fetch images
    const imagesQuery = `
      SELECT image_url, alt_text, is_primary 
      FROM product_images 
      WHERE product_id = $1 
      ORDER BY sort_order ASC, id ASC;
    `;
    const imagesResult = await db.query(imagesQuery, [row.id]);
    const images = imagesResult.rows.map(i => i.image_url);

    // Fetch dynamic specifications (Key-Value)
    const specsQuery = `
      SELECT spec_name, spec_value
      FROM product_specifications 
      WHERE product_id = $1
      ORDER BY sort_order ASC, id ASC;
    `;
    const specsResult = await db.query(specsQuery, [row.id]);
    
    const specifications = {};
    if (specsResult.rows.length > 0) {
      specsResult.rows.forEach(s => {
        specifications[s.spec_name] = s.spec_value;
      });
    } else {
      specifications["Product Code"] = row.sku;
      specifications["Quality Grade"] = "Industrial Composite Grade";
      specifications["Availability"] = row.status;
    }

    res.json({
      success: true,
      data: {
        id: row.id,
        sku: row.sku,
        name: row.name,
        slug: row.slug,
        brand: row.brand_name || 'Seval Drones Composites',
        brandSlug: row.brand_slug,
        category: row.category_name || 'General Composites',
        categorySlug: row.category_slug,
        price: row.price ? Number(row.price) : null,
        salePrice: row.sale_price ? Number(row.sale_price) : null,
        currency: row.currency || 'INR',
        gstRate: Number(row.gst_rate || 0.18),
        gstIncluded: row.gst_included || false,
        rating: Number(row.rating || 0.0),
        reviewCount: row.review_count || 0,
        stock: row.stock_quantity || 0,
        status: row.status || 'IN_STOCK',
        image: images[0] || '/products/cured_products/Carbon_Fiber_Sheet.jpeg',
        images: images.length > 0 ? images : ['/products/cured_products/Carbon_Fiber_Sheet.jpeg'],
        description: row.description,
        specifications,
        applications: ["Aerospace & Defense", "Automotive Composite Tooling", "Marine & Wind Energy Structure"],
        packageContents: [`1x ${row.name}`, "Quality Inspection Certificate", "Material Safety Data Sheet (MSDS)"],
        featured: row.featured,
        popularity: row.popularity,
        createdAt: row.created_at
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getProducts,
  getProductBySlug,
};
