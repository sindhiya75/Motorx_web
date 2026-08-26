const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { validationResult } = require('express-validator');
const dotenv = require('dotenv');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'motorx_super_secret_jwt_key_2026';

/**
 * @desc Admin Login Handler
 */
const adminLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  try {
    const adminRes = await pool.query(
      `SELECT * FROM admins WHERE LOWER(email) = LOWER($1)`,
      [email.trim()]
    );

    if (adminRes.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const admin = adminRes.rows[0];

    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Admin account has been deactivated. Please contact Super Admin.'
      });
    }

    const isMatch = await bcrypt.compare(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Update last_login timestamp
    await pool.query(
      `UPDATE admins SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
      [admin.id]
    );

    // Sign JWT Token
    const payload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: new Date()
      }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get Logged-in Admin Profile
 */
const getAdminProfile = async (req, res, next) => {
  try {
    const adminRes = await pool.query(
      `SELECT id, name, email, role, is_active, last_login, created_at FROM admins WHERE id = $1`,
      [req.admin.id]
    );

    if (adminRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: adminRes.rows[0]
    });

  } catch (err) {
    next(err);
  }
};

/**
 * @desc Change Authenticated Admin Password
 */
const changeAdminPassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Both current password and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }

    const adminRes = await pool.query(
      `SELECT * FROM admins WHERE id = $1`,
      [req.admin.id]
    );

    if (adminRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Admin user not found'
      });
    }

    const admin = adminRes.rows[0];

    const isMatch = await bcrypt.compare(currentPassword, admin.password_hash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Incorrect current password'
      });
    }

    const salt = await bcrypt.genSalt(10);
    const newHash = await bcrypt.hash(newPassword, salt);

    await pool.query(
      `UPDATE admins SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [newHash, admin.id]
    );

    return res.status(200).json({
      success: true,
      message: 'Admin password updated successfully'
    });

  } catch (err) {
    next(err);
  }
};

module.exports = {
  adminLogin,
  getAdminProfile,
  changeAdminPassword
};

