/**
 * Image normalization and error-handling utilities for MOTORX Web.
 * Ensures consistent resolution of product images from frontend/public/products.
 */

export const DEFAULT_FALLBACK_IMAGE = '/products/cured_products/Carbon_Fiber_Sheet.jpeg';

/**
 * Normalizes any image URL or path across the frontend.
 *
 * Rules:
 * 1. Returns DEFAULT_FALLBACK_IMAGE if input is empty, null, or undefined.
 * 2. Preserves valid absolute URLs (http://, https://, data:, blob:).
 * 3. Replaces all backslashes with forward slashes.
 * 4. Strips 'frontend/public/', '/frontend/public/', 'public/', '/public/', './public/' prefixes.
 * 5. Replaces any duplicate '/products/products/' with '/products/'.
 * 6. Ensures a leading slash '/' so relative paths don't break in nested routes (e.g., /category/:slug, /product/:id).
 * 7. Normalizes folder typos and casing to match actual disk directories.
 *
 * @param {string} url - Raw image path or URL
 * @returns {string} - Clean, browser-accessible image path
 */
export function normalizeProductImageUrl(url) {
  if (!url || typeof url !== 'string' || url.trim() === '') {
    return DEFAULT_FALLBACK_IMAGE;
  }

  let cleaned = url.trim();

  // If it is a full web URL, data URI, or blob URI, return as-is
  if (/^(https?:\/\/|data:|blob:)/i.test(cleaned)) {
    return cleaned;
  }

  // Replace all backslashes with forward slashes
  cleaned = cleaned.replace(/\\/g, '/');

  // Strip frontend/public, public prefixes
  cleaned = cleaned.replace(/^(\.?\/)?(frontend\/)?public\//i, '/');

  // Ensure single leading slash
  if (!cleaned.startsWith('/')) {
    cleaned = '/' + cleaned;
  }

  // Remove duplicate products prefix
  cleaned = cleaned.replace(/^\/products\/products\//i, '/products/');

  // Fix folder casing / typos / name variations to match actual public disk folder names
  cleaned = cleaned.replace(/\/products\/(epoxy_resin|epoxy-resin|Epoxy_Resin)\//i, '/products/Epoxy_Resin/');
  cleaned = cleaned.replace(/\/products\/(vacuum_bagging_consumables|vacuum-bagging-consumables|vacuum_bagging|vacuum-bagging|vaccum_bagging|vaccum-bagging)\//i, '/products/vaccum_bagging/');
  cleaned = cleaned.replace(/\/products\/(moulds_and_patterns|moulds-and-patterns|moulds_patterns|moulds-patterns|moulds)\//i, '/products/moulds_patterns/');
  cleaned = cleaned.replace(/\/products\/(core_materials|core-materials)\//i, '/products/core_materials/');
  cleaned = cleaned.replace(/\/products\/(pultruded_products|pultruded-products)\//i, '/products/pultruded_products/');
  cleaned = cleaned.replace(/\/products\/(cured_products|cured-products)\//i, '/products/cured_products/');
  cleaned = cleaned.replace(/\/products\/(tubes|tube)\//i, '/products/tubes/');

  return cleaned;
}

/**
 * Safe onError event handler for <img> elements.
 * Prevents infinite re-triggering loops by ensuring the fallback is only set once.
 *
 * @param {React.SyntheticEvent<HTMLImageElement, Event>} event - Image error event
 * @param {string} [fallback=DEFAULT_FALLBACK_IMAGE] - Safe fallback URL
 */
export function handleImageError(event, fallback = DEFAULT_FALLBACK_IMAGE) {
  if (event && event.currentTarget) {
    const currentSrc = event.currentTarget.src || '';
    if (!currentSrc.includes(fallback)) {
      event.currentTarget.src = fallback;
    }
  }
}
