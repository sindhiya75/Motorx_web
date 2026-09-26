const express = require('express');
const router = express.Router();
const { verifyAdminToken } = require('../middleware/authMiddleware');

const { 
  getAdminProducts, 
  createAdminProduct, 
  updateAdminProduct, 
  deleteAdminProduct,
  createAdminCategory,
  createAdminBrand
} = require('../controllers/adminProductController');
const { getAdminOrders, getAdminOrderDetails, updateAdminOrderStatus, getAdminCustomers } = require('../controllers/adminOrderController');
const { getAdminInventory, updateAdminStock } = require('../controllers/adminInventoryController');
const { getAdminAnalyticsSummary } = require('../controllers/adminAnalyticsController');

// All routes below require valid Admin JWT Token
router.use(verifyAdminToken);

// Analytics
router.get('/analytics/summary', getAdminAnalyticsSummary);

// Categories & Brands Management
router.post('/categories', createAdminCategory);
router.post('/brands', createAdminBrand);

// Products Management
router.get('/products', getAdminProducts);
router.post('/products', createAdminProduct);
router.put('/products/:id', updateAdminProduct);
router.delete('/products/:id', deleteAdminProduct);

// Orders Management
router.get('/orders', getAdminOrders);
router.get('/orders/:id', getAdminOrderDetails);
router.put('/orders/:id/status', updateAdminOrderStatus);

// Customers Management
router.get('/customers', getAdminCustomers);

// Inventory Control
router.get('/inventory', getAdminInventory);
router.put('/inventory/:productId', updateAdminStock);

module.exports = router;

