import React from 'react';
import { formatINR } from '../utils/formatINR';
import { calculateCartSummary } from '../utils/calculations';
import { ShieldCheck, Truck, Tag } from 'lucide-react';

export default function OrderSummary({ cartItems = [], shippingMethod = 'standard', couponCode = '', onApplyCoupon }) {
  const summary = calculateCartSummary(cartItems, shippingMethod, couponCode);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-card space-y-4">
      <h3 className="text-base font-bold text-navy border-b border-gray-200 pb-3">
        Order Summary ({summary.itemCount} items)
      </h3>

      <div className="space-y-2.5 text-xs sm:text-sm text-gray-600">
        <div className="flex justify-between">
          <span>Item Subtotal</span>
          <span className="font-semibold text-gray-900">{formatINR(summary.subtotal)}</span>
        </div>

        {summary.discount > 0 && (
          <div className="flex justify-between text-emerald-600 font-medium">
            <span className="flex items-center gap-1">
              <Tag className="w-3.5 h-3.5" /> Promo Discount
            </span>
            <span>- {formatINR(summary.discount)}</span>
          </div>
        )}

        <div className="flex justify-between">
          <span>Estimated GST (18%)</span>
          <span className="font-semibold text-gray-900">{formatINR(summary.gst)}</span>
        </div>

        <div className="flex justify-between">
          <span className="flex items-center gap-1">
            <Truck className="w-3.5 h-3.5 text-gray-400" /> Shipping Charge
          </span>
          <span className={summary.shipping === 0 ? "font-bold text-emerald-600" : "font-semibold text-gray-900"}>
            {summary.shipping === 0 ? "FREE Shipping" : formatINR(summary.shipping)}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3 mt-3 flex justify-between items-baseline">
          <span className="text-base font-bold text-navy">Total Payable</span>
          <span className="text-xl font-bold text-primary">{formatINR(summary.grandTotal)}</span>
        </div>
      </div>

      {/* Trust reassurance badge */}
      <div className="bg-blue-50/70 rounded-xl p-3 border border-blue-100 flex items-center gap-2 text-xs text-navy">
        <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
        <span>GST Invoice included with Pan-India tracking & genuine component warranty.</span>
      </div>
    </div>
  );
}
