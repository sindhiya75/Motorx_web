const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');

dotenv.config();

const { testConnection } = require('./config/database');
const { apiLimiter } = require('./middleware/rateLimiter');
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const healthRoutes = require('./routes/healthRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const adminAuthRoutes = require('./routes/adminAuthRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Security Middlewares
app.use(helmet());

// CORS Configuration
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://localhost:5175'
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
  })
);

// Body Parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply Rate Limiting
app.use('/api/', apiLimiter);

// API Routes
app.use('/api/health', healthRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/admin/auth', adminAuthRoutes);
app.use('/api/admin', adminRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to Seval Drones E-Commerce API',
    endpoints: {
      health: '/api/health',
      categories: '/api/categories',
      brands: '/api/brands',
      products: '/api/products',
      orders: '/api/orders',
      payments: '/api/payments',
      adminAuth: '/api/admin/auth',
      adminManagement: '/api/admin'
    }
  });
});

// 404 & Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start Server & Test Database Connection
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, async () => {
    console.log(`🚀 MOTORX Backend Server running on http://localhost:${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);

    // Test Database Connection on startup
    const dbTest = await testConnection();
    if (dbTest.connected) {
      console.log(`✅ PostgreSQL Connected successfully to database "${process.env.PGDATABASE || 'motorx'}" on port ${process.env.PGPORT || 5432}`);
    } else {
      console.log(`ℹ️ Note: Database connection attempt returned: ${dbTest.error}`);
    }
  });
}

module.exports = app;
