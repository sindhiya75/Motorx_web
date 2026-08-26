/**
 * Formats a numeric value into Indian Rupee currency format (INR).
 * Uses the Indian numbering system (thousands, lakhs, crores).
 * Example: 2499 -> ₹2,499; 125000 -> ₹1,25,000
 * @param {number|string} amount
 * @param {boolean} includeSymbol - default true
 * @returns {string}
 */
export function formatINR(amount, includeSymbol = true) {
  if (amount === null || amount === undefined || isNaN(amount)) {
    return includeSymbol ? '₹0' : '0';
  }
  const num = Math.round(Number(amount));
  const formatted = num.toLocaleString('en-IN');
  return includeSymbol ? `₹${formatted}` : formatted;
}

export default formatINR;
