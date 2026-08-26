const fs = require('fs');
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

async function initDb() {
  console.log('⚡ Initializing MOTORX PostgreSQL Database...');
  try {
    const schemaSql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf-8');
    const seedSql = fs.readFileSync(path.join(__dirname, 'seed.sql'), 'utf-8');

    console.log(' Applying schema.sql...');
    await pool.query(schemaSql);
    console.log('✓ Schema applied successfully.');

    console.log(' Applying seed.sql...');
    await pool.query(seedSql);
    console.log('✓ Seed data populated successfully.');

    const res = await pool.query('SELECT COUNT(*) FROM products;');
    console.log(`🚀 Database initialization complete. ${res.rows[0].count} products inserted.`);
  } catch (err) {
    console.error('❌ Database Initialization Failed:', err.message);
  } finally {
    await pool.end();
  }
}

initDb();
