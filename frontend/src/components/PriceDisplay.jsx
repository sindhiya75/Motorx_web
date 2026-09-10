import React from 'react';
import { formatINR } from '../utils/formatINR';

export default function PriceDisplay({
  price,
  salePrice,
  gstIncluded = false,
  status = "IN_STOCK",
  size = "md"
}) {
  if (status === "PRICE_ON_REQUEST") {
    return (
      <div className="flex items-center gap-2">
        <span className={`font-bold text-navy ${size === 'lg' ? 'text-2xl' : 'text-base'}`}>
          Price on Request
        </span>
      </div>
    );
  }

  const currentPrice = salePrice || price;
  const originalPrice = salePrice ? price : null;
  const discountPercent = originalPrice
    ? Math.round(((originalPrice - salePrice) / originalPrice) * 100)
    : 0;

  const priceTextSize = size === 'lg' ? 'text-3xl' : size === 'sm' ? 'text-sm' : 'text-lg';

  return (
    <div className="flex flex-wrap items-baseline gap-2">
      <span className={`font-bold text-navy ${priceTextSize}`}>
        {formatINR(currentPrice)}
      </span>

      {originalPrice && (
        <span className="text-xs sm:text-sm text-slate-500 font-medium line-through">
          {formatINR(originalPrice)}
        </span>
      )}

      {discountPercent > 0 && (
        <span className="text-xs font-bold text-emerald-800 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-300">
          {discountPercent}% OFF
        </span>
      )}

      <span className="text-xs font-semibold text-slate-600 w-full">
        {gstIncluded ? "Incl. GST" : "Excl. GST"}
      </span>
    </div>
  );
}
