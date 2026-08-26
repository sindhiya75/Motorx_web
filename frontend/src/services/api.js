import { products as localProducts } from '../data/products';
import { categories as localCategories } from '../data/categories';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

/**
 * Fetch all active categories from backend REST API
 */
export async function fetchCategories() {
  try {
    const res = await fetch(`${API_BASE_URL}/categories`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch categories`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data) && json.data.length > 0) {
      return json.data;
    }
  } catch (err) {
    console.warn('Backend categories API unreachable, using local fallback:', err.message);
  }
  return localCategories;
}

/**
 * Fetch all active brands from backend REST API
 */
export async function fetchBrands() {
  try {
    const res = await fetch(`${API_BASE_URL}/brands`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch brands`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json.data;
    }
  } catch (err) {
    console.warn('Backend brands API unreachable, using local fallback:', err.message);
  }
  return [
    { id: 1, name: 'MOTORX', slug: 'motorx' },
    { id: 2, name: 'AeroDrive', slug: 'aerodrive' },
    { id: 3, name: 'FluxMotion', slug: 'fluxmotion' },
    { id: 4, name: 'SkyTorque', slug: 'skytorque' },
    { id: 5, name: 'ProSpin', slug: 'prospin' },
    { id: 6, name: 'TitanDrive', slug: 'titandrive' },
    { id: 7, name: 'HeavyLift', slug: 'heavylift' }
  ];
}

/**
 * Fetch paginated & filtered products from backend REST API
 */
export async function fetchProducts(params = {}) {
  try {
    const query = new URLSearchParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        query.append(key, params[key]);
      }
    });

    const queryString = query.toString();
    const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;
    const res = await fetch(url);
    
    if (!res.ok) throw new Error(`HTTP ${res.status}: Failed to fetch products`);
    const json = await res.json();
    if (json.success && Array.isArray(json.data)) {
      return json;
    }
  } catch (err) {
    console.warn('Backend products API unreachable, using local fallback:', err.message);
  }

  // Local dataset fallback handling
  let result = [...localProducts];

  if (params.category && params.category !== 'All Motors') {
    result = result.filter(p => p.category.toLowerCase() === params.category.toLowerCase());
  }

  if (params.search) {
    const q = params.search.toLowerCase();
    result = result.filter(p => 
      p.name.toLowerCase().includes(q) ||
      p.sku.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.brand.toLowerCase().includes(q)
    );
  }

  const page = Number(params.page || 1);
  const limit = Number(params.limit || 12);
  const total = result.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const start = (page - 1) * limit;

  return {
    success: true,
    data: result.slice(start, start + limit),
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
}

/**
 * Fetch single product details by slug from backend REST API
 */
export async function fetchProductBySlug(slug) {
  try {
    const res = await fetch(`${API_BASE_URL}/products/${encodeURIComponent(slug)}`);
    if (!res.ok) throw new Error(`HTTP ${res.status}: Product not found`);
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.warn('Backend product details API unreachable, using local fallback:', err.message);
  }

  return localProducts.find(p => p.slug === slug) || null;
}

/**
 * Submit guest checkout order to backend REST API
 */
export async function createOrder(orderPayload) {
  const res = await fetch(`${API_BASE_URL}/orders/checkout`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(orderPayload)
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    const msg = json.message || (json.errors && json.errors[0]?.msg) || 'Failed to process checkout order';
    throw new Error(msg);
  }

  return json.data;
}

/**
 * Fetch order details by order number for tracking
 */
export async function fetchOrderByNumber(orderNumber) {
  try {
    const res = await fetch(`${API_BASE_URL}/orders/${encodeURIComponent(orderNumber)}`);
    if (!res.ok) throw new Error(`Order #${orderNumber} not found`);
    const json = await res.json();
    if (json.success && json.data) {
      return json.data;
    }
  } catch (err) {
    console.warn('Backend order lookup failed:', err.message);
  }
  return null;
}

/**
 * Initialize payment order (COD or Razorpay)
 */
export async function createPaymentOrder(paymentPayload) {
  const res = await fetch(`${API_BASE_URL}/payments/create-order`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(paymentPayload)
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    const msg = json.message || (json.errors && json.errors[0]?.msg) || 'Failed to initialize payment order';
    throw new Error(msg);
  }

  return json;
}

/**
 * Verify Razorpay payment signature
 */
export async function verifyPayment(verifyPayload) {
  const res = await fetch(`${API_BASE_URL}/payments/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(verifyPayload)
  });

  const json = await res.json();
  if (!res.ok || !json.success) {
    const msg = json.message || 'Payment signature verification failed';
    throw new Error(msg);
  }

  return json.data;
}
