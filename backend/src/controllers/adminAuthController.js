const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
const { validationResult } = require('express-validator');
const dotenv = require('dotenv');
const { sendPasswordResetOtp } = require('../services/emailService');

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'motorx_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

/**
 * @desc Admin Login Handler
 */
const adminLogin = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(e => ({ field: e.path || e.param, message: e.msg }))
    });
  }

  const { email, password } = req.body;

  try {
    const adminRes = await pool.query(
      `SELECT id, name, email, password_hash, role, is_active FROM admins WHERE LOWER(email) = LOWER($1)`,
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

    // Sign JWT Token with expiration
    const payload = {
      id: admin.id,
      name: admin.name,
      email: admin.email,
      role: admin.role
    };

    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

    return res.status(200).json({
      success: true,
      message: 'Admin authentication successful',
      token,
      admin: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: admin.role,
        lastLogin: new Date().toISOString()
      }
    });

  } catch (err) {
    next(err);
  }
};

/**
 * @desc Step 1: Request 2-Step Verification OTP for Password Recovery
 */
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email || !email.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Admin email is required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const adminRes = await pool.query(
      `SELECT id, name, email, is_active FROM admins WHERE LOWER(email) = $1`,
      [cleanEmail]
    );

    if (adminRes.rows.length === 0) {
      // Return a safe message to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an active administrator exists with that email, a 2-step verification code has been dispatched.'
      });
    }

    const admin = adminRes.rows[0];
    if (!admin.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Admin account is deactivated. Contact Super Admin.'
      });
    }

    // Generate secure 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await pool.query(
      `UPDATE admins 
       SET reset_code = $1, reset_code_expires_at = $2, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $3`,
      [otpCode, expiresAt, admin.id]
    );

    // Send email via emailService
    const emailResult = await sendPasswordResetOtp(admin.email, admin.name, otpCode);

    return res.status(200).json({
      success: true,
      message: `A 6-digit verification code has been sent to ${admin.email}.`,
      expiresIn: '10 minutes',
      codePreview: emailResult.codePreview
    });

  } catch (err) {
    next(err);
  }
};

/**
 * @desc Step 1.5: Real-time Check of 2-Step OTP Code
 */
const verifyResetCode = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email and 6-digit verification code are required'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    const adminRes = await pool.query(
      `SELECT id, reset_code, reset_code_expires_at 
       FROM admins 
       WHERE LOWER(email) = $1 AND is_active = true`,
      [cleanEmail]
    );

    if (adminRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or expired request'
      });
    }

    const admin = adminRes.rows[0];

    if (!admin.reset_code || admin.reset_code !== cleanCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid verification code. Please check your email and try again.'
      });
    }

    if (new Date() > new Date(admin.reset_code_expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Verification code confirmed successfully.'
    });

  } catch (err) {
    next(err);
  }
};

/**
 * @desc Step 2: 2-Step Verification + Set New Password
 */
const resetPasswordWithCode = async (req, res, next) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, verification code, and new password are required'
      });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.toString().trim();

    const adminRes = await pool.query(
      `SELECT id, name, reset_code, reset_code_expires_at 
       FROM admins 
       WHERE LOWER(email) = $1 AND is_active = true`,
      [cleanEmail]
    );

    if (adminRes.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid email or reset request'
      });
    }

    const admin = adminRes.rows[0];

    if (!admin.reset_code || admin.reset_code !== cleanCode) {
      return res.status(400).json({
        success: false,
        message: 'Invalid 2-step verification code. Please check your email.'
      });
    }

    if (new Date() > new Date(admin.reset_code_expires_at)) {
      return res.status(400).json({
        success: false,
        message: 'Verification code has expired. Please request a new code.'
      });
    }

    // Hash new password
    const saltRounds = 12;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password and clear reset code
    await pool.query(
      `UPDATE admins 
       SET password_hash = $1, reset_code = NULL, reset_code_expires_at = NULL, updated_at = CURRENT_TIMESTAMP 
       WHERE id = $2`,
      [newHash, admin.id]
    );

    console.log(`✅ [MOTORX] Admin password successfully reset via 2FA for ${cleanEmail}`);

    return res.status(200).json({
      success: true,
      message: 'Password has been reset successfully! You can now sign in with your new credentials.'
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
      `SELECT id, name, email, role, is_active, last_login, created_at, updated_at FROM admins WHERE id = $1`,
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

    if (typeof newPassword !== 'string' || newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long'
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: 'New password must be different from current password'
      });
    }

    const adminRes = await pool.query(
      `SELECT id, password_hash FROM admins WHERE id = $1`,
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

    const saltRounds = 12;
    const newHash = await bcrypt.hash(newPassword, saltRounds);

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

/**
 * @desc Admin Logout (Stateless token revocation / acknowledgment)
 */
const adminLogout = async (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'Admin logged out successfully'
  });
};

module.exports = {
  adminLogin,
  forgotPassword,
  verifyResetCode,
  resetPasswordWithCode,
  getAdminProfile,
  changeAdminPassword,
  adminLogout
};


