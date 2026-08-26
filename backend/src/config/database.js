const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const poolConfig = process.env.DATABASE_URL
  ? {
      connectionString: process.env.DATABASE_URL,
    }
  : {
      host: process.env.PGHOST || 'localhost',
      port: parseInt(process.env.PGPORT || '5432', 10),
      database: process.env.PGDATABASE || 'motorx',
      user: process.env.PGUSER || 'postgres',
      password: process.env.PGPASSWORD || '',
    };

const pool = new Pool(poolConfig);

/**
 * Executes a SQL query using pool
 */
const query = (text, params) => pool.query(text, params);

/**
 * Tests database connectivity
 * Returns { connected: boolean, error?: string }
 */
const testConnection = async () => {
  try {
    const res = await pool.query('SELECT NOW() AS current_time;');
    return {
      connected: true,
      timestamp: res.rows[0].current_time,
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message,
    };
  }
};

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client:', err.message);
});

module.exports = {
  pool,
  query,
  testConnection,
};
