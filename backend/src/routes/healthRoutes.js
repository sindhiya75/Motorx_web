const express = require('express');
const router = express.Router();
const { testConnection } = require('../config/database');

/**
 * @route   GET /api/health
 * @desc    Health check endpoint verifying Express server & PostgreSQL database
 * @access  Public
 */
router.get('/', async (req, res) => {
  const dbStatus = await testConnection();

  if (dbStatus.connected) {
    return res.status(200).json({
      success: true,
      message: 'MOTORX API is running',
      database: 'connected'
    });
  } else {
    return res.status(503).json({
      success: false,
      message: 'MOTORX API is running',
      database: 'disconnected',
      error: dbStatus.error
    });
  }
});

module.exports = router;
