const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Admin fetch wrapper with Authorization Bearer header
 */
export async function adminFetch(endpoint, options = {}) {
  const token = localStorage.getItem('motorx_admin_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers
  };

  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    const msg = json.message || 'Admin API request failed';
    throw new Error(msg);
  }

  return json;
}

/**
 * Fetch current admin profile
 */
export async function fetchAdminProfile() {
  return adminFetch('/admin/auth/me');
}

/**
 * Fetch Store Analytics Summary Metrics
 */
export async function fetchAdminAnalyticsSummary() {
  const json = await adminFetch('/admin/analytics/summary');
  return json.data;
}

/**
 * Fetch Admin Products Catalog
 */
export async function fetchAdminProducts(params = {}) {
  const query = new URLSearchParams();
  Object.keys(params).forEach(k => {
    if (params[k] !== undefined && params[k] !== '') query.append(k, params[k]);
  });
  const qStr = query.toString();
  return adminFetch(`/admin/products${qStr ? `?${qStr}` : ''}`);
}

/**
 * Create a new Product
 */
export async function createAdminProduct(productData) {
  return adminFetch('/admin/products', {
    method: 'POST',
    body: JSON.stringify(productData)
  });
}

/**
 * Update an existing Product
 */
export async function updateAdminProduct(productId, productData) {
  return adminFetch(`/admin/products/${productId}`, {
    method: 'PUT',
    body: JSON.stringify(productData)
  });
}

/**
 * Delete a Product
 */
export async function deleteAdminProduct(productId) {
  return adminFetch(`/admin/products/${productId}`, {
    method: 'DELETE'
  });
}

/**
 * Fetch Admin Guest Orders
 */
export async function fetchAdminOrders(params = {}) {
  const query = new URLSearchParams();
  Object.keys(params).forEach(k => {
    if (params[k] !== undefined && params[k] !== '') query.append(k, params[k]);
  });
  const qStr = query.toString();
  return adminFetch(`/admin/orders${qStr ? `?${qStr}` : ''}`);
}

/**
 * Fetch Order Details by ID for Admin
 */
export async function fetchAdminOrderDetails(orderId) {
  const json = await adminFetch(`/admin/orders/${orderId}`);
  return json.data;
}

/**
 * Update Order Status
 */
export async function updateAdminOrderStatus(orderId, status) {
  return adminFetch(`/admin/orders/${orderId}/status`, {
    method: 'PUT',
    body: JSON.stringify({ status })
  });
}

/**
 * Fetch Inventory Stock Levels
 */
export async function fetchAdminInventory(lowStockOnly = false) {
  const json = await adminFetch(`/admin/inventory?lowStockOnly=${lowStockOnly}`);
  return json.data;
}

/**
 * Update Inventory Stock Quantity
 */
export async function updateAdminStock(productId, stockQuantity, lowStockThreshold = 5) {
  return adminFetch(`/admin/inventory/${productId}`, {
    method: 'PUT',
    body: JSON.stringify({ stockQuantity, lowStockThreshold })
  });
}

/**
 * Change Admin Password
 */
export async function changeAdminPassword(currentPassword, newPassword) {
  return adminFetch('/admin/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify({ currentPassword, newPassword })
  });
}

/**
 * Fetch Aggregated Customers from Backend
 */
export async function fetchAdminCustomers() {
  const json = await adminFetch('/admin/customers');
  return json.data;
}

