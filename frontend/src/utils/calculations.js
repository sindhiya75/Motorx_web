/**
 * Utility functions for e-commerce cart calculations: subtotal, GST (18%), shipping, discounts.
 */

export const GST_RATE = 0.18;
export const FREE_SHIPPING_THRESHOLD = 1999;
export const STANDARD_SHIPPING_FEE = 99;
export const EXPRESS_SHIPPING_FEE = 249;

export function calculateCartSummary(cartItems = [], shippingMethod = 'standard', couponCode = '') {
  const subtotal = cartItems.reduce((acc, item) => {
    // If product is Price on Request or missing price, ignore
    if (!item.price && !item.salePrice) return acc;
    const priceToUse = item.salePrice || item.price;
    return acc + priceToUse * item.quantity;
  }, 0);

  // Apply Coupon code if valid
  let discount = 0;
  const cleanCoupon = couponCode ? couponCode.trim().toUpperCase() : '';
  if (cleanCoupon === 'MOTORX10') {
    discount = Math.round(subtotal * 0.10);
  } else if (cleanCoupon === 'FIRST500' && subtotal >= 2000) {
    discount = 500;
  }

  const taxableAmount = Math.max(0, subtotal - discount);
  // GST calculation (18% Excl. GST model)
  const gst = Math.round(taxableAmount * GST_RATE);

  // Shipping fees
  let shipping = 0;
  if (subtotal > 0) {
    if (cleanCoupon === 'FREESHIP' || subtotal >= FREE_SHIPPING_THRESHOLD) {
      shipping = 0;
    } else {
      shipping = shippingMethod === 'express' ? EXPRESS_SHIPPING_FEE : STANDARD_SHIPPING_FEE;
    }
  }

  const grandTotal = taxableAmount + gst + shipping;

  return {
    subtotal,
    discount,
    taxableAmount,
    gst,
    shipping,
    grandTotal,
    itemCount: cartItems.reduce((sum, item) => sum + item.quantity, 0),
    isFreeShippingEligible: subtotal >= FREE_SHIPPING_THRESHOLD,
    amountForFreeShipping: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
  };
}
