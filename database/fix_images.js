const path = require('path');
let Pool, dotenv;
try {
  Pool = require('pg').Pool;
  dotenv = require('dotenv');
} catch (e) {
  Pool = require(path.join(__dirname, '../backend/node_modules/pg')).Pool;
  dotenv = require(path.join(__dirname, '../backend/node_modules/dotenv'));
}

dotenv.config({ path: path.join(__dirname, '../backend/.env') });

const poolConfig = process.env.DATABASE_URL
  ? { connectionString: process.env.DATABASE_URL }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      database: process.env.PGDATABASE || 'motorx',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || 'postgres',
    };

const pool = new Pool(poolConfig);

const categoryImages = [
  { slug: 'moulds-patterns', image: '/products/moulds_patterns/Epoxy_Tooling_Board.jpeg' },
  { slug: 'core-materials', image: '/products/core_materials/Aluminum_Honeycomb_Core.jpeg' },
  { slug: 'pultruded-products', image: '/products/pultruded_products/Carbon_Fiber_Rod.jpeg' },
  { slug: 'cured-products', image: '/products/cured_products/Carbon_Fiber_Sheet.jpeg' },
  { slug: 'vacuum-bagging-consumables', image: '/products/vaccum_bagging/Vacuum_Bagging_Film.jpeg' }
];

const productImages = [
  { id: 1, image: '/products/moulds_patterns/Epoxy_Tooling_Board.jpeg' },
  { id: 2, image: '/products/moulds_patterns/PU_Tooling_Board.jpeg' },
  { id: 3, image: '/products/Epoxy_Resin/Epoxy_Gel_Coat.jpeg' },
  { id: 4, image: '/products/moulds_patterns/PTFE_Coated_Fibreglass_with_Silicone_Adhesive.jpeg' },
  { id: 5, image: '/products/moulds_patterns/High_Temp_PU_Tooling_Board.jpeg' },
  { id: 6, image: '/products/core_materials/PVC_Foam_Core.jpeg' },
  { id: 7, image: '/products/core_materials/PMI_Foam_Cores.jpeg' },
  { id: 8, image: '/products/core_materials/PET_Foam_Core.jpeg' },
  { id: 9, image: '/products/core_materials/Nomex_Honeycomb_Core.jpeg' },
  { id: 10, image: '/products/core_materials/Sandwich_Panels.jpeg' },
  { id: 11, image: '/products/pultruded_products/Carbon_Fiber_Rod.jpeg' },
  { id: 12, image: '/products/pultruded_products/Rectangle_Shaped_Pultruded_Carbon_Fiber_Tube.jpeg' },
  { id: 13, image: '/products/pultruded_products/Pultruded_Fiber_Glass_Rod.jpeg' },
  { id: 14, image: '/products/pultruded_products/Pultruded_Carbon_Fiber_Strip.jpeg' },
  { id: 15, image: '/products/cured_products/Carbon_Fiber_Angles.jpeg' },
  { id: 16, image: '/products/cured_products/Carbon_Fiber_Sheet.jpeg' },
  { id: 17, image: '/products/cured_products/Forged_Carbon_Fiber_Plates.jpeg' },
  { id: 18, image: '/products/cured_products/G10_Laminates.jpeg' },
  { id: 19, image: '/products/cured_products/Sandwich_Panels.jpeg' },
  { id: 20, image: '/products/cured_products/UD_Carbon_Fiber_Strips_for_High_End_Application.jpeg' },
  { id: 21, image: '/products/vaccum_bagging/Vacuum_Bagging_Film.jpeg' },
  { id: 22, image: '/products/vaccum_bagging/Heat_Shrink_Tape.jpeg' },
  { id: 23, image: '/products/vaccum_bagging/Peel_Ply.jpeg' },
  { id: 24, image: '/products/vaccum_bagging/Breather_Cloth.jpeg' },
  { id: 25, image: '/products/vaccum_bagging/Vacuum_Sealing_Tape.jpeg' }
];

async function fixImages() {
  console.log('🔄 Safely updating image URLs in database...');
  try {
    for (const cat of categoryImages) {
      await pool.query('UPDATE categories SET image = $1 WHERE slug = $2', [cat.image, cat.slug]);
    }
    console.log('✓ Categories updated.');

    for (const p of productImages) {
      const res = await pool.query(
        'UPDATE product_images SET image_url = $1 WHERE product_id = $2 AND is_primary = true',
        [p.image, p.id]
      );
      if (res.rowCount === 0) {
        await pool.query(
          'INSERT INTO product_images (product_id, image_url, alt_text, sort_order, is_primary) VALUES ($1, $2, $3, 1, true)',
          [p.id, p.image, `Product ${p.id}`]
        );
      }
    }
    console.log('✓ Product images updated in PostgreSQL without resetting any data.');
  } catch (err) {
    console.warn('ℹ️ Database update skipped (PostgreSQL service not currently connected):', err.message);
  } finally {
    await pool.end();
  }
}

fixImages();
