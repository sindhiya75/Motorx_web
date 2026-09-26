const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'motorx_super_secret_jwt_key_2026';

const { pool } = require('../config/database');

/**
 * Middleware to verify JWT Token for Admin Routes
 */
const verifyAdminToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided.'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);

    // Verify admin is still valid and active in database
    const adminRes = await pool.query(
      `SELECT id, name, email, role, is_active FROM admins WHERE id = $1`,
      [decoded.id]
    );

    if (adminRes.rows.length === 0 || !adminRes.rows[0].is_active) {
      return res.status(401).json({
        success: false,
        message: 'Admin account is invalid, suspended, or no longer exists.'
      });
    }

    req.admin = adminRes.rows[0];
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Invalid or expired admin authentication token.'
    });
  }
};

/**
 * Middleware to restrict access based on admin roles (e.g. SUPERADMIN, ADMIN)
 */
const requireAdminRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.admin || !allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Insufficient permissions.'
      });
    }
    next();
  };
};

module.exports = {
  verifyAdminToken,
  requireAdminRole
};
